import type { Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface LanguageToggleProps {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
      <Button
        variant={lang === "sv" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLang("sv")}
        className="h-7 px-3 text-xs"
      >
        SV
      </Button>
      <Button
        variant={lang === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLang("en")}
        className="h-7 px-3 text-xs"
      >
        EN
      </Button>
    </div>
  );
}
