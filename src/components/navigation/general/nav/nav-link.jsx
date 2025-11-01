/**
 * NavLink — navigation item with optional icon and active styling.
 *
 * Props
 * - href: string — target URL
 * - label: string — visible text
 * - icon?: React.ComponentType<{ className?: string }>
 * - active?: boolean — applies active background state
 * - className?: string — extra classes
 */
"use client";
import React from "react";
import { Link as ALink } from "../../../ui/general/primitives";

export default function NavLink({ href, label, icon: Icon, active, className, activeClassName = "bg-foreground/10", ...props }) {
  return (
    <ALink
      href={href}
      underline={false}
      className={[
        "text-sm font-medium px-3 py-2 rounded-md transition-colors",
        "hover:bg-stone-800 hover:text-white",
        active ? activeClassName : "",
        className || "",
      ].join(" ")}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon className="size-4" aria-hidden /> : null}
        <span>{label}</span>
      </span>
    </ALink>
  );
}
