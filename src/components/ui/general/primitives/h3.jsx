/**
 * H3 — subsection heading with consistent spacing and tone.
 * Props: className?, as?, tone?: 'default' | 'muted' | 'inherit'
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const H3 = React.forwardRef(function H3(
  { className, children, as: Tag = "h3", tone },
  ref
){
  const base = "scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight";
  const spacing = "mt-5 mb-2.5";
  const toneMap = {
    default: "text-foreground/90",
    muted: "text-foreground/70",
    inherit: "text-inherit",
  };
  const toneCls = tone ? toneMap[tone] ?? "" : "";
  return (
    <Tag ref={ref} className={cn(base, spacing, toneCls, className)}>
      {children}
    </Tag>
  );
});

export default H3;
