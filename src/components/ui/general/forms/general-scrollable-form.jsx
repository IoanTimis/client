"use client";

import React from "react";
import GeneralForm from "./general-Form";

/**
 * GeneralScrollableForm — a thin wrapper over GeneralForm that makes the form
 * area scrollable by default inside modals or panels, and prevents nested scroll traps.
 *
 * Defaults applied:
 * - Outer wrapper: max-h-[80vh] overflow-auto pr-1 pb-24 (room for modal footer buttons)
 * - Inner form: className augmented with "max-h-none overflow-visible" so it doesn't set its own max-height
 *
 * Usage: same props as GeneralForm
 */
export default function GeneralScrollableForm(props) {
  const { className = "", ...rest } = props || {};
  return (
    <div className="max-h-[80vh] overflow-auto pr-1 pb-4 scrollbar-stone">
      <GeneralForm
        {...rest}
        scroll={false}
        className={["max-h-none overflow-visible", className].join(" ")}
      />
    </div>
  );
}
