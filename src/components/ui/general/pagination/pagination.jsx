/**
 * Pagination — numbered page navigation with arrow buttons and ellipses.
 */
import React, { useMemo } from "react";
import { useLanguage } from "@/context/language-context";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

function range(start, end) {
  const len = end - start + 1;
  return Array.from({ length: len }, (_, i) => start + i);
}

function getPaginationItems(page, totalPages, siblingCount = 1, boundaryCount = 1) {
  if (totalPages <= 0) return [];
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );

  const start = Math.max(
    Math.min(page - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const end = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  const middle = start <= end ? range(start, end) : [];

  const items = [...startPages];
  if (middle.length) {
    if (start > startPages[startPages.length - 1] + 1) items.push("start-ellipsis");
    items.push(...middle);
    if (end < (endPages[0] || totalPages) - 1) items.push("end-ellipsis");
  } else if (startPages[startPages.length - 1] < (endPages[0] || totalPages) - 1) {
    items.push("end-ellipsis");
  }
  items.push(...endPages);
  return items;
}

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  prevLabel,
  nextLabel,
  tone = "neutral", // "neutral" (black/gray) or "primary" (blue)
}) {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const items = useMemo(
    () => getPaginationItems(page, totalPages, siblingCount, boundaryCount),
    [page, totalPages, siblingCount, boundaryCount]
  );

  // Solid white, no transparency, simple focus states
    const baseBtn =
      "inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-150 focus:outline-none focus:ring-0";

    const theme = tone === "primary"
      ? {
        // Primary tone: keep blue active, but make outline hover more visible
        outline: "text-blue-700 bg-white border-blue-600 hover:bg-blue-50 hover:border-blue-700 cursor-pointer",
        active: "text-white bg-blue-600 border-blue-600 hover:bg-blue-700",
      }
      : {
        // Neutral tone: subtle active with stone-100 and stronger hover on outline
        outline: "text-black bg-white border-gray-300 hover:bg-stone-50 hover:border-gray-500 cursor-pointer",
        active: "text-black bg-stone-100 border-gray-300",
      };

  const muted = "text-gray-400 bg-white border-gray-300 cursor-not-allowed";
  const numBtn =
    "text-gray-800 bg-white border-gray-300 hover:bg-gray-50 focus:border-gray-500 cursor-pointer";
  const numBtnActive = theme.active;
  const prevAria = prevLabel ?? t('pagination.prev');
  const nextAria = nextLabel ?? t('pagination.next');

  return (
    <div className="mt-6 flex items-center justify-center bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={prevAria}
          aria-disabled={!canPrev}
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
          className={`${baseBtn} ${canPrev ? theme.outline : muted}`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {items.map((it, idx) =>
          typeof it === "number" ? (
            <button
              key={idx}
              type="button"
              aria-current={it === page ? "page" : undefined}
              onClick={() => it !== page && onPageChange(it)}
              className={`${baseBtn} ${it === page ? numBtnActive : numBtn}`}
            >
              {it}
            </button>
          ) : (
            <span key={idx} className="px-2 text-gray-500 select-none">
              …
            </span>
          )
        )}

        <button
          type="button"
          aria-label={nextAria}
          aria-disabled={!canNext}
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
          className={`${baseBtn} ${canNext ? theme.outline : muted}`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
