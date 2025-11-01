/**
 * H1 — page title with consistent spacing and tone.
 * Props:
 * - className?: string
 * - as?: React.ElementType (default: 'h1')
 * - tone?: 'default' | 'muted' | 'inherit'
 * - size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'lg')
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const H1 = React.forwardRef(function H1(
  { className, children, as: Tag = "h1", tone, size = "lg" },
  ref
){
  // Non-size base styles
  const base = "text-black scroll-m-20 font-bold tracking-tight";
  // Responsive size map; default 'lg' mirrors the previous base (3xl / md:4xl)
  const sizeMap = {
    xs: "text-lg md:text-xl",
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
  };
  const sizeCls = sizeMap[size] ?? sizeMap.lg;
  const spacing = "mt-8 mb-4";
  const toneMap = {
    default: "text-black",
    muted: "text-gray-500",
    inherit: "text-inherit",
  };
  const toneCls = tone ? toneMap[tone] ?? "" : "";
  return (
    <Tag ref={ref} className={cn(base, sizeCls, spacing, toneCls, className)}>
      {children}
    </Tag>
  );
});

export default H1;
