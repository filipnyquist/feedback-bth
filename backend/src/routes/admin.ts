import { requireAuth, JwtPayload } from "../auth";
import {
  getGroupsByEntraIds,
  getGroupById,
  getProgramsByGroupId,
  updateGroup,
  upsertProgram,
  deleteProgramsByGroupId,
  Program,
} from "../db";
import { randomUUID } from "crypto";

export async function handleGetMe(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const payload = authResult as JwtPayload;

  const groups = getGroupsByEntraIds(payload.groupIds);

  const result = await Promise.all(
    groups.map(async (g) => {
      const programs = getProgramsByGroupId(g.id);
      return {
        id: g.id,
        entra_group_id: g.entra_group_id,
        display_name_sv: g.display_name_sv,
        display_name_en: g.display_name_en,
        about_markdown_sv: g.about_markdown_sv,
        about_markdown_en: g.about_markdown_en,
        form_url_sv: g.form_url_sv,
        form_url_en: g.form_url_en,
        updated_at: g.updated_at,
        programs,
      };
    })
  );

  return new Response(
    JSON.stringify({ userId: payload.userId, email: payload.email, groups: result }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

export async function handleUpdateGroup(
  req: Request,
  groupId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const payload = authResult as JwtPayload;

  const group = getGroupById(groupId);
  if (!group) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Ensure the user's Entra group IDs include this group's entra_group_id
  if (!group.entra_group_id || !payload.groupIds.includes(group.entra_group_id)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const body = (await req.json()) as {
    display_name_sv: string;
    display_name_en: string;
    about_markdown_sv: string;
    about_markdown_en: string;
    form_url_sv: string;
    form_url_en: string;
    programs: Array<{ id?: string; code: string; name_sv: string; name_en: string }>;
  };

  updateGroup(groupId, {
    display_name_sv: body.display_name_sv ?? group.display_name_sv,
    display_name_en: body.display_name_en ?? group.display_name_en,
    about_markdown_sv: body.about_markdown_sv ?? group.about_markdown_sv,
    about_markdown_en: body.about_markdown_en ?? group.about_markdown_en,
    form_url_sv: body.form_url_sv ?? group.form_url_sv,
    form_url_en: body.form_url_en ?? group.form_url_en,
  });

  const programs: Program[] = (body.programs ?? []).map((p) => ({
    id: p.id ?? randomUUID(),
    code: p.code,
    name_sv: p.name_sv,
    name_en: p.name_en,
    group_id: groupId,
  }));

  const keepIds = programs.map((p) => p.id);
  deleteProgramsByGroupId(groupId, keepIds);
  for (const program of programs) {
    upsertProgram(program);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
