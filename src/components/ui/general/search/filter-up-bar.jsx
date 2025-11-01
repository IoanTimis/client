"use client";
import React from "react";
import { Input, Button, Label } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

// FilterUpBar — horizontal/top filter bar with search on top and filters below
// Props:
// - defaultQuery, onApply({ query, values }), onClear()
// - defaultValues: { sort, perPage }
// - filters: array of { key, label, options: [{ value, label }] }
// Layout:
// - Search input stays alone at the top (both mobile and desktop)
// - Filters are rendered below in a grid: 1 column on mobile, 2 on desktop
// - Actions (Apply/Reset) at the bottom-right
export default function FilterUpBar({
  defaultQuery = "",
  defaultValues,
  filters = [],
  onApply,
  onClear,
  className = "",
}) {
  const { t } = useLanguage();
  const [query, setQuery] = React.useState(defaultQuery);
  const [values, setValues] = React.useState(() => ({ ...(defaultValues || {}) }));

  const apply = (e) => {
    e?.preventDefault?.();
    onApply?.({ query, values });
  };

  const clear = () => {
    setQuery("");
    setValues({});
    onClear?.();
  };

  return (
    <form
      onSubmit={apply}
      className={[
        "w-full rounded-lg bg-stone-100 p-3 md:p-4",
        "flex flex-col gap-3 md:gap-4",
        className,
      ].join(" ")}
    >
      {/* Search stays on top (mobile + desktop) */}
      <div className="flex-1 min-w-0">
        <Label htmlFor="fub-q" className="mb-1 block">{t('filters.search')}</Label>
        <Input id="fub-q" placeholder={t('filters.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Filters below: 1 per row on mobile, 2 per row on desktop */}
      {filters?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {filters.map((group) => {
            const type = group.type || "select";
            const key = group.key;
            const val = values?.[key] ?? "";
            return (
              <div key={key}>
                <Label className="mb-1 block">{group.label}</Label>
                {type === "select" ? (
                  <select
                    className="block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
                    value={val}
                    onChange={(e) => setValues((p) => ({ ...(p || {}), [key]: e.target.value }))}
                  >
                    {(group.options || []).map((opt) => (
                      <option key={opt.value ?? ""} value={opt.value ?? ""}>{opt.label}</option>
                    ))}
                  </select>
                ) : null}
                {type === "number" ? (
                  <input
                    type="number"
                    className="block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
                    value={val}
                    placeholder={group.placeholder}
                    min={group.min}
                    max={group.max}
                    step={group.step}
                    onChange={(e) => setValues((p) => ({ ...(p || {}), [key]: e.target.value }))}
                  />
                ) : null}
                {type === "text" ? (
                  <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
                    value={val}
                    placeholder={group.placeholder}
                    onChange={(e) => setValues((p) => ({ ...(p || {}), [key]: e.target.value }))}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Actions at bottom-right */}
      <div className="flex items-center gap-2 self-end">
        <Button size="sm" type="submit" variant="empty-blue">{t('filters.apply')}</Button>
        <Button size="sm" type="button" variant="empty-gray" onClick={clear}>{t('filters.reset')}</Button>
      </div>
    </form>
  );
}
