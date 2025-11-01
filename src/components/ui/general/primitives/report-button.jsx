"use client";

import React from "react";
import { FiFlag } from "react-icons/fi";
import { useLanguage } from "@/context/language-context";

/**
 * ReportButton — outline red flag + label, link-like appearance.
 *
 * Props
 * - label?: string (defaults to i18n 'report.label' -> 'Raportează anunț')
 * - href?: string — if provided renders an anchor; else a button
 * - onClick?: (e) => void — click handler when no href or for analytics
 * - size?: 'sm' | 'md' (default 'md') — adjusts icon and font size
 * - fullWidth?: boolean — makes the button width: 100%
 * - className?: string — extra classes
 * - ariaLabel?: string — accessibility label override
 */
export default function ReportButton({
  label,
  href,
  onClick,
  size = "md",
  fullWidth = false,
  className = "",
  ariaLabel,
}) {
  const { t } = useLanguage();
  const text = label || t("report.label") || t("common.report");

  const base = [
    "group inline-flex items-center justify-center gap-2 cursor-pointer",
    "text-[#f2554f] hover:text-[#e04a44]",
    "transition-colors",
    fullWidth ? "w-full" : "",
  ].join(" ");

  const sizes = size === "sm"
    ? "text-sm"
    : "text-base";
  const iconSize = size === "sm" ? 18 : 20;

  const content = (
    <>
      <FiFlag size={iconSize} className="shrink-0" />
      <span className="leading-none">
        {text}
      </span>
    </>
  );

  const commonProps = {
    className: [base, sizes, className].filter(Boolean).join(" "),
    "aria-label": ariaLabel || text,
    onClick,
  };

  if (href) {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" {...commonProps}>
      {content}
    </button>
  );
}
