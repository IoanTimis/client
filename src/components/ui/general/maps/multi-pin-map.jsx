"use client";

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ensure default marker icons work in Next.js by pointing to CDN assets
// (avoids bundler issues with leaflet image assets)
if (typeof window !== "undefined") {
  const DefaultIcon = L.Icon.Default;
  DefaultIcon.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Fit bounds to markers
function FitBounds({ markers }) {
  const map = useMap();
  React.useEffect(() => {
    if (!markers?.length) return;
    const l = markers.map(m => [m.lat, m.lng]);
    const bounds = L.latLngBounds(l);
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [markers, map]);
  return null;
}

function MapClickCatcher({ onMapClick }) {
  const map = useMap();
  React.useEffect(() => {
    if (!onMapClick) return;
    const handler = () => onMapClick();
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onMapClick]);
  return null;
}

export default function MapMarkers({
  markers = [],
  heightClass = "h-[360px]",
  className = "",
  onMarkerClick,
  onMapClick,
}) {
  const center = useMemo(() => markers[0] ? [markers[0].lat, markers[0].lng] : [44.4268, 26.1025], [markers]);
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-white ${heightClass} ${className} relative z-0`}>
      <MapContainer center={center} zoom={13} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {markers.map((m) => (
          <Marker
            key={m.id ?? `${m.lat},${m.lng}`}
            position={[m.lat, m.lng]}
            eventHandlers={onMarkerClick ? {
              click: (e) => {
                // Prevent any outer click listeners from triggering (like open modal)
                e.originalEvent?.stopPropagation?.();
                onMarkerClick(m);
              },
            } : undefined}
          >
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
        <FitBounds markers={markers} />
        {onMapClick ? <MapClickCatcher onMapClick={onMapClick} /> : null}
      </MapContainer>
    </div>
  );
}