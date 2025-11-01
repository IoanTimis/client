"use client";
import React from "react";
import { Input, Button } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

/**
 * DataTable — client-side simple table with search and filters.
 * Props:
 * - columns: [{ key: 'name', header: 'Name', render?: (value, row) => ReactNode }]
 * - rows: array of objects
 * - searchableKeys: string[] — which keys to search in
 * - filters: array of { key, label, options: [{value,label}], type?: 'select'|'text' }
 * - onRowClick?: (row) => void
 */
export default function DataTable({ columns = [], rows = [], searchableKeys = [], filters = [], onRowClick, className = "" }) {
  const { t } = useLanguage();
  const [query, setQuery] = React.useState("");
  const [filterState, setFilterState] = React.useState(() => Object.fromEntries(filters.map(f => [f.key, ""])));

  const filtered = React.useMemo(() => {
    let out = Array.isArray(rows) ? rows : [];
    // apply filters
    for (const f of filters) {
      const val = filterState[f.key];
      if (val) out = out.filter((r) => String(r[f.key] ?? "") === String(val));
    }
    // apply search
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((row) =>
        searchableKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    return out;
  }, [rows, query, filters, filterState, searchableKeys]);

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Input placeholder={t('common.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        {filters.map((f) => (
          <label key={f.key} className="text-sm inline-flex items-center gap-2">
            <span>{f.label}:</span>
            <select
              className="rounded-md border border-gray-300 bg-white text-black px-2 py-1 text-sm focus:outline-none focus:ring-0 focus:border-gray-500"
              value={filterState[f.key]}
              onChange={(e) => setFilterState((s) => ({ ...s, [f.key]: e.target.value }))}
            >
              <option value="">{t('common.all')}</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-foreground/10 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-foreground/[0.03]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left font-semibold px-3 py-2 border-b border-foreground/10">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-foreground/60">{t('common.noResults')}</td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i} className="hover:bg-foreground/5 cursor-pointer" onClick={() => onRowClick?.(row)}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 border-b border-foreground/10">
                      {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
