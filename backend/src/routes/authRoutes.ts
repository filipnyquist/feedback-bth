import { generateLoginUrl, exchangeCodeForToken, createJwt } from "../auth";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

export function handleAuthLogin(corsHeaders: Record<string, string>): Response {
  console.log("[AUTH] Login initiated, redirecting to Microsoft");
  const { url } = generateLoginUrl();
  return new Response(null, {
    status: 302,
    headers: { Location: url, ...corsHeaders },
  });
}

export async function handleAuthCallback(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    console.log("[AUTH] Callback received");
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      console.error("[AUTH] Callback missing code or state");
      return new Response(JSON.stringify({ error: "Missing code or state" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("[AUTH] Exchanging code for token...");
    const userInfo = await exchangeCodeForToken(code, state);
    if (!userInfo) {
      console.error("[AUTH] Token exchange failed");
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("[AUTH] Creating JWT for user:", userInfo.email);
    const jwt = await createJwt(userInfo);

    console.log("[AUTH] Redirecting to:", `${FRONTEND_ORIGIN}/admin`);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${FRONTEND_ORIGIN}/admin`,
        "Set-Cookie": `auth_token=${jwt}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("[AUTH] Error in auth callback:", error);
    return new Response(JSON.stringify({ error: "Internal server error during authentication" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
