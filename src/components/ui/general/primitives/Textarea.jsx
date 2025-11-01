/**
 * Textarea — styled multi-line input with invalid state.
 * Props: rows?: number (4), invalid?: boolean, className?, ...textarea props
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Textarea = React.forwardRef(function Textarea(
  { className, invalid = false, rows = 4, ...props },
  ref
){
  const base =
    "w-full rounded-md bg-white text-black placeholder:text-gray-400 border border-gray-300 shadow-sm transition-colors p-3 text-sm focus:outline-none focus:ring-0 focus:border-gray-500 disabled:opacity-60 disabled:cursor-not-allowed";
  const error = invalid
    ? "border-red-500 focus:border-red-600"
    : "";
  return (
    <textarea ref={ref} rows={rows} className={cn(base, error, className)} {...props} />
  );
});

export default Textarea;
