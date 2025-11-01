"use client";
/**
 * Button — styled button/link primitive with variants and sizes.
 *
 * Props
 * - as?: React.ElementType ("button") — render as a different element (e.g., 'a', Link)
 * - variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'empty-blue' | 'empty-gray' | 'empty-green' | 'empty-red' | 'empty-yellow' | 'empty-purple'
 * - size?: 'sm' | 'md' | 'lg'
 * - className?: string
 * - type?: 'button' | 'submit' | 'reset' (defaults to 'button' when as==='button')
 * - ...props — forwarded to the rendered element
 *
 * Usage
 *   <Button variant="primary" size="md">Save</Button>
 */
import React from "react";
import { cn, variantClass } from "@/lib/Ui";

const variants = {
	primary:
		"bg-blue-900 text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
	secondary:
		"bg-gray-600 hover:bg-gray-500 text-white focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 disabled:hover:none disabled:cursor-not-allowed focus-visible:ring-offset-background cursor-pointer",
	ghost:
		"bg-gray-300 text-white hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
	destructive:
		"bg-red-600 text-white hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
	// Outline color variants ("empty-*") inspired by provided styles
	"empty-blue":
		"bg-transparent text-blue-700 border border-blue-700 hover:bg-blue-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer dark:text-blue-500 dark:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus-visible:ring-blue-800 disabled:text-gray-900 disabled:border-gray-900 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:none dark:disabled:text-gray-400 dark:disabled:border-gray-600",
	"empty-gray":
		"bg-transparent text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus-visible:ring-gray-800 disabled:text-gray-900 disabled:border-gray-900 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:none dark:disabled:text-gray-400 dark:disabled:border-gray-600",
	"empty-green":
		"bg-transparent text-green-700 border border-green-700 hover:bg-green-800 hover:text-white focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer dark:text-green-500 dark:border-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus-visible:ring-green-800 disabled:text-gray-900 disabled:border-gray-900 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:none dark:disabled:text-gray-400 dark:disabled:border-gray-600",
	"empty-red":
		"bg-transparent text-red-700 border border-red-700 hover:bg-red-800 hover:text-white focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer dark:text-red-500 dark:border-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus-visible:ring-red-900 disabled:text-gray-900 disabled:border-gray-900 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:none dark:disabled:text-gray-400 dark:disabled:border-gray-600",
	"empty-yellow":
		"bg-transparent text-yellow-400 border border-yellow-400 hover:bg-yellow-500 hover:text-white focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer dark:text-yellow-300 dark:border-yellow-300 dark:hover:bg-yellow-400 dark:hover:text-white dark:focus-visible:ring-yellow-900 disabled:text-gray-900 disabled:border-gray-900 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:none dark:disabled:text-gray-400 dark:disabled:border-gray-600",
	"empty-purple":
		"bg-transparent text-purple-700 border border-purple-700 hover:bg-purple-800 hover:text-white focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-500 dark:hover:text-white dark:focus-visible:ring-purple-900 disabled:text-gray-900 disabled:border-gray-900 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:none dark:disabled:text-gray-400 dark:disabled:border-gray-600",
};

const sizes = {
	sm: "h-9 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-11 px-5 text-base",
};

const Button = React.forwardRef(function Button(
	{ as: Comp = "button", variant = "primary", size = "md", className, type, ...props },
	ref
){
	const base =
		"inline-flex items-center justify-center rounded-md font-medium transition-colors select-none gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed  aria-disabled:opacity-50 aria-disabled:cursor-not-allowed ";
	const variantAndSize = variantClass({ variant: variants, size: sizes }, { variant, size });
		const safeType = type ?? (Comp === "button" ? "button" : undefined);
		return (
			<Comp ref={ref} type={safeType} className={cn(base, variantAndSize, className)} {...props} />
		);
});

export default Button;

