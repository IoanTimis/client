/**
 * Card — container with rounded corners, backdrop, and optional border.
 * Subcomponents: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 * Props: className?, as?, padding?: 'sm'|'md'|'lg', bordered?: boolean
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";

export const Card = React.forwardRef(function Card(
  { className, children, as: Tag = "div", padding = "md", bordered = true },
  ref
){
  const padMap = { sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <Tag
      ref={ref}
      className={cn(
        "rounded-xl bg-white text-black shadow-sm",
        bordered && "border border-foreground/10",
        padMap[padding] ?? padMap.md,
        className
      )}
    >
      {children}
    </Tag>
  );
});

export const CardHeader = ({ className, children, as: Tag = "div" }) => (
  <Tag className={cn("mb-4", className)}>{children}</Tag>
);

export const CardTitle = ({ className, children, as: Tag = "h3" }) => (
  <Tag className={cn("text-xl font-semibold tracking-tight", className)}>
    {children}
  </Tag>
);

export const CardDescription = ({ className, children, as: Tag = "p" }) => (
  <Tag className={cn("text-sm text-gray-700 mt-1", className)}>{children}</Tag>
);

export const CardContent = ({ className, children, as: Tag = "div" }) => (
  <Tag className={cn("mt-4 space-y-3", className)}>{children}</Tag>
);

export const CardFooter = ({ className, children, as: Tag = "div" }) => (
  <Tag className={cn("mt-6 flex items-center justify-end gap-2", className)}>
    {children}
  </Tag>
);

export default Card;
