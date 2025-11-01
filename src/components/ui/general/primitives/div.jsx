/**
 * Div — container primitive with padding, border and background presets.
 *
 * Props
 * - padding?: 'none' | 'sm' | 'md' | 'lg' ('md')
 * - bordered?: boolean (false)
 * - as?: React.ElementType ('div') — render as a different tag
 * - className?: string
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Div = React.forwardRef(function Div(
	{ className, children, padding = "md", bordered = false, as: Tag = "div" },
	ref
){
	const padMap = {
		none: "p-0",
		sm: "p-3 md:p-4",
		md: "p-4 md:p-6",
		lg: "p-6 md:p-8",
	};
	const radius = "rounded-lg";
	const border = bordered ? "border border-foreground/10" : "";
	const bg = "";
	return (
		<Tag ref={ref} className={cn(padMap[padding] ?? padMap.md, radius, border, bg, className)}>
			{children}
		</Tag>
	);
});

export default Div;

