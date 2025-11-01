"use client";
/**
 * SubNavSearchBar — a slim search bar placed under the main navigation.
 *
 * Purpose
 * - Shows a single-line search input with a submit button.
 * - Meant to be used below the header to filter list pages.
 * - Controlled or uncontrolled input: type freely; parent decides when to submit.
 *
 * Props
 * - value?: string
 *   Controlled value for the input. If provided, the component is controlled and will call onChange.
 * - defaultValue?: string ("")
 *   Initial value for the input when used uncontrolled.
 * - onChange?: (value: string) => void
 *   Called on input change when controlled.
 * - onSubmit?: (value: string) => void
 *   Called when the user clicks the search button or presses Enter. Use this to trigger server-side filtering.
 * - placeholder?: string ("Search…")
 *   Input placeholder text.
 * - rightSlot?: React.ReactNode
 *   Optional trailing content (e.g., buttons) aligned to the right of the input.
 * - sticky?: boolean (false)
 *   When true, the bar sticks below the main navbar.
 * - className?: string
 *   Extra class names for the outer wrapper.
 *
 * Usage example
 *
 *   const [searchInput, setSearchInput] = React.useState("");
 *   const [query, setQuery] = React.useState("");
 *   <SubNavSearchBar
 *     sticky
 *     value={searchInput}
 *     onChange={setSearchInput}
 *     onSubmit={(q) => { setQuery(q); // trigger fetch with q on server }}
 *     placeholder="Search products…"
 *   />
 */
import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";
import { API_BASE, toAbsoluteUrl } from "@/utils/url";

/**
 * SubNavSearchBar — an optional search bar that sits below the NavBar.
 * It doesn't modify the header; just place this component under the header in any page or layout.
 */
export default function SubNavSearchBar({
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder,
  rightSlot, // optional ReactNode (extra actions)
  sticky = false,
  className = "",
}) {
  const { t } = useLanguage();
  const isControlled = typeof value === "string";
  const [inner, setInner] = React.useState(defaultValue);
  const current = isControlled ? value : inner;
  const inputRef = React.useRef(null);
  const [suggestions, setSuggestions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  //for debugg later
  const [selectAutocomplete, setSelectAutocomplete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const abortRef = React.useRef(null);
  const effectivePlaceholder = placeholder ?? t('common.searchPlaceholder');

  const submit = (e) => {
    e?.preventDefault?.();
    onSubmit?.(current);
    setOpen(false);
  };

  // Debounced suggestions fetch
  React.useEffect(() => {
    const q = (current || '').trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // cancel previous
        if (abortRef.current) { abortRef.current.abort(); }
        abortRef.current = new AbortController();
        const url = `${API_BASE}/resources/suggest?q=${encodeURIComponent(q)}&limit=7`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error('suggest failed');
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        setSuggestions(items);
        //bugg line: reopen suggestions
        setOpen(items.length > 0);
        console.log('Suggestions:', items);
        setActiveIndex(items.length ? 0 : -1);
      } catch (_) {
        // ignore
        setSuggestions([]);
        setOpen(false);
        setActiveIndex(-1);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [current]);

  const pick = (item) => {
    if (!item) return;
    const text = item?.name || '';
    if (isControlled) onChange?.(text); else setInner(text);
    onSubmit?.(text);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) {
      if (e.key === 'Enter') {
        submit(e);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === 'Enter') {
      // Always submit the current input value, not the highlighted suggestion
      submit(e);
    }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className={[
      "w-full border-b border-foreground/10 bg-stone-100 rounded-lg",
      sticky ? "sticky top-16 z-30" : "",
      className,
    ].join(" ")}
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-3">
        <form onSubmit={submit} className="flex items-center gap-2">
          <div className="relative flex-1" onKeyDown={onKeyDown}>
            <div
              className="group flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 transition focus-within:border-gray-500"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                className="flex-1 text-black border-none px-2 py-1.5 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-gray-500"
                placeholder={effectivePlaceholder}
                value={current}
                onChange={(e) => {
                  if (isControlled) onChange?.(e.target.value);
                  else setInner(e.target.value);
                }}
                onFocus={() => { if (suggestions.length) setOpen(true); }}
                onBlur={() => { setTimeout(() => setOpen(false), 120); }}
                ref={inputRef}
              />
              <button
                type="submit"
                aria-label={t('common.search')}
                className="p-2 text-black rounded-md hover:bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </div>

            {open && suggestions.length ? (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-40 overflow-hidden">
                <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
                  {suggestions.map((it, idx) => (
                    <li key={it.id}
                        className={["flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-stone-100", idx === activeIndex ? 'bg-stone-100' : ''].join(' ')}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(it)}
                    >
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={toAbsoluteUrl(it.image)} alt={it.name || ''} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-stone-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-black truncate">{it.name}</div>
                        {typeof it.price === 'number' ? (
                          <div className="text-xs text-gray-600">{it.price} lei</div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
                {loading ? <div className="px-3 py-2 text-xs text-gray-500">{t('common.loading')}</div> : null}
              </div>
            ) : null}
          </div>
          {rightSlot ? <div className="ml-2">{rightSlot}</div> : null}
        </form>
      </div>
    </div>
  );
}
