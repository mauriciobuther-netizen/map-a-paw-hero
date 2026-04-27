import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PetMap } from "@/components/PetMap";
import { FilterChips } from "@/components/FilterChips";
import { mockVets } from "@/data/mockData";
import { PetCard } from "@/components/PetCard";
import { Search, LocateFixed, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchActiveReports, rowToPetCase, getCurrentPosition, type ReportRow } from "@/lib/reports";
import { toast } from "sonner";
import type { PetCase } from "@/types/pet";

const filters = [
  { id: "all", label: "Todos" },
  { id: "urgent", label: "Urgente", icon: "🚨" },
  { id: "dog", label: "Cachorros", icon: "🐶" },
  { id: "cat", label: "Gatos", icon: "🐱" },
  { id: "injured", label: "Feridos" },
  { id: "recent", label: "Recentes" },
  { id: "resolved", label: "Resolvidos" },
];

export default function MapScreen() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | undefined>();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let active = true;
    fetchActiveReports()
      .then((d) => active && setRows(d))
      .catch((e) => toast.error("Falha ao carregar casos", { description: e.message }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const allPets: PetCase[] = useMemo(() => rows.map(rowToPetCase), [rows]);

  const pets = useMemo(() => {
    switch (filter) {
      case "urgent":
        return allPets.filter((p) => p.status === "urgent" || p.status === "injured");
      case "dog":
        return allPets.filter((p) => p.species === "dog");
      case "cat":
        return allPets.filter((p) => p.species === "cat");
      case "injured":
        return allPets.filter((p) => p.status === "injured");
      case "recent":
        return [...allPets].sort(
          (a, b) => +new Date(b.reportedAt) - +new Date(a.reportedAt),
        );
      case "resolved":
        return allPets.filter(
          (p) => p.status === "rescued" || p.status === "adopted" || p.status === "closed",
        );
      default:
        return allPets;
    }
  }, [filter, allPets]);

  const selectedPet = pets.find((p) => p.id === selected);

  async function centerOnMe() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      toast.success("Localização atualizada", {
        description: "Centramos o mapa na sua posição.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível obter a localização.";
      toast.error("Localização indisponível", { description: msg });
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mobile-shell relative overflow-hidden isolate">
        {/* Mapa em fullscreen */}
        <div className="absolute inset-0 z-0">
          <PetMap
            pets={pets}
            vets={mockVets}
            selectedId={selected}
            onSelect={setSelected}
            center={userPos ?? undefined}
            className="size-full"
          />
        </div>

        {/* Header flutuante */}
        <div className="absolute inset-x-0 top-0 z-[1000] px-5 pt-5 pointer-events-none">
          <div className="flex items-center gap-2">
            <Link
              to="/app/explore"
              className="pointer-events-auto flex-1 flex items-center gap-3 rounded-full bg-card/95 backdrop-blur-xl pl-5 pr-2 py-2 shadow-elegant border border-border/60"
            >
              <Search className="size-4 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold leading-tight">Teresina, PI</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  {loading ? "A carregar casos..." : `${pets.length} casos ativos perto de você`}
                </div>
              </div>
              <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground">
                <Layers className="size-4" />
              </div>
            </Link>
          </div>

          <div className="mt-4 pointer-events-auto">
            <FilterChips chips={filters} active={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Botão localizar */}
        <button
          onClick={centerOnMe}
          disabled={locating}
          aria-label="Centralizar"
          className="absolute right-5 bottom-44 z-[1000] size-12 rounded-full bg-card shadow-elegant grid place-items-center border border-border/60 active:scale-95 transition disabled:opacity-60"
        >
          <LocateFixed className={`size-5 text-foreground ${locating ? "animate-pulse" : ""}`} />
        </button>

        {/* Card flutuante do pin selecionado */}
        {selectedPet && (
          <div className="absolute bottom-28 left-4 right-4 z-[1000] animate-float-up">
            <PetCard pet={selectedPet} variant="compact" />
          </div>
        )}

        {/* Espaçador para a altura do shell */}
        <div className="h-screen" />
      </div>
    </div>
  );
}