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

function buildVetIcon() {
  return L.divIcon({
    className: "custom-pin",
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    html: `
      <div style="
        width:34px;height:34px;border-radius:12px;
        background:white;display:grid;place-items:center;
        border:2px solid hsl(28 91% 54%);
        box-shadow:0 4px 12px -2px rgba(0,0,0,.25);
        color:hsl(28 91% 45%);font-weight:700;font-size:14px;
      ">+</div>
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
        L.marker([v.lat, v.lng], { icon: buildVetIcon() }).addTo(vetLayer);
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