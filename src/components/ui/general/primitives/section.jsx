/**
 * Section — vertical section with optional container.
 * Props: contained?: boolean (true), className?, as?
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

const Section = React.forwardRef(function Section(
	{ className, children, contained = true, as: Tag = "section" },
	ref
){
	const y = "py-8 md:py-12";
	const container = "mx-auto text-black w-full max-w-6xl px-4 md:px-6";
	return (
		<Tag ref={ref} className={cn(y, className)}>
			{contained ? <div className={container}>{children}</div> : children}
		</Tag>
	);
});

export default Section;

