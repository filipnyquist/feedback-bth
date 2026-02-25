import { getAllPrograms } from "../db";

export function handleGetPrograms(req: Request, corsHeaders: Record<string, string>): Response {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") ?? "sv";

  const programs = getAllPrograms();

  const data = programs.map((p) => ({
    id: p.id,
    code: p.code,
    name: lang === "en" ? p.name_en || p.name_sv : p.name_sv || p.name_en,
    name_sv: p.name_sv,
    name_en: p.name_en,
    group_id: p.group_id,
    group_name:
      lang === "en"
        ? p.group_display_name_en || p.group_display_name_sv
        : p.group_display_name_sv || p.group_display_name_en,
    group_logo_url: p.group_logo_url,
  }));

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
