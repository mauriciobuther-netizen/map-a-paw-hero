import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { PetCase, Vet } from "@/types/pet";
import { TERESINA_CENTER } from "@/data/mockData";
import { isUrgent } from "@/lib/petHelpers";

interface Props {
  pets: PetCase[];
  vets?: Vet[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showVets?: boolean;
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

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function PetMap({
  pets,
  vets = [],
  selectedId,
  onSelect,
  showVets = true,
  className,
}: Props) {
  const center = useMemo<[number, number]>(() => TERESINA_CENTER, []);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="size-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Recenter center={center} />
        {pets.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={buildPetIcon(p, selectedId === p.id)}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
          />
        ))}
        {showVets &&
          vets.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={buildVetIcon()}
            />
          ))}
      </MapContainer>
    </div>
  );
}