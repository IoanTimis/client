// Generic UI utilities reusable across the app
// Use tailwind-merge so later classes override earlier ones for conflicting Tailwind utilities
import { twMerge } from "tailwind-merge";
export function cn(...classes) {
  return twMerge(classes.filter(Boolean).join(" "));
}

// Simple variant combiner: pass an object like { base, variant: {..}, size: {..} }
export function variantClass(variants = {}, { variant, size } = {}) {
  const base = variants.base ?? "";
  const v = variant && variants.variant?.[variant] ? variants.variant[variant] : "";
  const s = size && variants.size?.[size] ? variants.size[size] : "";
  return cn(base, v, s);
}
