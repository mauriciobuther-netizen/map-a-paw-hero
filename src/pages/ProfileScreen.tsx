import { MobileShell } from "@/components/MobileShell";
import { mockUser, ranking } from "@/data/mockData";
import { Settings, Trophy, Heart, MapPin, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileScreen() {
  const u = mockUser;
  return (
    <MobileShell>
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Perfil</h1>
        <button className="size-10 rounded-full bg-card border border-border grid place-items-center">
          <Settings className="size-5" />
        </button>
      </header>

      <section className="mt-5 rounded-3xl gradient-primary text-primary-foreground p-6 shadow-glow relative overflow-hidden">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
        <div className="absolute -right-12 -bottom-12 size-32 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="size-16 rounded-full bg-white/95 text-primary grid place-items-center font-display font-bold text-2xl shadow-soft">
            V
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg leading-tight">{u.name}</h2>
            <div className="flex items-center gap-1 text-xs opacity-90 mt-0.5">
              <MapPin className="size-3" /> {u.city}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              <Trophy className="size-3.5" /> Nível {u.level} · {u.points} pts
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { v: u.helped, l: "Ajudou" },
            { v: u.reported, l: "Reportou" },
            { v: u.resolved, l: "Resolvidos" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/15 backdrop-blur p-3">
              <div className="font-display font-bold text-xl">{s.v}</div>
              <div className="text-[10px] opacity-90">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Conquistas</h2>
          <span className="text-xs text-muted-foreground">
            {u.badges.filter((b) => b.earned).length} / {u.badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {u.badges.map((b) => (
            <div
              key={b.id}
              className={cn(
                "rounded-2xl p-3 text-center border transition",
                b.earned
                  ? "bg-card border-border shadow-soft"
                  : "bg-secondary/40 border-border/40 opacity-60",
              )}
            >
              <div className={cn("size-12 mx-auto rounded-full grid place-items-center text-2xl", b.earned ? "bg-primary-soft" : "bg-muted")}>
                {b.icon}
              </div>
              <div className="mt-2 text-[11px] font-semibold leading-tight">{b.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-center gap-2 mb-3">
          <Award className="size-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Comunidade · Teresina</h2>
        </div>
        <div className="rounded-3xl bg-card border border-border shadow-soft divide-y divide-border">
          {ranking.map((r, i) => {
            const me = r.id === "u1";
            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-center gap-3 p-4",
                  me && "bg-primary-soft",
                )}
              >
                <div className={cn(
                  "size-8 rounded-full grid place-items-center text-xs font-bold",
                  i === 0 ? "bg-warning text-warning-foreground" :
                  i === 1 ? "bg-muted text-foreground" :
                  i === 2 ? "bg-primary-soft text-primary" :
                  "bg-secondary text-muted-foreground",
                )}>
                  {i + 1}
                </div>
                <div className="size-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-bold text-sm">
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold leading-tight">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Heart className="size-3 fill-primary text-primary" /> {r.helped} ajudados
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">{r.points}</div>
              </div>
            );
          })}
        </div>
      </section>
    </MobileShell>
  );
}