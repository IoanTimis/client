"use client";
/**
 * Input — styled text input primitive with sizes and invalid state.
 *
 * Props
 * - size?: 'sm' | 'md' | 'lg' ('md')
 * - invalid?: boolean (false) — highlights the field as invalid
 * - className?: string
 * - ...props — native input props
 *
 * Usage
 *   <Input placeholder="Search…" />
 */
import React from "react";
import { cn } from "@/lib/Ui";

const Input = React.forwardRef(function Input(
  { className, invalid = false, size = "md", ...props },
  ref
){
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-3.5 text-sm",
    lg: "h-11 px-4 text-base",
  };
  const base =
    "w-full rounded-md border border-gray-300 bg-white text-black shadow-sm transition focus:outline-none focus:ring-0 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const error = invalid
    ? "border-red-500 focus:border-red-500"
    : "";
  return (
    <input ref={ref} className={cn(base, sizes[size] ?? sizes.md, error, className)} {...props} />
  );
});

export default Input;
