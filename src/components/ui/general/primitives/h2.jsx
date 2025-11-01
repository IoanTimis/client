"use client";
/**
 * H2 — section heading with consistent spacing and tone.
 * Props: className?, as?, tone?: 'default' | 'muted' | 'inherit'
 */
import React from "react";
import { cn } from "@/lib/Ui";

// Color-neutral by default to make overrides (e.g. text-blue-900) always apply.
const H2 = React.forwardRef(function H2(
	{ className, children, as: Tag = "h2", tone },
	ref
){
	const base = "scroll-m-20 text-2xl text-black md:text-3xl font-semibold tracking-tight";
	const spacing = "mt-6 mb-3";
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

export default H2;

