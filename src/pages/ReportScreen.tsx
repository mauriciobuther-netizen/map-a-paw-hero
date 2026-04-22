import { useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Camera, MapPin, Dog, Cat, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ReportScreen() {
  const [species, setSpecies] = useState<"dog" | "cat" | null>(null);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [desc, setDesc] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const behaviorOptions = ["Assustado", "Agressivo", "Dócil", "Ferido", "Faminto", "Perdido"];

  function toggleB(b: string) {
    setBehaviors((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!user) {
      toast.error("Inicia sessão para adicionar foto.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Ficheiro inválido", { description: "Escolhe uma imagem." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande", { description: "Máximo 8 MB." });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("pet-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;

      const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      setPhotoPath(path);
      toast.success("Foto adicionada");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tenta novamente.";
      toast.error("Falha no upload", { description: msg });
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (photoPath) {
      await supabase.storage.from("pet-photos").remove([photoPath]);
    }
    setPhotoUrl(null);
    setPhotoPath(null);
  }

  function publish() {
    if (!photoUrl) {
      toast.error("Adiciona uma foto do animal");
      return;
    }
    if (!species) {
      toast.error("Seleciona a espécie");
      return;
    }
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
          aria-hidden="true"
        />
        {photoUrl ? (
          <div className="relative w-full aspect-[5/3] rounded-3xl overflow-hidden shadow-soft border border-border">
            <img src={photoUrl} alt="Foto do animal" className="size-full object-cover" />
            <button
              onClick={removePhoto}
              aria-label="Remover foto"
              className="absolute top-3 right-3 size-9 rounded-full bg-background/90 backdrop-blur grid place-items-center shadow-soft active:scale-95"
            >
              <X className="size-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur text-xs font-semibold shadow-soft"
            >
              Trocar foto
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full aspect-[5/3] rounded-3xl bg-card border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition shadow-soft disabled:opacity-70"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="size-14 rounded-full gradient-primary grid place-items-center text-primary-foreground shadow-glow">
                {uploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Camera className="size-6" />
                )}
              </div>
              <span className="text-sm font-medium">
                {uploading ? "A enviar foto..." : "Adicionar foto do animal"}
              </span>
              <span className="text-xs opacity-70">
                {uploading ? "Aguarda um momento" : "Toca para tirar ou escolher"}
              </span>
            </div>
          </button>
        )}
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