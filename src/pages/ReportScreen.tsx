import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Camera, MapPin, Dog, Cat, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ReportScreen() {
  const [species, setSpecies] = useState<"dog" | "cat" | null>(null);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();

  const behaviorOptions = ["Assustado", "Agressivo", "Dócil", "Ferido", "Faminto", "Perdido"];

  function toggleB(b: string) {
    setBehaviors((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  function publish() {
    toast.success("Caso publicado com sucesso!", {
      description: "A comunidade já pode ajudar este animal.",
    });
    navigate("/app/map");
  }

  return (
    <MobileShell>
      <header>
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">
          Novo registo
        </p>
        <h1 className="font-display text-[28px] font-bold leading-tight text-balance mt-1">
          Viste um animal
          <br /> que precisa de ajuda?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Em poucos passos, a comunidade pode agir.
        </p>
      </header>

      <section className="mt-6">
        <button className="w-full aspect-[5/3] rounded-3xl bg-card border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition shadow-soft">
          <div className="flex flex-col items-center gap-2">
            <div className="size-14 rounded-full gradient-primary grid place-items-center text-primary-foreground shadow-glow">
              <Camera className="size-6" />
            </div>
            <span className="text-sm font-medium">Adicionar foto do animal</span>
            <span className="text-xs opacity-70">Toca para tirar ou escolher</span>
          </div>
        </button>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-3">Espécie</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "dog" as const, label: "Cão", Icon: Dog },
            { id: "cat" as const, label: "Gato", Icon: Cat },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSpecies(id)}
              className={cn(
                "rounded-2xl p-5 border-2 transition flex flex-col items-center gap-2",
                species === id
                  ? "border-primary bg-primary-soft text-primary shadow-soft"
                  : "border-border bg-card text-foreground",
              )}
            >
              <Icon className="size-7" />
              <span className="font-semibold text-sm">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-3">Comportamento</h2>
        <div className="flex flex-wrap gap-2">
          {behaviorOptions.map((b) => {
            const active = behaviors.includes(b);
            return (
              <button
                key={b}
                onClick={() => toggleB(b)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border",
                )}
              >
                {b}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-3">Descrição</h2>
        <textarea
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Cor, porte, estado, observações importantes..."
          className="w-full rounded-2xl bg-card border border-border p-4 text-sm outline-none focus:border-primary resize-none shadow-soft"
        />
      </section>

      <section className="mt-6">
        <button className="w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 shadow-soft">
          <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <MapPin className="size-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">Localização atual</div>
            <div className="text-xs text-muted-foreground">Centro, Teresina · ajustar no mapa</div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      </section>

      <Button
        onClick={publish}
        className="w-full h-14 mt-8 rounded-full text-base font-semibold gradient-primary text-primary-foreground shadow-glow"
      >
        Publicar caso
      </Button>
      <p className="text-center text-[11px] text-muted-foreground mt-3 mb-2">
        Cada ponto no mapa pode mudar uma vida.
      </p>
    </MobileShell>
  );
}