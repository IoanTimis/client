/**
 * P — paragraph text with standard spacing and color.
 * Props: className?, as?
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const P = React.forwardRef(function P(
	{ className, children, as: Tag = "p" },
	ref
){
	const base = "leading-7 text-gray-700 max-w-prose";
	const spacing = "mt-4";
	return (
		<Tag ref={ref} className={cn(base, spacing, className)}>
			{children}
		</Tag>
	);
});

export default P;

