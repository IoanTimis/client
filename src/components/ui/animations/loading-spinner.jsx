import React from "react";
/**
 * LoadingSpinner — simple SVG spinner using Tailwind's animate-spin.
 *
 * Props
 * - size?: number (16) — pixel size when width/height classes aren't provided
 * - className?: string — apply color/sizing utilities; if you include w-/h- classes, `size` is ignored
 * - ariaLabel?: string ("Loading") — accessibility label
 *
 * Usage
 *   <LoadingSpinner className="w-5 h-5 text-foreground" ariaLabel="Loading items" />
 */
import { useLanguage } from "@/context/language-context";
export default function LoadingSpinner({ size = 16, className = "", ariaLabel }) {
  const { t } = useLanguage();
  const label = ariaLabel ?? t('common.loading');
  // If user passes sizing classes via className prefer them; otherwise use inline size
  const sizeStyle = className.includes("w-") || className.includes("h-") ? {} : { width: size, height: size };

  return (
    <svg
      role="status" aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={["animate-spin", className].join(" ")}
      style={sizeStyle}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4"></circle>
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
    </svg>
  );
}
