import { getProgramById } from "../db";

export function handleGetProgramById(
  req: Request,
  id: string,
  corsHeaders: Record<string, string>
): Response {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") ?? "sv";

  const result = getProgramById(id);
  if (!result) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { group, ...program } = result;

  return new Response(
    JSON.stringify({
      id: program.id,
      code: program.code,
      name: lang === "en" ? program.name_en || program.name_sv : program.name_sv || program.name_en,
      name_sv: program.name_sv,
      name_en: program.name_en,
      group_id: program.group_id,
      group: {
        id: group.id,
        display_name:
          lang === "en"
            ? group.display_name_en || group.display_name_sv
            : group.display_name_sv || group.display_name_en,
        display_name_sv: group.display_name_sv,
        display_name_en: group.display_name_en,
        about_markdown:
          lang === "en"
            ? group.about_markdown_en || group.about_markdown_sv
            : group.about_markdown_sv || group.about_markdown_en,
        about_markdown_sv: group.about_markdown_sv,
        about_markdown_en: group.about_markdown_en,
        form_url:
          lang === "en"
            ? group.form_url_en || group.form_url_sv
            : group.form_url_sv || group.form_url_en,
        form_url_sv: group.form_url_sv,
        form_url_en: group.form_url_en,
        updated_at: group.updated_at,
      },
    }),
    {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}
