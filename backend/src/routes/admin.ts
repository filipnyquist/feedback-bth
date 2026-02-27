import { requireAuth, JwtPayload, isSuperAdmin } from "../auth";
import {
  getGroupsByEntraIds,
  getAllGroups,
  getGroupById,
  getProgramsByGroupId,
  updateGroup,
  upsertProgram,
  deleteProgramsByGroupId,
  createGroup,
  deleteGroup,
  Program,
} from "../db";
import { randomUUID } from "crypto";

export async function handleGetMe(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const payload = authResult as JwtPayload;

    const groups = isSuperAdmin(payload.email)
      ? getAllGroups()
      : getGroupsByEntraIds(payload.groupIds);

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
          logo_url: g.logo_url,
          updated_at: g.updated_at,
          programs,
        };
      })
    );

    return new Response(
      JSON.stringify({ userId: payload.userId, email: payload.email, groups: result }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in handleGetMe:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user data" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function handleUpdateGroup(
  req: Request,
  groupId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
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

  // Allow superadmins to edit any group, otherwise check Entra group membership
  if (!isSuperAdmin(payload.email)) {
    if (!group.entra_group_id || !payload.groupIds.includes(group.entra_group_id)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  const body = (await req.json()) as {
    display_name_sv: string;
    display_name_en: string;
    about_markdown_sv: string;
    about_markdown_en: string;
    form_url_sv: string;
    form_url_en: string;
    logo_url: string;
    programs: Array<{ id?: string; code: string; name_sv: string; name_en: string }>;
  };

  updateGroup(groupId, {
    display_name_sv: body.display_name_sv ?? group.display_name_sv,
    display_name_en: body.display_name_en ?? group.display_name_en,
    about_markdown_sv: body.about_markdown_sv ?? group.about_markdown_sv,
    about_markdown_en: body.about_markdown_en ?? group.about_markdown_en,
    form_url_sv: body.form_url_sv ?? group.form_url_sv,
    form_url_en: body.form_url_en ?? group.form_url_en,
    logo_url: body.logo_url ?? group.logo_url,
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
  } catch (error) {
    console.error("Error in handleUpdateGroup:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update group" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function handleCreateGroup(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const payload = authResult as JwtPayload;

  if (!isSuperAdmin(payload.email)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const body = (await req.json()) as {
    entra_group_id?: string | null;
    display_name_sv: string;
    display_name_en: string;
    about_markdown_sv?: string;
    about_markdown_en?: string;
    form_url_sv?: string;
    form_url_en?: string;
    logo_url?: string;
  };

  const groupId = randomUUID();

  createGroup({
    id: groupId,
    entra_group_id: body.entra_group_id ?? null,
    display_name_sv: body.display_name_sv,
    display_name_en: body.display_name_en,
    about_markdown_sv: body.about_markdown_sv ?? '',
    about_markdown_en: body.about_markdown_en ?? '',
    form_url_sv: body.form_url_sv ?? '',
    form_url_en: body.form_url_en ?? '',
    logo_url: body.logo_url ?? '',
  });

  return new Response(JSON.stringify({ id: groupId, success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
  } catch (error) {
    console.error("Error in handleCreateGroup:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create group" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function handleDeleteGroup(
  req: Request,
  groupId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const payload = authResult as JwtPayload;

    if (!isSuperAdmin(payload.email)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const group = getGroupById(groupId);
    if (!group) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    deleteGroup(groupId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in handleDeleteGroup:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete group" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}
