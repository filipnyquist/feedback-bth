import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";

const CLIENT_ID = process.env.CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.CLIENT_SECRET ?? "";
const TENANT_ID = process.env.TENANT_ID ?? "common";
const REDIRECT_URI = process.env.REDIRECT_URI ?? "http://localhost:3001/api/auth/callback";
const JWT_SECRET_RAW = process.env.JWT_SECRET ?? "dev-secret-change-me";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

// In-memory PKCE state store: state -> { code_verifier, created_at }
const pkceStore = new Map<string, { code_verifier: string; created_at: number }>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of pkceStore) {
    if (val.created_at < cutoff) pkceStore.delete(key);
  }
}, 10 * 60 * 1000);

function base64url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateLoginUrl(): { url: string; state: string } {
  const state = base64url(randomBytes(16));
  const code_verifier = base64url(randomBytes(32));
  const code_challenge = base64url(
    createHash("sha256").update(code_verifier).digest()
  );

  pkceStore.set(state, { code_verifier, created_at: Date.now() });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "openid email profile User.Read",
    state,
    code_challenge,
    code_challenge_method: "S256",
  });

  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`;
  return { url, state };
}

export async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<{ userId: string; email: string; groupIds: string[] } | null> {
  try {
    const entry = pkceStore.get(state);
    if (!entry) {
      console.error("PKCE state not found");
      return null;
    }
    pkceStore.delete(state);

    // Exchange authorization code for access token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: entry.code_verifier,
        }),
      }
    );

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Token exchange failed:", errorText);
      return null;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    // Fetch user info from Microsoft Graph
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!meRes.ok) {
      const errorText = await meRes.text();
      console.error("Failed to fetch user info:", errorText);
      return null;
    }

    const meData = (await meRes.json()) as { id: string; mail?: string; userPrincipalName?: string };

    // Fetch group memberships
    const groupRes = await fetch("https://graph.microsoft.com/v1.0/me/memberOf?$select=id", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!groupRes.ok) {
      const errorText = await groupRes.text();
      console.error("Failed to fetch group memberships:", errorText);
      // Don't fail auth if groups can't be fetched, just use empty array
      return {
        userId: meData.id,
        email: meData.mail ?? meData.userPrincipalName ?? "",
        groupIds: [],
      };
    }

    const groupData = (await groupRes.json()) as { value: { id: string }[] };
    const groupIds = (groupData.value ?? []).map((g) => g.id);

    console.log(`User authenticated: ${meData.mail ?? meData.userPrincipalName}, groups: ${groupIds.length}`);

    return {
      userId: meData.id,
      email: meData.mail ?? meData.userPrincipalName ?? "",
      groupIds,
    };
  } catch (error) {
    console.error("Error in exchangeCodeForToken:", error);
    return null;
  }
}

export async function createJwt(payload: {
  userId: string;
  email: string;
  groupIds: string[];
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export interface JwtPayload {
  userId: string;
  email: string;
  groupIds: string[];
  exp: number;
  iat: number;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function requireAuth(req: Request): Promise<JwtPayload | Response> {
  const token = extractToken(req);
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const payload = await verifyJwt(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return payload;
}

export function isSuperAdmin(email: string): boolean {
  const superUserEmail = process.env.SUPERUSER;
  return !!superUserEmail && email.toLowerCase() === superUserEmail.toLowerCase();
}
