/**
 * Li — list item with optional dense spacing.
 * Props: dense?: boolean, className?, as?
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Li = React.forwardRef(function Li(
	{ className, children, dense = false, as: Tag = "li" },
	ref
){
	const base = "marker:text-gray-500";
	const space = dense ? "my-1" : "my-2";
	return (
		<Tag ref={ref} className={cn(base, space, className)}>
			{children}
		</Tag>
	);
});

export default Li;

