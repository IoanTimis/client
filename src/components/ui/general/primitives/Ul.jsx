/**
 * Ul — styled unordered/ordered list container.
 * Props: marker?: 'none'|'disc'|'decimal'|'square'|'circle', className?, as?
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Ul = React.forwardRef(function Ul(
		{ className, children, marker = "disc", as: Tag = "ul" },
	ref
){
		const base = "my-4 pl-6 space-y-2 text-gray-800";
		const markerMap = {
			none: "list-none pl-0",
			disc: "list-outside list-disc",
			decimal: "list-outside list-decimal",
			square: "list-outside list-[square]", // arbitrary value
			circle: "list-outside list-[circle]",
		};
		const style = markerMap[marker] ?? markerMap.disc;
	return (
		<Tag ref={ref} className={cn(base, style, className)}>
			{children}
		</Tag>
	);
});

export default Ul;

