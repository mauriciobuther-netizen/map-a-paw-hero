import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { FilterChips } from "@/components/FilterChips";
import { PetCard } from "@/components/PetCard";
import { fetchActiveReports, rowToPetCase, type ReportRow } from "@/lib/reports";
import type { PetCase } from "@/types/pet";
import { Bell, Search, X, Dog, Cat } from "lucide-react";
import { toast } from "sonner";
import { Hint } from "@/components/Hint";

const cats = [
  { id: "all", label: "Todos" },
  { id: "dog", label: "Cachorros", Icon: Dog },
  { id: "cat", label: "Gatos", Icon: Cat },
  { id: "urgent", label: "Urgente", icon: "🚨" },
  { id: "injured", label: "Feridos" },
  { id: "fed", label: "Já alimentados" },
];

export default function ExploreScreen() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const pets: PetCase[] = useMemo(() => rows.map(rowToPetCase), [rows]);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const list = useMemo(() => {
    let base = pets;
    if (filter === "urgent")
      base = base.filter((p) => p.status === "urgent" || p.status === "injured");
    else if (filter === "dog") base = base.filter((p) => p.species === "dog");
    else if (filter === "cat") base = base.filter((p) => p.species === "cat");
    else if (filter === "injured") base = base.filter((p) => p.status === "injured");
    else if (filter === "fed") base = base.filter((p) => p.status === "fed");

    const q = normalize(query);
    if (!q) return base;
    const terms = q.split(" ").filter(Boolean);
    return base.filter((p) => {
      const haystack = normalize(
        [p.title, p.description, p.neighborhood, p.address, p.color].join(" "),
      );
      return terms.every((t) => haystack.includes(t));
    });
  }, [filter, query, pets]);

  return (
    <MobileShell>
      <header className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Olá, voluntário
          </p>
          <h1 className="font-display text-[28px] font-bold leading-tight text-balance">
            Quem precisa
            <br /> de você hoje?
          </h1>
        </div>
        <Hint
          label="Notificações"
          description="Alertas de casos urgentes perto de você"
          side="left"
        >
          <button
            onClick={() =>
              toast.message("Notificações", {
                description: "Em breve você verá aqui alertas de casos urgentes perto de si.",
              })
            }
            aria-label="Notificações"
            className="size-11 rounded-full bg-card border border-border grid place-items-center shadow-soft relative active:scale-95 transition"
          >
            <Bell className="size-5" />
            <span className="absolute top-2 right-2.5 size-2 rounded-full bg-urgent" />
          </button>
        </Hint>
      </header>

      <div className="mt-5 flex items-center gap-3 rounded-full bg-card border border-border px-4 py-3 shadow-soft focus-within:border-primary transition-colors">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por bairro, rua ou descrição"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Buscar casos"
        />
        {query && (
          <Hint label="Limpar busca" side="left">
            <button
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="size-6 rounded-full bg-muted grid place-items-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </Hint>
        )}
      </div>

      <div className="mt-5">
        <FilterChips chips={cats} active={filter} onChange={setFilter} />
      </div>

      <section className="mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-lg">
            {query ? `Resultados para "${query}"` : "Perto de você"}
          </h2>
          <span className="text-xs text-muted-foreground">{list.length} casos</span>
        </div>
        {list.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-8 text-center shadow-soft">
            <div className="text-3xl mb-2">{loading ? "⏳" : "🔍"}</div>
            <p className="text-sm font-semibold">
              {loading ? "A carregar casos..." : "Nenhum caso encontrado"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? "Aguarde um momento." : "Tente outro bairro ou seja a primeira pessoa a reportar um caso."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
          </div>
        )}
      </section>
    </MobileShell>
  );
}