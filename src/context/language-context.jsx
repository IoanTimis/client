"use client";
import React from "react";

const defaultLang = "ro";

// Lazy-loaded dictionaries; you can expand this as needed
const dictionaries = {
  en: {},
  ro: {},
};

function loadInitialLang() {
  if (typeof window === "undefined") return defaultLang;
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "ro") return saved;
  } catch {}
  return defaultLang;
}

export const LanguageContext = React.createContext({
  lang: defaultLang,
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children, dicts }) {
  const [lang, setLang] = React.useState(loadInitialLang);

  React.useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);

  const merged = React.useMemo(() => ({
    en: { ...dictionaries.en, ...(dicts?.en || {}) },
    ro: { ...dictionaries.ro, ...(dicts?.ro || {}) },
  }), [dicts]);

  const t = React.useCallback((key) => {
    const d = merged[lang] || {};
    if (key in d) return d[key];
    const fallback = merged.en || {};
    return key in fallback ? fallback[key] : key;
  }, [lang, merged]);

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
