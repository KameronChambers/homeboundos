import { useEffect, useRef } from "react";
import type { Map as LMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { HOME, HOSPITAL } from "@/lib/care-data";

// Browser-only: rendered via React.lazy behind <ClientOnly>.
export default function DetroitMap({ progress }: { progress: number }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const van = useRef<Marker | null>(null);

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
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(m);
      const pin = (emoji: string) =>
        L.divIcon({ html: `<div style="font-size:26px;line-height:1">${emoji}</div>`, className: "", iconSize: [28, 28], iconAnchor: [14, 14] });
      L.marker([HOME.lat, HOME.lng], { icon: pin("🏠") }).addTo(m).bindPopup(HOME.label);
      L.marker([HOSPITAL.lat, HOSPITAL.lng], { icon: pin("🏥") }).addTo(m).bindPopup(HOSPITAL.label).openPopup();
      L.polyline(
        [
          [HOME.lat, HOME.lng],
          [HOSPITAL.lat, HOSPITAL.lng],
        ],
        { dashArray: "8 8", weight: 4, color: "#2f7d64" },
      ).addTo(m);
      van.current = L.marker([HOME.lat, HOME.lng], { icon: pin("🚐") }).addTo(m);
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const p = Math.min(1, Math.max(0, progress));
    van.current?.setLatLng([HOME.lat + (HOSPITAL.lat - HOME.lat) * p, HOME.lng + (HOSPITAL.lng - HOME.lng) * p]);
  }, [progress]);

  return <div ref={el} className="h-72 w-full overflow-hidden rounded-xl border" aria-label="Map of Detroit transport route" />;
}
