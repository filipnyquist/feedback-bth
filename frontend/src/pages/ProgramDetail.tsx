import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { getProgramById } from "@/lib/api";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import type { ProgramDetail } from "@/types";

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, setLang, i18n } = useLanguage();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProgramById(id, lang)
      .then(setProgram)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, lang]);

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
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          ← {i18n.programs}
        </Link>

        {loading && (
          <div className="text-center text-muted-foreground py-12">{i18n.loading}</div>
        )}
        {error && (
          <div className="text-center text-destructive py-12">{i18n.error}: {error}</div>
        )}
        {!loading && !error && program && (
          <div className="space-y-6">
            {/* Program header */}
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1 shrink-0 text-sm px-3 py-1">
                {program.code}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
            </div>

            {/* Group info card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {program.group.logo_url && (
                    <img
                      src={program.group.logo_url}
                      alt={`${program.group.display_name} logo`}
                      className="h-12 w-auto object-contain"
                    />
                  )}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                      {i18n.responsibleGroup}
                    </span>
                    <CardTitle className="text-xl">{program.group.display_name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* About markdown */}
                {program.group.about_markdown && (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{program.group.about_markdown}</ReactMarkdown>
                  </div>
                )}

                {/* Form + QR */}
                {program.group.form_url ? (
                  <div className="flex flex-col sm:flex-row items-start gap-6 pt-4 border-t">
                    <div className="flex-1 space-y-3">
                      <h3 className="font-semibold">{i18n.form}</h3>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        onClick={() => window.open(program.group.form_url, "_blank")}
                      >
                        {i18n.openForm} →
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">{i18n.qrCode}</h3>
                      <QRCodeDisplay url={program.group.form_url} i18n={i18n} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic pt-4 border-t">
                    {i18n.noFormUrl}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
