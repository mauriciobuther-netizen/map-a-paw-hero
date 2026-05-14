import { useEffect, useMemo, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PetMap } from "@/components/PetMap";
import { FilterChips } from "@/components/FilterChips";
import { mockVets } from "@/data/mockData";
import { PetCard } from "@/components/PetCard";
import { Search, LocateFixed, Layers, Dog, Cat, X, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchActiveReports, rowToPetCase, getCurrentPosition, type ReportRow } from "@/lib/reports";
import { toast } from "sonner";
import type { PetCase } from "@/types/pet";
import { Hint } from "@/components/Hint";

const filters = [
  { id: "all", label: "Todos" },
  { id: "urgent", label: "Urgente", icon: "🚨" },
  { id: "dog", label: "Cachorros", Icon: Dog },
  { id: "cat", label: "Gatos", Icon: Cat },
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
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const searchResults = useMemo(() => {
    const q = normalize(query);
    if (!q) return [] as PetCase[];
    const terms = q.split(" ").filter(Boolean);
    return allPets
      .filter((p) => {
        const haystack = normalize(
          [p.title, p.description, p.neighborhood, p.address, p.color].join(" "),
        );
        return terms.every((t) => haystack.includes(t));
      })
      .slice(0, 8);
  }, [query, allPets]);

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
          <div ref={searchRef} className="pointer-events-auto">
            <div className="flex items-center gap-3 rounded-full bg-card/95 backdrop-blur-xl pl-5 pr-2 py-2 shadow-elegant border border-border/60">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={
                  loading
                    ? "A carregar casos..."
                    : `Buscar endereço ou nome — ${pets.length} casos`
                }
                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground placeholder:font-normal"
                aria-label="Buscar endereço ou nome do animal"
              />
              {query ? (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Limpar busca"
                  className="size-9 rounded-full bg-muted grid place-items-center text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <Link
                  to="/app/explore"
                  aria-label="Abrir lista de casos"
                  className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground"
                >
                  <Layers className="size-4" />
                </Link>
              )}
            </div>

            {searchOpen && query && (
              <div className="mt-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-elegant overflow-hidden max-h-[60vh] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Nenhum caso encontrado para "{query}"
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => {
                            setSelected(p.id);
                            setSearchOpen(false);
                            setQuery("");
                            if (p.location) {
                              setUserPos({ lat: p.location.lat, lng: p.location.lng });
                            }
                          }}
                          onDoubleClick={() => navigate(`/pet/${p.id}`)}
                          className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/40 active:bg-muted transition"
                        >
                          {p.photoUrl ? (
                            <img
                              src={p.photoUrl}
                              alt=""
                              className="size-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="size-10 rounded-lg bg-primary-soft grid place-items-center shrink-0">
                              {p.species === "cat" ? "🐱" : "🐶"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold leading-tight truncate">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="size-3 shrink-0" />
                              {p.neighborhood || p.address || "Sem endereço"}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pointer-events-auto">
            <FilterChips chips={filters} active={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Botão localizar */}
        <Hint
          label="Centralizar no meu local"
          description="Usa o GPS para mover o mapa para sua posição"
          side="left"
        >
          <button
            onClick={centerOnMe}
            disabled={locating}
            aria-label="Centralizar"
            className="absolute right-5 bottom-44 z-[1000] size-12 rounded-full bg-card shadow-elegant grid place-items-center border border-border/60 active:scale-95 transition disabled:opacity-60"
          >
            <LocateFixed className={`size-5 text-foreground ${locating ? "animate-pulse" : ""}`} />
          </button>
        </Hint>

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