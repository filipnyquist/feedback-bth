import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getPrograms } from "@/lib/api";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ProgramCard } from "@/components/ProgramCard";
import { Input } from "@/components/ui/input";
import type { Program } from "@/types";
import { Link } from "react-router-dom";

export function Home() {
  const { lang, setLang, i18n } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getPrograms(lang)
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  const filtered = useMemo(() => {
    if (!search.trim()) return programs;
    const q = search.toLowerCase();
    return programs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.group_name.toLowerCase().includes(q)
    );
  }, [programs, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <span className="font-bold text-lg text-primary tracking-tight">
            <img
              src="https://bthstudent.se/wp-content/blogs.dir/35/files/2018/12/cropped-bsk_logga_hori.png"
              alt="BSK Logo"
              className="h-8 w-auto"
            />
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} setLang={setLang} />
            <Link
              to="/admin"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {i18n.adminDashboard}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {i18n.welcome}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {i18n.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-lg mx-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={i18n.searchPlaceholder}
            className="h-11 text-base"
          />
        </div>

        {/* Programs grid */}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">{i18n.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{i18n.noPrograms}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
