/**
 * Label — form label with optional muted tone.
 * Props: htmlFor?, muted?, className?, as?
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Label = React.forwardRef(function Label(
  { className, children, htmlFor, muted = false, as: Tag = "label" },
  ref
){
  const base = "block text-sm font-medium leading-none";
  const tone = muted ? "text-gray-500" : "text-black";
  return (
    <Tag ref={ref} htmlFor={htmlFor} className={cn(base, tone, className)}>
      {children}
    </Tag>
  );
});

export default Label;
