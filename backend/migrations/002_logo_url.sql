-- Migration 002: Add logo_url to groups and add real BTH student unions

ALTER TABLE groups ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';

-- Add the real BTH student union groups
INSERT OR IGNORE INTO groups (id, entra_group_id, display_name_sv, display_name_en, about_markdown_sv, about_markdown_en, form_url_sv, form_url_en, logo_url, updated_at)
VALUES
  (
    'group-boss',
    NULL,
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
    'group-eken',
    NULL,
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
    'group-morfint',
    NULL,
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
    'group-root',
    NULL,
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
  ),
  (
    'group-bits',
    NULL,
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
    'group-rost',
    NULL,
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
  );
