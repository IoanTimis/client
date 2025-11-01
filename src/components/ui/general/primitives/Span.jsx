/**
 * Span — inline text with optional muted tone.
 * Props: muted?: boolean, className?, as?
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Span = React.forwardRef(function Span(
	{ className, children, muted = false, as: Tag = "span" },
	ref
){
	const base = "inline";
	const tone = muted ? "text-gray-500" : "";
	return (
		<Tag ref={ref} className={cn(base, tone, className)}>
			{children}
		</Tag>
	);
});

export default Span;

