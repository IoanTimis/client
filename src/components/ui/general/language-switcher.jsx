"use client";
import React from "react";
import { useLanguage } from "@/context/language-context";

export default function LanguageSwitcher({ className }) {
  const { lang, setLang, t } = useLanguage();

  const isEN = lang === "en";
  const isRO = lang === "ro";

  const base =
    "px-2 py-0.5 text-xs md:px-2.5 md:py-0.5 md:text-xs border focus:outline-none focus:border-gray-500 transition-colors inline-flex items-center gap-1";
  const active = "bg-blue-200 text-black border-blue-300"; // albastru deschis
  const inactive = "bg-stone-100 text-black border-gray-300 hover:bg-stone-200"; // gri

  return (
    <div className={["inline-flex", className || ""].join(" ")} role="group" aria-label={t('lang.switcher')}>
      <button
        type="button"
        aria-pressed={isEN}
        aria-label={t('lang.switchToEnglish')}
        onClick={() => setLang("en")}
        className={[
          base,
          "rounded-l-md",
          isEN ? active : inactive,
        ].join(" ")}
        title={t('lang.switchToEnglish')}
      >
        <span aria-hidden>🇬🇧</span>
        <span>EN</span>
      </button>
      <button
        type="button"
        aria-pressed={isRO}
        aria-label={t('lang.switchToRomanian')}
        title={t('lang.switchToRomanian')}
        onClick={() => setLang("ro")}
        className={[
          base,
          "-ml-px rounded-r-md",
          isRO ? active : inactive,
        ].join(" ")}
      >
        <span aria-hidden>🇷🇴</span>
        <span>RO</span>
      </button>
    </div>
  );
}
