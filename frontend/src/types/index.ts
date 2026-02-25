export interface Program {
  id: string;
  code: string;
  name: string;
  name_sv: string;
  name_en: string;
  group_id: string;
  group_name: string;
}

export interface Group {
  id: string;
  entra_group_id: string | null;
  display_name: string;
  display_name_sv: string;
  display_name_en: string;
  about_markdown: string;
  about_markdown_sv: string;
  about_markdown_en: string;
  form_url: string;
  form_url_sv: string;
  form_url_en: string;
  updated_at: string;
}

export interface ProgramDetail {
  id: string;
  code: string;
  name: string;
  name_sv: string;
  name_en: string;
  group_id: string;
  group: Group;
}

export interface AdminGroup {
  id: string;
  entra_group_id: string | null;
  display_name_sv: string;
  display_name_en: string;
  about_markdown_sv: string;
  about_markdown_en: string;
  form_url_sv: string;
  form_url_en: string;
  updated_at: string;
  programs: AdminProgram[];
}

export interface AdminProgram {
  id: string;
  code: string;
  name_sv: string;
  name_en: string;
  group_id: string;
}

export interface MeResponse {
  userId: string;
  email: string;
  groups: AdminGroup[];
}

export interface GroupUpdatePayload {
  display_name_sv: string;
  display_name_en: string;
  about_markdown_sv: string;
  about_markdown_en: string;
  form_url_sv: string;
  form_url_en: string;
  programs: Array<{
    id?: string;
    code: string;
    name_sv: string;
    name_en: string;
  }>;
}
