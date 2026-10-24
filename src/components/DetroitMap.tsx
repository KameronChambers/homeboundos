import { useEffect, useRef } from "react";
import type { Map as LMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { HOME, HOSPITAL } from "@/lib/care-data";

// Browser-only: rendered via React.lazy behind <ClientOnly>.
export default function DetroitMap({ pos, homeLabel = HOME.label, destinationLabel = HOSPITAL.label, mapLabel = "Map of Detroit transport route" }: { pos: { lat: number; lng: number }; homeLabel?: string; destinationLabel?: string; mapLabel?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const van = useRef<Marker | null>(null);
  const home = useRef<Marker | null>(null);
  const destination = useRef<Marker | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      const L = mod.default ?? mod;
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { scrollWheelZoom: false }).fitBounds(
        [
          [HOME.lat, HOME.lng],
          [HOSPITAL.lat, HOSPITAL.lng],
        ],
        { padding: [40, 40] },
      );
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(m);
      const pin = (emoji: string) =>
        L.divIcon({ html: `<div style="font-size:26px;line-height:1">${emoji}</div>`, className: "", iconSize: [28, 28], iconAnchor: [14, 14] });
      home.current = L.marker([HOME.lat, HOME.lng], { icon: pin("🏠") }).addTo(m).bindPopup(homeLabel);
      destination.current = L.marker([HOSPITAL.lat, HOSPITAL.lng], { icon: pin("🏥") }).addTo(m).bindPopup(destinationLabel).openPopup();
      L.polyline(
        [
          [HOME.lat, HOME.lng],
          [HOSPITAL.lat, HOSPITAL.lng],
        ],
        { dashArray: "8 8", weight: 4, color: "#2b5fb8" },
      ).addTo(m);
      van.current = L.marker([pos.lat, pos.lng], { icon: pin("🚐") }).addTo(m);
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    home.current?.setPopupContent(homeLabel);
    destination.current?.setPopupContent(destinationLabel);
  }, [homeLabel, destinationLabel]);

  useEffect(() => {
    van.current?.setLatLng([pos.lat, pos.lng]);
  }, [pos.lat, pos.lng]);

  return <div ref={el} className="h-72 w-full overflow-hidden rounded-xl border" aria-label={mapLabel} />;
}
