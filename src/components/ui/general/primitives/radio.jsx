/**
 * Radio — styled radio input with label.
 * Props: name, value, checked, onChange, label, className?, ...input props
 */
import React from "react";

export default function Radio({ name, value, checked, onChange, label, className = "" , ...props }) {
  return (
    <label className={["inline-flex items-center gap-2 cursor-pointer", className].join(" ")}> 
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio h-4 w-4 text-blue-600"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
