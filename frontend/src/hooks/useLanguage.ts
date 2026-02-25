import { useState, useCallback } from "react";
import { t, type Lang } from "@/lib/i18n";

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    return stored === "en" ? "en" : "sv";
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  }, []);

  const i18n = t[lang];

  return { lang, setLang, i18n };
}
