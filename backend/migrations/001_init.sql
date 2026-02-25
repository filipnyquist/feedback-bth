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
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name_sv TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);

-- Seed data: Demo groups
INSERT OR IGNORE INTO groups (id, entra_group_id, display_name_sv, display_name_en, about_markdown_sv, about_markdown_en, form_url_sv, form_url_en, updated_at)
VALUES
  (
    'group-bds',
    'entra-00000000-0000-0000-0000-000000000001',
    'Blekinge Datateknologer och Systemvetare',
    'Blekinge Computer Engineers and Systems Scientists',
    '## Om BDS

BDS är en studentförening vid BTH som representerar studenter inom datavetenskap, datorsystem och systemvetenskap.

### Kontakt

Har du frågor, tankar eller klagomål om ditt program? Fyll i vårt feedbackformulär så återkommer vi till dig.',
    '## About BDS

BDS is a student union at BTH representing students in computer science, computer systems and information systems.

### Contact

Do you have questions, thoughts or complaints about your program? Fill in our feedback form and we will get back to you.',
    'https://forms.office.com/demo-form-sv',
    'https://forms.office.com/demo-form-en',
    datetime('now')
  ),
  (
    'group-civilingenjor',
    'entra-00000000-0000-0000-0000-000000000002',
    'Civilingenjörssektionen',
    'Engineering Section',
    '## Om Civilingenjörssektionen

Vi representerar civilingenjörsprogrammen vid BTH och arbetar för att förbättra studiemiljön.

### Feedback

Din röst är viktig! Använd formuläret nedan för att lämna feedback.',
    '## About the Engineering Section

We represent the engineering programs at BTH and work to improve the study environment.

### Feedback

Your voice matters! Use the form below to leave feedback.',
    'https://forms.office.com/demo-eng-sv',
    'https://forms.office.com/demo-eng-en',
    datetime('now')
  ),
  (
    'group-hal',
    'entra-00000000-0000-0000-0000-000000000003',
    'Hälsotekniksektionen',
    'Health Technology Section',
    '## Om Hälsotekniksektionen

Vi arbetar för studenter inom medicinsk teknik och hälsoinformatik.

### Feedback

Lämna dina tankar om programmet här.',
    '## About the Health Technology Section

We work for students in medical technology and health informatics.

### Feedback

Leave your thoughts about the program here.',
    'https://forms.office.com/demo-hal-sv',
    'https://forms.office.com/demo-hal-en',
    datetime('now')
  );

-- Seed data: Demo programs
INSERT OR IGNORE INTO programs (id, code, name_sv, name_en, group_id)
VALUES
  ('prog-dv', 'DV', 'Datavetenskap', 'Computer Science', 'group-bds'),
  ('prog-pa', 'PA', 'Programvaruteknik', 'Software Engineering', 'group-bds'),
  ('prog-it', 'IT', 'IT-säkerhet', 'IT Security', 'group-bds'),
  ('prog-wsp', 'WSP', 'Webbprogrammering', 'Web Development', 'group-bds'),
  ('prog-ce', 'CE', 'Civilingenjör i Datateknik', 'Master of Engineering in Computer Engineering', 'group-civilingenjor'),
  ('prog-me', 'ME', 'Civilingenjör i Maskinteknik', 'Master of Engineering in Mechanical Engineering', 'group-civilingenjor'),
  ('prog-ee', 'EE', 'Civilingenjör i Elektroteknik', 'Master of Engineering in Electrical Engineering', 'group-civilingenjor'),
  ('prog-mt', 'MT', 'Medicinsk Teknik', 'Medical Technology', 'group-hal'),
  ('prog-hi', 'HI', 'Hälsoinformatik', 'Health Informatics', 'group-hal');
