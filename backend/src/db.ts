import { Database } from "bun:sqlite";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DATABASE_URL = process.env.DATABASE_URL ?? "./feedback.db";

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    _db = new Database(DATABASE_URL, { create: true });
    _db.run("PRAGMA journal_mode=WAL");
    _db.run("PRAGMA foreign_keys=ON");
  }
  return _db;
}

export function runMigrations() {
  const db = getDb();
  const migrationsDir = join(import.meta.dir, "../migrations");
  // Run all migration files in order
  const migrationFiles = ["001_init.sql"];
  for (const file of migrationFiles) {
    const migrationPath = join(migrationsDir, file);
    if (existsSync(migrationPath)) {
      const sql = readFileSync(migrationPath, "utf-8");
      try {
        db.run(sql);
      } catch (e: any) {
        // Ignore "duplicate column" errors from ALTER TABLE being re-run
        if (!e.message?.includes("duplicate column")) {
          throw e;
        }
      }
    }
  }
  console.log("✅ Migrations applied");
}

// ---------- Types ----------

export interface Group {
  id: string;
  entra_group_id: string | null;
  display_name_sv: string;
  display_name_en: string;
  about_markdown_sv: string;
  about_markdown_en: string;
  form_url_sv: string;
  form_url_en: string;
  logo_url: string;
  updated_at: string;
}

export interface Program {
  id: string;
  code: string;
  name_sv: string;
  name_en: string;
  group_id: string;
}

// ---------- Queries ----------

export function getAllPrograms(): (Program & { group_display_name_sv: string; group_display_name_en: string; group_logo_url: string })[] {
  const db = getDb();
  return db
    .query(
      `SELECT p.*, g.display_name_sv AS group_display_name_sv, g.display_name_en AS group_display_name_en, g.logo_url AS group_logo_url
       FROM programs p
       JOIN groups g ON p.group_id = g.id
       ORDER BY p.name_sv`
    )
    .all() as any;
}

export function getProgramById(id: string): (Program & { group: Group }) | null {
  const db = getDb();
  const row = db
    .query(
      `SELECT p.id, p.code, p.name_sv, p.name_en, p.group_id,
              g.id AS g_id, g.entra_group_id, g.display_name_sv, g.display_name_en,
              g.about_markdown_sv, g.about_markdown_en, g.form_url_sv, g.form_url_en, g.logo_url, g.updated_at
       FROM programs p
       JOIN groups g ON p.group_id = g.id
       WHERE p.id = ?`
    )
    .get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name_sv: row.name_sv,
    name_en: row.name_en,
    group_id: row.group_id,
    group: {
      id: row.g_id,
      entra_group_id: row.entra_group_id,
      display_name_sv: row.display_name_sv,
      display_name_en: row.display_name_en,
      about_markdown_sv: row.about_markdown_sv,
      about_markdown_en: row.about_markdown_en,
      form_url_sv: row.form_url_sv,
      form_url_en: row.form_url_en,
      logo_url: row.logo_url,
      updated_at: row.updated_at,
    },
  };
}

export function getGroupById(id: string): Group | null {
  const db = getDb();
  return db.query(`SELECT * FROM groups WHERE id = ?`).get(id) as Group | null;
}

export function getGroupByEntraId(entraGroupId: string): Group | null {
  const db = getDb();
  return db.query(`SELECT * FROM groups WHERE entra_group_id = ?`).get(entraGroupId) as Group | null;
}

export function getGroupsByEntraIds(entraGroupIds: string[]): Group[] {
  if (entraGroupIds.length === 0) return [];
  const db = getDb();
  const placeholders = entraGroupIds.map(() => "?").join(",");
  return db
    .query(`SELECT * FROM groups WHERE entra_group_id IN (${placeholders}) ORDER BY display_name_sv`)
    .all(...entraGroupIds) as Group[];
}

export function getAllGroups(): Group[] {
  const db = getDb();
  return db.query(`SELECT * FROM groups ORDER BY display_name_sv`).all() as Group[];
}

export function getProgramsByGroupId(groupId: string): Program[] {
  const db = getDb();
  return db.query(`SELECT * FROM programs WHERE group_id = ? ORDER BY name_sv`).all(groupId) as Program[];
}

export function updateGroup(
  id: string,
  data: {
    display_name_sv: string;
    display_name_en: string;
    about_markdown_sv: string;
    about_markdown_en: string;
    form_url_sv: string;
    form_url_en: string;
    logo_url: string;
  }
) {
  const db = getDb();
  db.run(
    `UPDATE groups SET
       display_name_sv = ?,
       display_name_en = ?,
       about_markdown_sv = ?,
       about_markdown_en = ?,
       form_url_sv = ?,
       form_url_en = ?,
       logo_url = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
    [
      data.display_name_sv,
      data.display_name_en,
      data.about_markdown_sv,
      data.about_markdown_en,
      data.form_url_sv,
      data.form_url_en,
      data.logo_url,
      id,
    ]
  );
}

export function upsertProgram(program: Program) {
  const db = getDb();
  db.run(
    `INSERT INTO programs (id, code, name_sv, name_en, group_id)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       code = excluded.code,
       name_sv = excluded.name_sv,
       name_en = excluded.name_en`,
    [program.id, program.code, program.name_sv, program.name_en, program.group_id]
  );
}

export function deleteProgram(id: string) {
  const db = getDb();
  db.run(`DELETE FROM programs WHERE id = ?`, [id]);
}

export function deleteProgramsByGroupId(groupId: string, keepIds: string[]) {
  const db = getDb();
  if (keepIds.length === 0) {
    db.run(`DELETE FROM programs WHERE group_id = ?`, [groupId]);
    return;
  }
  const placeholders = keepIds.map(() => "?").join(",");
  db.run(
    `DELETE FROM programs WHERE group_id = ? AND id NOT IN (${placeholders})`,
    [groupId, ...keepIds]
  );
}

export function createGroup(group: {
  id: string;
  entra_group_id: string | null;
  display_name_sv: string;
  display_name_en: string;
  about_markdown_sv: string;
  about_markdown_en: string;
  form_url_sv: string;
  form_url_en: string;
  logo_url: string;
}) {
  const db = getDb();
  db.run(
    `INSERT INTO groups (id, entra_group_id, display_name_sv, display_name_en, about_markdown_sv, about_markdown_en, form_url_sv, form_url_en, logo_url, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      group.id,
      group.entra_group_id,
      group.display_name_sv,
      group.display_name_en,
      group.about_markdown_sv,
      group.about_markdown_en,
      group.form_url_sv,
      group.form_url_en,
      group.logo_url,
    ]
  );
}

export function deleteGroup(id: string) {
  const db = getDb();
  db.run(`DELETE FROM groups WHERE id = ?`, [id]);
}

// User session management
export function upsertUserSession(userId: string, email: string, groupIds: string[]) {
  const db = getDb();
  db.run(
    `INSERT INTO user_sessions (user_id, email, group_ids, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       email = excluded.email,
       group_ids = excluded.group_ids,
       updated_at = datetime('now')`,
    [userId, email, JSON.stringify(groupIds)]
  );
}

export function getUserSession(userId: string): { userId: string; email: string; groupIds: string[] } | null {
  const db = getDb();
  const row = db.query(`SELECT user_id, email, group_ids FROM user_sessions WHERE user_id = ?`).get(userId) as any;
  if (!row) return null;
  return {
    userId: row.user_id,
    email: row.email,
    groupIds: JSON.parse(row.group_ids),
  };
}
