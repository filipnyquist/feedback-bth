-- Migration 001: Initial schema

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  entra_group_id TEXT UNIQUE,
  display_name_sv TEXT NOT NULL DEFAULT '',
  display_name_en TEXT NOT NULL DEFAULT '',
  about_markdown_sv TEXT NOT NULL DEFAULT '',
  about_markdown_en TEXT NOT NULL DEFAULT '',
  form_url_sv TEXT NOT NULL DEFAULT '',
  form_url_en TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name_sv TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  group_ids TEXT NOT NULL, -- JSON array of group IDs
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed data: BTH student unions
INSERT OR IGNORE INTO groups (id, entra_group_id, display_name_sv, display_name_en, about_markdown_sv, about_markdown_en, form_url_sv, form_url_en, logo_url, updated_at)
VALUES
  (
    '3f8e9c2a-1b4d-4e7a-9c3f-2d8b5a6e1f4c',
    'b7f46679-a109-476a-96ed-ba730494b863',
    'BITS',
    'BITS',
    '## Om BITS

BITS är studentföreningen för studenter inom industriell ekonomi och management vid BTH.

### Feedback

Har du feedback om ditt program? Använd formuläret nedan.',
    '## About BITS

BITS is the student union for students in industrial economics and management at BTH.

### Feedback

Do you have feedback about your program? Use the form below.',
    '',
    '',
    'https://bthstudent.se/wp-content/blogs.dir/35/files/2019/01/BITS-1024x732.png',
    datetime('now')
  ),
  (
    '7a2c4f8b-3e5d-4a9c-8f1e-6b3d9c2a7e5f',
    '6172d751-390f-4e89-9696-ca8fc9ffc7b0',
    'BOSS',
    'BOSS',
    '## Om BOSS

BOSS är studentföreningen för studenter inom ekonomi och management vid BTH.

### Feedback

Har du feedback om ditt program? Använd formuläret nedan.',
    '## About BOSS

BOSS is the student union for students in economics and management at BTH.

### Feedback

Do you have feedback about your program? Use the form below.',
    '',
    '',
    'https://bthstudent.se/wp-content/blogs.dir/35/files/2022/09/BOSS_logga-1024x1024.png',
    datetime('now')
  ),
  (
    '9d1e5b3a-7f2c-4d8e-a6b9-3c5f8e1a4d7b',
    '8fa54c00-4abf-4ed3-8854-d6fb7dfdea82',
    'EKEN',
    'EKEN',
    '## Om EKEN

EKEN är studentföreningen för studenter inom miljö- och naturvetenskap vid BTH.

### Feedback

Har du feedback om ditt program? Använd formuläret nedan.',
    '## About EKEN

EKEN is the student union for students in environmental and natural sciences at BTH.

### Feedback

Do you have feedback about your program? Use the form below.',
    '',
    '',
    'https://bthstudent.se/wp-content/blogs.dir/35/files/2019/01/EKEN-1024x732.png',
    datetime('now')
  ),
  (
    'c5a8f2e4-6b9d-4c3a-9e7f-1d4b8c2e5a9f',
    'a744aa8b-a159-459a-a003-de8d050c5adb',
    'Mårfin(t)',
    'Mårfin(t)',
    '## Om Mårfin(t)

Mårfin(t) är studentföreningen för studenter inom spatial planering vid BTH.

### Feedback

Har du feedback om ditt program? Använd formuläret nedan.',
    '## About Mårfin(t)

Mårfin(t) is the student union for students in spatial planning at BTH.

### Feedback

Do you have feedback about your program? Use the form below.',
    '',
    '',
    'https://bthstudent.se/wp-content/blogs.dir/35/files/2019/01/morifnt-1024x732.png',
    datetime('now')
  ),
  (
    'e2f9a7c3-4d1b-4e8a-9c6f-7b3e5d2a8f1c',
    'bf2c1440-fe8b-4c36-ab15-7d130df4ae14',
    'ROST',
    'ROST',
    '## Om ROST

ROST är studentföreningen för studenter inom röntgensjuksköterskeprogrammet vid BTH.

### Feedback

Har du feedback om ditt program? Använd formuläret nedan.',
    '## About ROST

ROST is the student union for students in the radiography program at BTH.

### Feedback

Do you have feedback about your program? Use the form below.',
    '',
    '',
    'https://bthstudent.se/wp-content/blogs.dir/35/files/2019/01/ROST-1-1024x379.png',
    datetime('now')
  ),
  (
    'f8b4d1c9-2e7a-4f3c-8d6e-9a5b3c1f7e2d',
    '05ac3d88-3b36-4820-b06a-7a3171bf2ee3',
    '#ROOT',
    '#ROOT',
    '## Om #ROOT

#ROOT är studentföreningen för studenter inom datorsäkerhet och nätverk vid BTH.

### Feedback

Har du feedback om ditt program? Använd formuläret nedan.',
    '## About #ROOT

#ROOT is the student union for students in computer security and networks at BTH.

### Feedback

Do you have feedback about your program? Use the form below.',
    '',
    '',
    'https://bthstudent.se/wp-content/blogs.dir/35/files/2019/01/ROOT-1024x732.png',
    datetime('now')
  );
