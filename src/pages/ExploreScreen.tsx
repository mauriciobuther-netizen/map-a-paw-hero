import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { FilterChips } from "@/components/FilterChips";
import { PetCard } from "@/components/PetCard";
import { mockPets } from "@/data/mockData";
import { Bell, Search } from "lucide-react";

const cats = [
  { id: "all", label: "Todos" },
  { id: "dog", label: "Cães", icon: "🐶" },
  { id: "cat", label: "Gatos", icon: "🐱" },
  { id: "urgent", label: "Urgente", icon: "🚨" },
  { id: "injured", label: "Feridos" },
  { id: "fed", label: "Já alimentados" },
];

export default function ExploreScreen() {
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => {
    if (filter === "all") return mockPets;
    if (filter === "urgent")
      return mockPets.filter((p) => p.status === "urgent" || p.status === "injured");
    if (filter === "dog") return mockPets.filter((p) => p.species === "dog");
    if (filter === "cat") return mockPets.filter((p) => p.species === "cat");
    if (filter === "injured") return mockPets.filter((p) => p.status === "injured");
    if (filter === "fed") return mockPets.filter((p) => p.status === "fed");
    return mockPets;
  }, [filter]);

  return (
    <MobileShell>
      <header className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Olá, voluntário
          </p>
          <h1 className="font-display text-[28px] font-bold leading-tight text-balance">
            Quem precisa
            <br /> de ti hoje?
          </h1>
        </div>
        <button className="size-11 rounded-full bg-card border border-border grid place-items-center shadow-soft relative">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-urgent" />
        </button>
      </header>

      <div className="mt-5 flex items-center gap-3 rounded-full bg-card border border-border px-4 py-3 shadow-soft">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="Buscar por bairro, rua ou descrição"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-5">
        <FilterChips chips={cats} active={filter} onChange={setFilter} />
      </div>

      <section className="mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Perto de ti</h2>
          <span className="text-xs text-muted-foreground">{list.length} casos</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <PetCard key={p.id} pet={p} />
          ))}
        </div>
      </section>
    </MobileShell>
  );
}