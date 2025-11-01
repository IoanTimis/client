"use client";

/**
 * VerticalAddCard — a vertical card variant used as an "Add new" entry in a grid.
 * Visual style matches VerticalCard but shows an add affordance and is fully clickable.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/general/primitives/button";
import { useLanguage } from "@/context/language-context";

export default function VerticalAddCard({
  href = null,
  onClick = null,
  imageSrc = "/imgs/default_photos/placeholder-light-1x1.svg",
  imageAlt = "Add",
  title: titleProp,
  description: descProp,
  ctaLabel: ctaProp,
  disabled = false,
  target,
  rel,
  className = "",
}) {
  const { t } = useLanguage();
  const title = titleProp ?? t("addCard.title");
  const description = descProp ?? t("addCard.description");
  const ctaLabel = ctaProp ?? t("addCard.cta");
  // Hardcoded demo values to align visuals with product cards
  const hardcodedPrice = "000 lei";
  const hardcodedFeature = "Nou";

  const CardTop = ({ children }) => {
    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          aria-label={title}
          className="block"
        >
          {children}
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={onClick || undefined}
        aria-label={title}
        disabled={disabled}
        className="block w-full text-left disabled:opacity-60 disabled:pointer-events-none"
      >
        {children}
      </button>
    );
  };

  return (
    <div className={[
      "w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow",
      disabled ? "opacity-60 pointer-events-none" : "",
      className,
    ].join(" ")}>
      {/* Top area (image/placeholder) */}
      <CardTop>
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg bg-gray-50 flex items-center justify-center">
          {/* Background image (optional) */}
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              className="object-contain p-6 opacity-80"
              sizes="100vw"
              priority
            />
          ) : null}
          {/* Overlay plus sign */}
          <span className="absolute inset-auto inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-3xl font-bold shadow-md">
            +
          </span>
        </div>
      </CardTop>

      {/* Content */}
  <div className="flex flex-col p-4 leading-normal text-black min-h-[220px]">
        <div className="block">
          <h5 className="mb-1 text-lg font-semibold tracking-tight text-black line-clamp-2">
            {title}
          </h5>
        </div>

        {/* Price (hardcoded for visual consistency) */}
        <div className="mb-2 text-lg font-semibold">{hardcodedPrice}</div>

        {description ? (
          <p className="mb-3 text-sm text-gray-700 line-clamp-2">{description}</p>
        ) : null}

        {/* One feature badge to mimic product cards */}
        <div className="mb-3 -mt-1 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md border border-gray-200 bg-imo px-2 py-1 text-xs font-medium text-gray-900">
            {hardcodedFeature}
          </span>
        </div>

        <div className="mt-auto w-full flex flex-wrap items-center gap-2 justify-end">
          {href ? (
            <Button as={Link} href={href} variant="empty-blue" target={target} rel={rel} aria-label={title}>
              {ctaLabel}
            </Button>
          ) : (
            <Button onClick={onClick || undefined} variant="empty-blue" aria-label={title} disabled={disabled}>
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
