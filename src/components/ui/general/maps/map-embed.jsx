"use client";

import React from "react";
import { cn } from "@/lib/Ui";

/**
 * MapEmbed — lightweight configurable map via iframe.
 * Defaults to Google Maps embed, no API key required.
 * Also supports OpenStreetMap when provider="osm".
 *
 * Props:
 * - provider?: 'google' | 'osm' (default 'google')
 * - centerLat: number (required)
 * - centerLng: number (required)
 * - zoom?: number (default 15)
 * - query?: string (Google only) — if provided, use this text query for the pin instead of lat/lng
 * - pinLat?: number (defaults to centerLat)
 * - pinLng?: number (defaults to centerLng)
 * - label?: string (optional label for the query)
 * - height?: string tailwind class for height (default 'h-[360px]')
 * - className?: string extra classes for wrapper
 */
export default function MapEmbed({
  provider = "google",
  centerLat,
  centerLng,
  zoom = 15,
  pinLat,
  pinLng,
  query,
  label,
  height = "h-[360px]",
  className = "",
}) {
  const lat = typeof pinLat === "number" ? pinLat : centerLat;
  const lng = typeof pinLng === "number" ? pinLng : centerLng;

  const buildGoogle = () => {
    const qRaw = query && query.trim().length ? query : `${lat},${lng}${label ? ` (${label})` : ""}`;
    const q = encodeURIComponent(qRaw);
    return `https://www.google.com/maps?q=${q}&z=${encodeURIComponent(String(zoom))}&output=embed`;
  };

  const buildOSM = () => {
    // approximate bbox span based on zoom; tighter for higher zoom
    const spanBase = 0.02; // degrees at zoom ~15
    const span = Math.max(0.001, Math.min(1, spanBase * Math.pow(2, (15 - Number(zoom || 15)))));
    const minLat = centerLat - span;
    const maxLat = centerLat + span;
    const minLng = centerLng - span;
    const maxLng = centerLng + span;
    const bbox = `${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}`;
    const marker = `${lat}%2C${lng}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  };

  const src = provider === "osm" ? buildOSM() : buildGoogle();

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-gray-200 bg-white", height, className)}>
      <iframe
        title={label || (provider === 'osm' ? 'OpenStreetMap' : 'Google Map')}
        src={src}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
