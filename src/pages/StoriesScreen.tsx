import { MobileShell } from "@/components/MobileShell";
import { mockHappyEndings } from "@/data/mockData";
import { Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Hint } from "@/components/Hint";

export default function StoriesScreen() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const toggleLike = (id: string) => {
    setLiked((p) => {
      const next = { ...p, [id]: !p[id] };
      toast.success(next[id] ? "Você curtiu esta história ❤️" : "Curtida removida");
      return next;
    });
  };
  return (
    <MobileShell>
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
          <Sparkles className="size-3.5" /> Mais um animal feliz
        </div>
        <h1 className="font-display text-[28px] font-bold leading-tight text-balance mt-3">
          Histórias que
          <br /> aquecem o coração.
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Cada uma destas vidas mudou graças à comunidade.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          { v: "248", l: "Animais felizes" },
          { v: "1.2k", l: "Voluntários" },
          { v: "92%", l: "Casos resolvidos" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-card border border-border p-3 shadow-soft">
            <div className="font-display font-bold text-xl text-primary">{s.v}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.l}</div>
          </div>
        ))}
      </div>

      <section className="mt-7 space-y-5">
        {mockHappyEndings.map((h) => (
          <article key={h.id} className="rounded-3xl bg-card overflow-hidden shadow-soft border border-border/60 animate-float-up">
            <div className="grid grid-cols-2">
              <div className="relative aspect-square">
                <img src={h.beforePhoto} alt="Antes" className="size-full object-cover grayscale-[20%]" loading="lazy" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">Antes</span>
              </div>
              <div className="relative aspect-square">
                <img src={h.afterPhoto} alt="Depois" className="size-full object-cover" loading="lazy" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-semibold">Depois</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-sm font-bold">
                  {h.rescuerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{h.rescuerName}</div>
                  <div className="text-[11px] text-muted-foreground">{h.action} · {h.petName}</div>
                </div>
                <Hint
                  label="Curtir história"
                  description="Mostre apoio a este resgate"
                  side="left"
                >
                  <button
                    onClick={() => toggleLike(h.id)}
                    aria-label="Curtir história"
                    className="size-9 rounded-full bg-primary-soft text-primary grid place-items-center active:scale-95 transition"
                  >
                    <Heart className={`size-4 ${liked[h.id] ? "fill-primary" : ""}`} />
                  </button>
                </Hint>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                "{h.story}"
              </p>
            </div>
          </article>
        ))}
      </section>
    </MobileShell>
  );
}