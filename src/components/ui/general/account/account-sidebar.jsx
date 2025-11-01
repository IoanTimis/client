"use client";
import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

// AccountSideBar — left navigation for account pages, responsive
// Props: items: Array<{ href, label, icon? }>, title? (default: "Contul meu")
export default function AccountSideBar({
  items = [],
  title,
  className = "",
  sticky = true,
}) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('nav.myAccount');
  return (
    <aside className={[
      "w-full md:w-64 shrink-0",
      sticky ? "md:sticky md:top-16 md:z-10" : "",
      className,
    ].join(" ")}
    >
      <div className="rounded-lg h-full bg-white border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-black">{resolvedTitle}</h3>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {items.map((it, idx) => (
              <li key={idx}>
                <Link href={it.href || "#"} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-black hover:bg-stone-200 transition">
                  {it.icon ? <span className="text-foreground/80">{it.icon}</span> : null}
                  <span>{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
