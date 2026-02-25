import { generateLoginUrl, exchangeCodeForToken, createJwt } from "../auth";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

export function handleAuthLogin(corsHeaders: Record<string, string>): Response {
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
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response(JSON.stringify({ error: "Missing code or state" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const userInfo = await exchangeCodeForToken(code, state);
  if (!userInfo) {
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const jwt = await createJwt(userInfo);

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${FRONTEND_ORIGIN}/admin`,
      "Set-Cookie": `auth_token=${jwt}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`,
      ...corsHeaders,
    },
  });
}
