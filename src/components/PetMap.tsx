import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { PetCase, Vet } from "@/types/pet";
import { TERESINA_CENTER } from "@/data/mockData";
import { isUrgent } from "@/lib/petHelpers";

import { openRoute } from "@/lib/openRoute";

interface Props {
  pets: PetCase[];
  vets?: Vet[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showVets?: boolean;
  center?: { lat: number; lng: number };
  fitKey?: string;
  className?: string;
}

// Patinha branca desenhada em SVG (independe de fonte/emoji)
const WHITE_PAW_SVG = `
  <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
    <ellipse cx="5.2" cy="10.2" rx="2" ry="2.6"/>
    <ellipse cx="9.4" cy="6.6" rx="2.1" ry="2.8"/>
    <ellipse cx="14.6" cy="6.6" rx="2.1" ry="2.8"/>
    <ellipse cx="18.8" cy="10.2" rx="2" ry="2.6"/>
    <path d="M12 10.2c-3.4 0-6 2.4-6 5.3 0 2 1.5 3.3 3.4 3.3 1 0 1.7-.3 2.6-.3s1.6.3 2.6.3c1.9 0 3.4-1.3 3.4-3.3 0-2.9-2.6-5.3-6-5.3z"/>
  </svg>
`;

function buildPetIcon(pet: PetCase, selected: boolean) {
  const urgent = isUrgent(pet.status);
  const resolved =
    pet.status === "rescued" ||
    pet.status === "adopted" ||
    pet.status === "closed";
  const isCommunity = pet.communityStatus === "community";
  const isStar = pet.communityStatus === "neighborhood_star";
  const isDog = pet.species === "dog";
  // Cão = vermelho, gato = laranja; status especiais mantêm sua cor
  const bg = isStar
    ? "hsl(45 93% 47%)"
    : isCommunity
    ? "hsl(217 91% 60%)"
    : resolved
      ? "hsl(142 55% 42%)"
      : isDog
        ? "hsl(0 78% 56%)"
        : "hsl(28 91% 54%)";
  const pulse = urgent ? "pin-pulse" : isStar ? "pin-pulse-star" : "";
  const pulseColor = urgent ? "hsl(0 78% 56%)" : "hsl(45 93% 47%)";
  return L.divIcon({
    className: "custom-pin",
    iconSize: [42, 42],
    iconAnchor: [21, 38],
    html: `
      <div style="width:42px;height:42px;position:relative;">
        ${selected ? `<div style="position:absolute;inset:-5px;border-radius:50% 50% 50% 0;background:hsl(28 91% 54% / 0.35);transform:rotate(-45deg);filter:blur(2px);"></div>` : ""}
        <div class="${pulse}" style="
          position:absolute;inset:0;width:42px;height:42px;
          border-radius:50% 50% 50% 0;background:${bg};color:${pulseColor};
          display:grid;place-items:center;border:3px solid white;
          transform:rotate(-45deg);filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));
        "><span style="transform:rotate(45deg);display:grid;place-items:center;line-height:0;">${WHITE_PAW_SVG}</span></div>
      </div>
    `,
  });
}

function buildVetIcon(type: Vet["type"] = "clinic") {
  const palette: Record<Vet["type"], { bg: string; ring: string; label: string; text: string }> = {
    hospital: { bg: "hsl(0 78% 56%)", ring: "hsl(0 78% 56%)", label: "+", text: "white" },
    clinic: { bg: "white", ring: "hsl(28 91% 54%)", label: "+", text: "hsl(28 91% 45%)" },
    ngo: { bg: "hsl(142 55% 42%)", ring: "hsl(142 55% 42%)", label: "♥", text: "white" },
  };
  const p = palette[type];
  return L.divIcon({
    className: "custom-pin",
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    html: `
      <div style="width:34px;height:34px;position:relative;filter:drop-shadow(0 4px 8px rgba(0,0,0,.25));">
        <div style="
          position:absolute;inset:0;width:34px;height:34px;
          border-radius:50% 50% 50% 0;background:${p.bg};
          display:grid;place-items:center;border:2px solid ${p.ring};
          transform:rotate(-45deg);line-height:1;
        "><span style="transform:rotate(45deg);color:${p.text};font-weight:700;font-size:14px;">${p.label}</span></div>
      </div>
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
  fitKey,
  className,
}: Props) {
  const center = useMemo<[number, number]>(() => TERESINA_CENTER, []);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const vetsRef = useRef<L.LayerGroup | null>(null);
  const fitFirstRunRef = useRef(true);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView(center, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 20,
      maxNativeZoom: 19,
      crossOrigin: true,
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
              style="display:inline-block;margin-top:8px;padding:6px 10px;background:hsl(28 91% 54%);color:white;border-radius:999px;font-size:11px;font-weight:600;text-decoration:none"
              onclick="event.preventDefault();navigator.geolocation.getCurrentPosition(function(p){window.open('https://www.google.com/maps/dir/?api=1&origin='+p.coords.latitude+','+p.coords.longitude+'&destination=${v.lat},${v.lng}&travelmode=driving','_blank')},function(){window.open('https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}','_blank')})">
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

  // Ao trocar de filtro (fitKey), aproxima o mapa para enquadrar os pins visíveis —
  // assim o usuário vê imediatamente onde estão os animais daquele filtro.
  // Com "Todos" o mapa não se move: abre centrado em Teresina.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitKey || fitKey === "all") return;
    const pts = pets
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => [p.lat, p.lng] as [number, number]);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.flyTo(pts[0], 15, { duration: 0.8 });
    } else {
      map.flyToBounds(L.latLngBounds(pts), {
        paddingTopLeft: [40, 170],
        paddingBottomRight: [40, 160],
        maxZoom: 15,
        duration: 0.8,
      });
    }
    // pets só muda quando os dados carregam ou o filtro troca — evita re-enquadrar
    // enquanto o usuário explora o mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, pets]);

  return (
    <div className={className}>
      <div ref={mapElementRef} className="size-full" />
    </div>
  );
}