import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { createGroup } from "@/lib/api";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function NewGroup() {
  const { lang, setLang, i18n } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [creating, setCreating] = useState(false);
  const [entraGroupId, setEntraGroupId] = useState("");
  const [displayNameSv, setDisplayNameSv] = useState("");
  const [displayNameEn, setDisplayNameEn] = useState("");
  const [aboutSv, setAboutSv] = useState("");
  const [aboutEn, setAboutEn] = useState("");
  const [formUrlSv, setFormUrlSv] = useState("");
  const [formUrlEn, setFormUrlEn] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const handleCreate = async () => {
    if (!displayNameSv || !displayNameEn) {
      showToast(i18n.error, "error");
      return;
    }

    setCreating(true);
    try {
      const result = await createGroup({
        entra_group_id: entraGroupId || null,
        display_name_sv: displayNameSv,
        display_name_en: displayNameEn,
        about_markdown_sv: aboutSv,
        about_markdown_en: aboutEn,
        form_url_sv: formUrlSv,
        form_url_en: formUrlEn,
        logo_url: logoUrl,
      });
      showToast(i18n.groupCreated, "success");
      navigate(`/admin/group/${result.id}`);
    } catch (err) {
      showToast(i18n.error, "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
          <h1 className="text-2xl font-bold tracking-tight">{i18n.newGroup}</h1>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? i18n.creating : i18n.save}
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
                <Label>{i18n.nameSv} *</Label>
                <Input
                  value={displayNameSv}
                  onChange={(e) => setDisplayNameSv(e.target.value)}
                  placeholder="Namn på svenska"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{i18n.nameEn} *</Label>
                <Input
                  value={displayNameEn}
                  onChange={(e) => setDisplayNameEn(e.target.value)}
                  placeholder="Name in English"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Entra Group ID */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{i18n.entraGroupId}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>{i18n.entraGroupIdOptional}</Label>
                <Input
                  value={entraGroupId}
                  onChange={(e) => setEntraGroupId(e.target.value)}
                  placeholder="b7f46679-a109-476a-96ed-ba730494b863"
                />
                <p className="text-xs text-muted-foreground">
                  {lang === "sv"
                    ? "Lämna tomt om gruppen inte har ett Microsoft Group ID"
                    : "Leave empty if the group doesn't have a Microsoft Group ID"}
                </p>
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
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleCreate} disabled={creating} size="lg">
            {creating ? i18n.creating : i18n.save}
          </Button>
        </div>
      </main>
    </div>
  );
}
