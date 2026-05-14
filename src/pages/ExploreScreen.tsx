import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { FilterChips } from "@/components/FilterChips";
import { PetCard } from "@/components/PetCard";
import { fetchActiveReports, rowToPetCase, type ReportRow } from "@/lib/reports";
import type { PetCase } from "@/types/pet";
import { Bell, Search, X, Dog, Cat, Users, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Hint } from "@/components/Hint";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const cats = [
  { id: "all", label: "Todos" },
  { id: "dog", label: "Cachorros", Icon: Dog },
  { id: "cat", label: "Gatos", Icon: Cat },
  { id: "community", label: "Comunitários", Icon: Users },
  { id: "urgent", label: "Urgente", icon: "🚨" },
  { id: "injured", label: "Feridos" },
  { id: "fed", label: "Já alimentados" },
];

export default function ExploreScreen() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    const v = localStorage.getItem("notif_last_seen");
    return v ? Number(v) : 0;
  });
  const navigate = useNavigate();

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

  const notifications = useMemo(() => {
    return [...rows]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 20);
  }, [rows]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (n) => new Date(n.created_at).getTime() > lastSeen,
      ).length,
    [notifications, lastSeen],
  );

  const openNotifications = () => {
    setNotifOpen(true);
    const now = Date.now();
    localStorage.setItem("notif_last_seen", String(now));
    setLastSeen(now);
  };

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
    else if (filter === "community")
      base = base.filter((p) => p.communityStatus === "community" || p.communityStatus === "neighborhood_star");
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
          <div className="flex items-center gap-2 mb-1">
            <img src={logo} alt="Pata Amiga" className="w-8 h-8" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Olá, voluntário
            </p>
          </div>
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
            onClick={openNotifications}
            aria-label="Notificações"
            className="size-11 rounded-full bg-card border border-border grid place-items-center shadow-soft relative active:scale-95 transition"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-urgent text-urgent-foreground text-[10px] font-bold grid place-items-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
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

      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto p-0 border-border"
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted" />
          <SheetHeader className="px-5 pt-4 pb-2 text-left">
            <SheetTitle className="font-display text-xl flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Notificações
            </SheetTitle>
            <SheetDescription>
              Casos recentes reportados na comunidade.
            </SheetDescription>
          </SheetHeader>
          <div className="px-5 pb-8">
            {notifications.length === 0 ? (
              <div className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Sem notificações por enquanto.
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
                {notifications.map((n) => {
                  const pet = rowToPetCase(n);
                  const isUrgent = pet.status === "urgent" || pet.status === "injured";
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          navigate(`/pet/${n.id}`);
                        }}
                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/40 active:bg-muted transition"
                      >
                        <div
                          className={`size-10 rounded-full grid place-items-center shrink-0 ${
                            isUrgent
                              ? "bg-urgent/15 text-urgent"
                              : "bg-primary-soft text-primary"
                          }`}
                        >
                          {isUrgent ? (
                            <AlertTriangle className="size-5" />
                          ) : (
                            <Bell className="size-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold leading-tight truncate">
                            {pet.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="size-3 shrink-0" />
                            {pet.neighborhood || pet.address || "Localização não informada"}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {new Date(n.created_at).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}