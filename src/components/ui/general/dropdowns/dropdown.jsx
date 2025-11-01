/**
 * Dropdown components — accessible menu primitives.
 *
 * Components
 * - Dropdown: provides context; props: open?, onOpenChange?, align?: 'start'|'center'|'end'
 * - DropdownTrigger: toggles menu; can render as button/link; supports icons
 * - DropdownContent: positioned panel; accepts width and alignment
 * - DropdownItem: item that can be link or button; closes on select by default
 * - DropdownSeparator: visual separator line
 */
"use client";
import React from "react";
import { cn } from "@/lib/Ui";
import NextLink from "next/link";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const DropdownContext = React.createContext(null);

export function Dropdown({ children, open: openProp, onOpenChange, align = "end", variant = "light", className }) {
  const [open, setOpen] = React.useState(false);
  const controlled = typeof openProp === "boolean";
  const isOpen = controlled ? openProp : open;
  const setIsOpen = React.useCallback((v) => {
    if (controlled) onOpenChange?.(v);
    else setOpen(v);
  }, [controlled, onOpenChange]);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e) => {
      if (
        triggerRef.current && triggerRef.current.contains(e.target)
      ) return;
      if (
        contentRef.current && contentRef.current.contains(e.target)
      ) return;
      setIsOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setIsOpen]);

  const value = React.useMemo(() => ({ isOpen, setIsOpen, triggerRef, contentRef, align, variant }), [isOpen, setIsOpen, align, variant]);
  return (
    <DropdownContext.Provider value={value}>
      <div className={cn("relative inline-block text-left", className)}>{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  as: Comp = "button",
  className,
  children,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  showChevron = true,
  ...props
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownTrigger must be used within Dropdown");
  const { isOpen, setIsOpen, triggerRef, variant } = ctx;

  const baseLight = "cursor-pointer inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
  const baseNav = "cursor-pointer inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white hover:bg-white/20 hover:text-blue-400 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900";
  return (
    <Comp
      ref={triggerRef}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={(e) => {
        props.onClick?.(e);
        setIsOpen(!isOpen);
      }}
      className={cn(variant === "nav" ? baseNav : baseLight, className)}
      {...props}
    >
      {LeadingIcon ? <LeadingIcon className="size-4" aria-hidden /> : null}
      <span className="truncate">{children}</span>
      {TrailingIconOrChevron(TrailingIcon, showChevron)}
    </Comp>
  );
}

function TrailingIconOrChevron(TrailingIcon, showChevron) {
  if (TrailingIcon) return <TrailingIcon className="size-4" aria-hidden />;
  if (!showChevron) return null;
  return <ChevronDownIcon className="size-4 opacity-70" aria-hidden />;
}

export function DropdownContent({ className, children, width = "w-56" }) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownContent must be used within Dropdown");
  const { isOpen, contentRef, align, variant } = ctx;
  if (!isOpen) return null;
  const alignCls = align === "start" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";
  const panelLight = "absolute z-50 mt-2 origin-top rounded-md border border-gray-200 bg-white text-black shadow-lg ring-1 ring-black/5";
  const panelNav = "absolute z-50 mt-2 origin-top rounded-md border border-gray-800 bg-gray-900 text-white shadow-lg ring-1 ring-black/20 backdrop-blur-sm";
  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(variant === "nav" ? panelNav : panelLight, width, alignCls, className)}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
}

export function DropdownItem({
  as: Comp = "button",
  className,
  onClick,
  href,
  children,
  closeOnSelect = true,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  ...props
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownItem must be used within Dropdown");
  const { setIsOpen, variant } = ctx;

  const CompEl = href ? NextLink : Comp;
  const itemLight = "cursor-pointer w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2";
  const itemNav = "cursor-pointer w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-gray-800 flex items-center gap-2";
  return (
    <CompEl
      href={href}
      className={cn(variant === "nav" ? itemNav : itemLight, className)}
      onClick={(e) => {
        onClick?.(e);
        if (closeOnSelect) setIsOpen(false);
      }}
      {...props}
    >
      {LeadingIcon ? <LeadingIcon className="size-4" aria-hidden /> : null}
      <span className="truncate">{children}</span>
      {TrailingIcon ? <TrailingIcon className="size-4 ml-auto" aria-hidden /> : null}
    </CompEl>
  );
}

export function DropdownSeparator() {
  const ctx = React.useContext(DropdownContext);
  // Fallback if used outside, but normally used within context
  const variant = ctx?.variant ?? "light";
  return <div className={cn("my-1 h-px", variant === "nav" ? "bg-gray-800" : "bg-gray-200")} />;
}
