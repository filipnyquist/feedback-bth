import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { getMe, loginUrl, logoutUrl } from "@/lib/api";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MeResponse } from "@/types";

export function Admin() {
  const { lang, setLang, i18n } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{i18n.loading}</p>
      </div>
    );
  }

  if (!user) {
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
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">{i18n.adminDashboard}</h1>
          <p className="text-muted-foreground mb-8">
            {lang === "sv"
              ? "Logga in med ditt BTH Microsoft-konto för att hantera dina grupper."
              : "Sign in with your BTH Microsoft account to manage your groups."}
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = loginUrl()}
          >
            {i18n.signIn}
          </Button>
        </main>
      </div>
    );
  }

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = logoutUrl()}
            >
              {i18n.signOut}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{i18n.adminDashboard}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{i18n.yourGroups}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/group/new")}
          >
            + {i18n.createGroup}
          </Button>
        </div>

        {user.groups.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {lang === "sv"
                ? "Du tillhör inga konfigurerade grupper."
                : "You are not part of any configured groups."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {user.groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">
                        {lang === "en"
                          ? group.display_name_en || group.display_name_sv
                          : group.display_name_sv || group.display_name_en}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.programs.length}{" "}
                        {lang === "sv" ? "program" : "programs"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/group/${group.id}`)}
                    >
                      {i18n.edit}
                    </Button>
                  </div>
                </CardHeader>
                {group.programs.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {group.programs.map((p) => (
                        <Badge key={p.id} variant="secondary">
                          {p.code} –{" "}
                          {lang === "en" ? p.name_en || p.name_sv : p.name_sv || p.name_en}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
