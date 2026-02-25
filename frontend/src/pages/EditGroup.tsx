import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { getMe, updateGroup } from "@/lib/api";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import type { AdminGroup, AdminProgram } from "@/types";
import { randomUUID } from "@/lib/uuid";

export function EditGroup() {
  const { id } = useParams<{ id: string }>();
  const { lang, setLang, i18n } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<AdminGroup | null>(null);

  // Form state
  const [displayNameSv, setDisplayNameSv] = useState("");
  const [displayNameEn, setDisplayNameEn] = useState("");
  const [aboutSv, setAboutSv] = useState("");
  const [aboutEn, setAboutEn] = useState("");
  const [formUrlSv, setFormUrlSv] = useState("");
  const [formUrlEn, setFormUrlEn] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [programs, setPrograms] = useState<AdminProgram[]>([]);

  useEffect(() => {
    getMe()
      .then((me) => {
        const found = me.groups.find((g) => g.id === id);
        if (!found) {
          navigate("/admin");
          return;
        }
        setGroup(found);
        setDisplayNameSv(found.display_name_sv);
        setDisplayNameEn(found.display_name_en);
        setAboutSv(found.about_markdown_sv);
        setAboutEn(found.about_markdown_en);
        setFormUrlSv(found.form_url_sv);
        setFormUrlEn(found.form_url_en);
        setLogoUrl(found.logo_url);
        setPrograms(found.programs);
      })
      .catch(() => navigate("/admin"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateGroup(id, {
        display_name_sv: displayNameSv,
        display_name_en: displayNameEn,
        about_markdown_sv: aboutSv,
        about_markdown_en: aboutEn,
        form_url_sv: formUrlSv,
        form_url_en: formUrlEn,
        logo_url: logoUrl,
        programs,
      });
      showToast(i18n.saved, "success");
    } catch (err) {
      showToast(i18n.error, "error");
    } finally {
      setSaving(false);
    }
  };

  const addProgram = () => {
    setPrograms((prev) => [
      ...prev,
      { id: randomUUID(), code: "", name_sv: "", name_en: "", group_id: id ?? "" },
    ]);
  };

  const removeProgram = (progId: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== progId));
  };

  const updateProgramField = (progId: string, field: keyof AdminProgram, value: string) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === progId ? { ...p, [field]: value } : p))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{i18n.loading}</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src="https://bthstudent.se/wp-content/blogs.dir/35/files/2018/12/cropped-bsk_logga_hori.png"
              alt="BSK Logo"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {i18n.backToAdmin}
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{i18n.editGroup}</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? i18n.loading : i18n.save}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Names */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{i18n.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{i18n.nameSv}</Label>
                <Input
                  value={displayNameSv}
                  onChange={(e) => setDisplayNameSv(e.target.value)}
                  placeholder="Namn på svenska"
                />
              </div>
              <div className="space-y-2">
                <Label>{i18n.nameEn}</Label>
                <Input
                  value={displayNameEn}
                  onChange={(e) => setDisplayNameEn(e.target.value)}
                  placeholder="Name in English"
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{i18n.about}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  {i18n.about} ({i18n.nameSv.split(" ")[1]})
                </Label>
                <Textarea
                  value={aboutSv}
                  onChange={(e) => setAboutSv(e.target.value)}
                  placeholder="Markdown stöds..."
                  className="min-h-[160px] font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {i18n.about} ({i18n.nameEn.split(" ")[1]})
                </Label>
                <Textarea
                  value={aboutEn}
                  onChange={(e) => setAboutEn(e.target.value)}
                  placeholder="Markdown supported..."
                  className="min-h-[160px] font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form URLs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{i18n.form}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  {i18n.form} URL ({i18n.nameSv.split(" ")[1]})
                </Label>
                <Input
                  value={formUrlSv}
                  onChange={(e) => setFormUrlSv(e.target.value)}
                  placeholder="https://forms.office.com/..."
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {i18n.form} URL ({i18n.nameEn.split(" ")[1]})
                </Label>
                <Input
                  value={formUrlEn}
                  onChange={(e) => setFormUrlEn(e.target.value)}
                  placeholder="https://forms.office.com/..."
                  type="url"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{i18n.logo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Group logo preview"
                    className="h-16 w-auto object-contain rounded border bg-white p-1"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <Label>{i18n.logoUrl}</Label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    type="url"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{i18n.programs}</CardTitle>
              <Button variant="outline" size="sm" onClick={addProgram}>
                + {i18n.addProgram}
              </Button>
            </CardHeader>
            <CardContent>
              {programs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {i18n.noPrograms}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">{i18n.code}</TableHead>
                      <TableHead>{i18n.nameSv}</TableHead>
                      <TableHead>{i18n.nameEn}</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((prog) => (
                      <TableRow key={prog.id}>
                        <TableCell>
                          <Input
                            value={prog.code}
                            onChange={(e) => updateProgramField(prog.id, "code", e.target.value)}
                            placeholder="DV"
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={prog.name_sv}
                            onChange={(e) => updateProgramField(prog.id, "name_sv", e.target.value)}
                            placeholder="Datavetenskap"
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={prog.name_en}
                            onChange={(e) => updateProgramField(prog.id, "name_en", e.target.value)}
                            placeholder="Computer Science"
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProgram(prog.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? i18n.loading : i18n.save}
          </Button>
        </div>
      </main>
    </div>
  );
}
