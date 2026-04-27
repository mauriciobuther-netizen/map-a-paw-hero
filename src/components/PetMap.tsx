import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { PetCase, Vet } from "@/types/pet";
import { TERESINA_CENTER } from "@/data/mockData";
import { isUrgent } from "@/lib/petHelpers";

interface Props {
  pets: PetCase[];
  vets?: Vet[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showVets?: boolean;
  center?: { lat: number; lng: number };
  className?: string;
}

function buildPetIcon(pet: PetCase, selected: boolean) {
  const urgent = isUrgent(pet.status);
  const resolved =
    pet.status === "rescued" ||
    pet.status === "adopted" ||
    pet.status === "closed";
  const bg = urgent
    ? "hsl(0 78% 56%)"
    : resolved
      ? "hsl(142 55% 42%)"
      : "hsl(28 91% 54%)";
  const emoji = pet.species === "dog" ? "🐶" : "🐱";
  const ring = selected ? "box-shadow: 0 0 0 4px hsl(28 91% 54% / 0.35);" : "";
  const pulse = urgent ? "pin-pulse" : "";
  return L.divIcon({
    className: "custom-pin",
    iconSize: [42, 42],
    iconAnchor: [21, 38],
    html: `
      <div class="${pulse}" style="
        width:42px;height:42px;border-radius:50%;
        background:${bg};display:grid;place-items:center;
        border:3px solid white;${ring}
        box-shadow:0 6px 16px -4px rgba(0,0,0,.35);
        font-size:20px;
      ">${emoji}</div>
    `,
  });
}

function buildVetIcon(type: Vet["type"] = "clinic") {
  const palette: Record<Vet["type"], { bg: string; ring: string; label: string }> = {
    hospital: { bg: "hsl(0 78% 56%)", ring: "hsl(0 78% 56%)", label: "+" },
    clinic: { bg: "white", ring: "hsl(28 91% 54%)", label: "+" },
    ngo: { bg: "hsl(142 55% 42%)", ring: "hsl(142 55% 42%)", label: "♥" },
  };
  const p = palette[type];
  const isHospital = type === "hospital";
  const isNgo = type === "ngo";
  const textColor = isHospital || isNgo ? "white" : "hsl(28 91% 45%)";
  return L.divIcon({
    className: "custom-pin",
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    html: `
      <div style="
        width:34px;height:34px;border-radius:12px;
        background:${p.bg};display:grid;place-items:center;
        border:2px solid ${p.ring};
        box-shadow:0 4px 12px -2px rgba(0,0,0,.25);
        color:${textColor};font-weight:700;font-size:16px;line-height:1;
      ">${p.label}</div>
    `,
  });
}

export function PetMap({
  pets,
  vets = [],
  selectedId,
  onSelect,
  showVets = true,
  center: centerProp,
  className,
}: Props) {
  const center = useMemo<[number, number]>(() => TERESINA_CENTER, []);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const vetsRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView(center, 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    vetsRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      markersRef.current?.clearLayers();
      vetsRef.current?.clearLayers();
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      vetsRef.current = null;
    };
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markersRef.current;
    const vetLayer = vetsRef.current;
    if (!map || !markerLayer || !vetLayer) return;

    markerLayer.clearLayers();
    vetLayer.clearLayers();

    pets.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: buildPetIcon(p, selectedId === p.id),
      });

      marker.on("click", () => onSelect?.(p.id));
      marker.addTo(markerLayer);
    });

    if (showVets) {
      vets.forEach((v) => {
        const typeLabel =
          v.type === "hospital" ? "Hospital 24h"
          : v.type === "ngo" ? "ONG / Zoonoses"
          : "Clínica veterinária";
        const popup = `
          <div style="font-family:inherit;min-width:200px">
            <div style="font-weight:700;font-size:13px;line-height:1.2;margin-bottom:4px">${v.name}</div>
            <div style="font-size:11px;color:#666;margin-bottom:6px">${typeLabel}</div>
            <div style="font-size:11px;line-height:1.3">${v.address}</div>
            ${v.phone ? `<div style="font-size:11px;margin-top:4px"><a href="tel:${v.phone.replace(/[^0-9+]/g, "")}" style="color:hsl(28 91% 45%);font-weight:600;text-decoration:none">📞 ${v.phone}</a></div>` : ""}
            ${v.hours ? `<div style="font-size:11px;color:#666;margin-top:2px">🕒 ${v.hours}</div>` : ""}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}" target="_blank" rel="noopener"
              style="display:inline-block;margin-top:8px;padding:6px 10px;background:hsl(28 91% 54%);color:white;border-radius:999px;font-size:11px;font-weight:600;text-decoration:none">
              Ver rota
            </a>
          </div>
        `;
        L.marker([v.lat, v.lng], { icon: buildVetIcon(v.type) })
          .bindPopup(popup, { closeButton: true, className: "vet-popup" })
          .addTo(vetLayer);
      });
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [pets, vets, selectedId, onSelect, showVets]);

  // Re-center on user position when provided
  useEffect(() => {
    if (!mapRef.current || !centerProp) return;
    mapRef.current.flyTo([centerProp.lat, centerProp.lng], 15, { duration: 0.8 });
  }, [centerProp]);

  return (
    <div className={className}>
      <div ref={mapElementRef} className="size-full" />
    </div>
  );
}