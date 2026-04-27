import { PetCase } from "@/types/pet";
import { RescueStatusBadge } from "./RescueStatusBadge";
import { speciesLabel, timeAgo } from "@/lib/petHelpers";
import { MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  pet: PetCase;
  variant?: "full" | "compact";
}

export function PetCard({ pet, variant = "full" }: Props) {
  const [saved, setSaved] = useState(false);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((v) => !v);
    toast.success(saved ? "Removido dos favoritos" : "Salvo nos favoritos");
  };

  if (variant === "compact") {
    return (
      <Link
        to={`/pet/${pet.id}`}
        className="flex gap-3 rounded-3xl bg-card p-3 shadow-soft hover:shadow-elegant transition-shadow"
      >
        <img
          src={pet.photos[0]}
          alt={pet.title}
          loading="lazy"
          className="size-20 rounded-2xl object-cover"
        />
        <div className="flex-1 min-w-0 py-1">
          <RescueStatusBadge status={pet.status} />
          <h3 className="mt-1.5 font-display font-semibold text-sm leading-tight line-clamp-2">
            {pet.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" />
            <span className="truncate">{pet.neighborhood}</span>
            {pet.distanceKm && <span>· {pet.distanceKm} km</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/pet/${pet.id}`}
      className="block group animate-float-up"
    >
      <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all group-hover:shadow-elegant group-active:scale-[0.99]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={pet.photos[0]}
            alt={pet.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <RescueStatusBadge status={pet.status} />
            <button
              onClick={toggleSave}
              aria-label="Salvar"
              className="size-9 rounded-full bg-background/85 backdrop-blur grid place-items-center text-foreground hover:bg-background transition"
            >
              <Heart className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="text-[11px] uppercase tracking-wider opacity-90">
              {speciesLabel[pet.species]} · {timeAgo(pet.reportedAt)}
            </div>
            <h3 className="mt-1 font-display font-bold text-lg leading-tight text-balance">
              {pet.title}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 opacity-95">
                <MapPin className="size-3.5" />
                <span>
                  {pet.neighborhood}
                  {pet.distanceKm && ` · ${pet.distanceKm} km`}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-95">
                <Heart className="size-3.5 fill-current" />
                <span>{pet.helpers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}