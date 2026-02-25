import { runMigrations } from "./db";
import { handleAuthLogin, handleAuthCallback } from "./routes/authRoutes";
import { handleGetPrograms } from "./routes/programs";
import { handleGetProgramById } from "./routes/programById";
import { handleGetMe, handleUpdateGroup, handleCreateGroup, handleDeleteGroup } from "./routes/admin";
import { join } from "path";
import { existsSync } from "fs";

// Run migrations on startup
runMigrations();

const PORT = parseInt(process.env.PORT ?? "3001");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const FRONTEND_DIST = join(import.meta.dir, "../../frontend/dist");

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  };
}

function getOrigin(req: Request): string {
  return req.headers.get("origin") ?? FRONTEND_ORIGIN;
}

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const cors = corsHeaders(getOrigin(req));

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // ---- Auth routes ----
    if (method === "GET" && path === "/api/auth/login") {
      return handleAuthLogin(cors);
    }

    if (method === "GET" && path === "/api/auth/callback") {
      return handleAuthCallback(req, cors);
    }

    if (method === "GET" && path === "/api/auth/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": "auth_token=; HttpOnly; Path=/; Max-Age=0",
          ...cors,
        },
      });
    }

    // ---- Program routes ----
    if (method === "GET" && path === "/api/programs") {
      return handleGetPrograms(req, cors);
    }

    const programMatch = path.match(/^\/api\/programs\/([^/]+)$/);
    if (method === "GET" && programMatch) {
      return handleGetProgramById(req, programMatch[1], cors);
    }

    // ---- Admin routes ----
    if (method === "GET" && path === "/api/me") {
      return handleGetMe(req, cors);
    }

    if (method === "POST" && path === "/api/groups") {
      return handleCreateGroup(req, cors);
    }

    const groupMatch = path.match(/^\/api\/groups\/([^/]+)$/);
    if (method === "PUT" && groupMatch) {
      return handleUpdateGroup(req, groupMatch[1], cors);
    }

    if (method === "DELETE" && groupMatch) {
      return handleDeleteGroup(req, groupMatch[1], cors);
    }

    // ---- Serve static frontend in production ----
    if (existsSync(FRONTEND_DIST)) {
      // Try to serve static file
      const filePath = join(FRONTEND_DIST, path === "/" ? "index.html" : path);
      if (existsSync(filePath) && !path.startsWith("/api")) {
        return new Response(Bun.file(filePath));
      }
      // SPA fallback
      if (!path.startsWith("/api")) {
        const indexPath = join(FRONTEND_DIST, "index.html");
        if (existsSync(indexPath)) {
          return new Response(Bun.file(indexPath));
        }
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  },
});

console.log(`🚀 Backend running on http://localhost:${PORT}`);
