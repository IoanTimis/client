/**
 * Link — wrapper around NextLink with optional underline and focus styles.
 * Props: component?, underline?, className?, ...props forwarded to component
 */
"use client";
import React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/Ui";

const Link = React.forwardRef(function Link(
	{ className, children, component: Comp = NextLink, underline = false, ...props },
	ref
){
		const base =
			"inline-flex items-center text-black hover:text-black/80 focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
	const deco = underline ? "underline underline-offset-4" : "no-underline";
	return (
		<Comp ref={ref} className={cn(base, deco, className)} {...props}>
			{children}
		</Comp>
	);
});

export default Link;

