"use client";
/**
 * FilterSidebar — reusable left sidebar for search + grouped filters.
 *
 * Purpose
 * - Renders an optional search field and a list of filter controls (select, number,
 *   text, radio, checkbox). Applies only on explicit Apply button.
 * - Supports controlled and uncontrolled modes for both search and filter values.
 *
 * Props
 * - query?: string; defaultQuery?: string; onQueryChange?: (q: string) => void
 * - filters: Array<{ key: string; label: string; type?: 'select'|'number'|'text'|'radio'|'checkbox'; options?: { value: string; label: string }[]; placeholder?: string; min?: number; max?: number; step?: string|number }>
 * - values?: Record<string, any>; defaultValues?: Record<string, any>; onValuesChange?: (v: Record<string, any>) => void
 * - onApply?: ({ query, values }) => void — called when user presses Apply
 * - onClear?: () => void — called when user presses Clear (values reset inside as well)
 * - sticky?: boolean — makes the sidebar sticky under the header
 * - showSearch?: boolean (true) — display the search input
      <div className="space-y-4">
 *
          <div className="bg-white text-black rounded-lg border border-gray-200 p-3">
 *   const [searchInput, setSearchInput] = React.useState("");
 *   const [filters, setFilters] = React.useState({ sort: "createdAt:DESC" });
 *   <FilterSidebar
 *     query={searchInput}
 *     onQueryChange={setSearchInput}
 *     filters={[{ key: 'sort', label: 'Sortare', type: 'select', options: [...] }]}
 *     values={filters}
 *     onValuesChange={setFilters}
              className="bg-white text-black border border-gray-300"
 *     onApply={({ query, values }) => doFetch({ q: query, ...values })}
 *     onClear={() => { setSearchInput(""); setFilters({}); }}
 *   />
 */
import React from "react";
import { Input, Button, Label, Div } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

/**
 * FilterSidebar — reusable sidebar with a search box and filter groups.
 *
 * Props:
 * - query, defaultQuery, onQueryChange
 * - filters: Array<{ key, label, type: 'select'|'checkbox'|'radio', options: { value, label }[] }>
        <Div className="flex items-center gap-2 pt-2">
 * - onApply, onClear
 * - sticky (boolean), className (string)
 *
 * Controlled/uncontrolled:
 * - If `query` is provided, it's controlled; else uses internal state initialized from defaultQuery.
 * - If `values` is provided, it's controlled; else uses internal state initialized from defaultValues or sensible defaults.
 */
export default function FilterSidebar({
  query,
  defaultQuery = "",
  onQueryChange,
  filters = [],
  values,
  defaultValues,
  onValuesChange,
  onApply,
  onClear,
  sticky = false,
  showSearch = true,
  className = "",
}) {
  const { t } = useLanguage();
  const isQueryControlled = typeof query === "string";
  const isValuesControlled = values && typeof values === "object";

  const [innerQuery, setInnerQuery] = React.useState(defaultQuery);
  const [innerValues, setInnerValues] = React.useState(() =>
    defaultValues ?? buildInitialValues(filters)
  );

  const currentQuery = isQueryControlled ? query : innerQuery;
  const currentValues = isValuesControlled ? values : innerValues;

  const setQuery = (q) => {
    if (isQueryControlled) onQueryChange?.(q);
    else setInnerQuery(q);
  };

  const setValues = (next) => {
    const nextValues = typeof next === "function" ? next(currentValues) : next;
    if (isValuesControlled) onValuesChange?.(nextValues);
    else setInnerValues(nextValues);
  };

  const clearAll = () => {
    setQuery("");
    setValues(buildInitialValues(filters));
    onClear?.();
  };

  const apply = () => {
    onApply?.({ query: currentQuery, values: currentValues });
  };

  return (
    <aside
      className={[
        "w-72 shrink-0 bg-stone-100",
        sticky ? "sticky top-16 z-20" : "",
        "",
        className,
      ].join(" ")}
    >
      <div className="space-y-4">
        {showSearch ? (
          <div>
            <Label htmlFor="fsb-search" className="mb-1 block">
              {t('filters.search')}
            </Label>
            <Input
              id="fsb-search"
              placeholder={t('filters.searchPlaceholder')}
              value={currentQuery}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        ) : null}

        {filters.map((group) => (
          <FilterGroup
            key={group.key}
            group={group}
            values={currentValues}
            setValues={setValues}
          />
        ))}

        <Div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="empty-blue" size="sm" onClick={apply}>
            {t('filters.apply')}
          </Button>
          <Button size="sm" variant="empty-gray" onClick={clearAll}>
            {t('filters.reset')}
          </Button>
        </Div>
      </div>
    </aside>
  );
}

function FilterGroup({ group, values, setValues }) {
  const { key, label, type = "select", options = [], placeholder, min, max, step } = group;
  const val = values?.[key];
  if (type === "number") {
    return (
      <div className="space-y-1 bg-white text-black rounded-lg border border-gray-200 p-3">
        <Label className="block">{label}</Label>
        <input
          type="number"
          className="block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
          value={val ?? ""}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
        />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-1 bg-white text-black rounded-lg border border-gray-200 p-3">
        <Label className="block">{label}</Label>
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 text-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
          value={val ?? ""}
          placeholder={placeholder}
          onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
        />
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="space-y-1 bg-white text-black rounded-lg border border-gray-200 p-3">
        <Label className="block">{label}</Label>
        <select
          className="block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
          value={val ?? ""}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, [key]: e.target.value }))
          }
        >
          {options.map((opt) => (
            <option key={opt.value ?? ""} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "radio") {
    return (
      <div className="space-y-2 bg-white text-black rounded-lg border border-gray-200 p-3">
        <Label className="block">{label}</Label>
        <div className="space-y-1">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-black">
              <input
                type="radio"
                name={`fsb-${key}`}
                checked={val === opt.value}
                onChange={() => setValues((p) => ({ ...p, [key]: opt.value }))}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // checkbox group
  const arr = Array.isArray(val) ? val : [];
  const toggle = (v) => {
    setValues((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(v);
      const next = exists ? current.filter((x) => x !== v) : [...current, v];
      return { ...prev, [key]: next };
    });
  };

  return (
    <div className="space-y-2 bg-white text-black rounded-lg border border-gray-200 p-3">
      <Label className="block">{label}</Label>
      <div className="space-y-1">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={arr.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function buildInitialValues(filters) {
  const initial = {};
  for (const f of filters) {
    if (f.type === "checkbox") initial[f.key] = [];
    else initial[f.key] = "";
  }
  return initial;
}
