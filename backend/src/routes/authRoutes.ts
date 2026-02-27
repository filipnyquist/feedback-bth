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
    
    // Check if user already has a valid JWT (duplicate callback)
    const cookies = req.headers.get("cookie") || "";
    const authToken = cookies.split(";").find(c => c.trim().startsWith("auth_token="));
    if (authToken) {
      console.log("[AUTH] User already has auth token, redirecting to admin (duplicate callback ignored)");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_ORIGIN}/admin`,
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
          ...corsHeaders,
        },
      });
    }
    
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
      console.error("[AUTH] Token exchange failed - likely duplicate callback or expired state");
      // Redirect to login page instead of showing error
      // This handles duplicate callbacks gracefully
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_ORIGIN}`,
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
          ...corsHeaders,
        },
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
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0",
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
