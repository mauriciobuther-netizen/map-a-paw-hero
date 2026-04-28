import { useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import {
  Camera, MapPin, Dog, Cat, X, Loader2, AlertTriangle, ShieldAlert, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  findPossibleDuplicates,
  getCurrentPosition,
  RISK_TAG_LABELS,
  type ReportRow,
  type SpeciesType,
  type UrgencyLevel,
} from "@/lib/reports";

const URGENCY_OPTIONS: { id: UrgencyLevel; label: string; tone: string }[] = [
  { id: "low", label: "Baixa", tone: "border-border" },
  { id: "medium", label: "Média", tone: "border-border" },
  { id: "high", label: "Alta", tone: "border-warning/50 bg-warning/5" },
  { id: "critical", label: "Crítica", tone: "border-urgent/50 bg-urgent/5 text-urgent" },
];

const RISK_TAGS = Object.keys(RISK_TAG_LABELS);

export default function ReportScreen() {
  const [species, setSpecies] = useState<SpeciesType | null>(null);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [desc, setDesc] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [urgency, setUrgency] = useState<UrgencyLevel>("medium");
  const [riskTags, setRiskTags] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc?: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [duplicates, setDuplicates] = useState<ReportRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const behaviorOptions = ["Assustado", "Agressivo", "Dócil", "Ferido", "Faminto", "Perdido"];

  function toggleB(b: string) {
    setBehaviors((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  function toggleRisk(t: string) {
    setRiskTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function captureLocation() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy });
      toast.success("Localização capturada", {
        description: `Precisão estimada: ${Math.round(pos.coords.accuracy)} m`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível obter a localização.";
      toast.error("Localização indisponível", {
        description: `${msg}. A criação exige GPS para evitar reports falsos.`,
      });
    } finally {
      setLocating(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!user) {
      toast.error("Faça login para adicionar foto.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido", { description: "Escolha uma imagem." });
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
      const msg = err instanceof Error ? err.message : "Tente novamente.";
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

  async function attemptPublish() {
    if (!user) {
      toast.error("Faça login para publicar.");
      return;
    }
    if (!photoUrl) {
      toast.error("Adicione uma foto do animal");
      return;
    }
    if (!species) {
      toast.error("Selecione a espécie");
      return;
    }
    if (!coords) {
      toast.error("Capture a localização", {
        description: "Por segurança, casos sem GPS não podem ser publicados.",
      });
      return;
    }
    if (desc.trim().length < 10) {
      toast.error("Descreva o animal", {
        description: "Mínimo de 10 caracteres para ajudar a comunidade.",
      });
      return;
    }

    // Duplicate detection: same species, < 200m, < 48h
    try {
      const dups = await findPossibleDuplicates({
        species,
        lat: coords.lat,
        lng: coords.lng,
      });
      if (dups.length > 0) {
        setDuplicates(dups);
        return;
      }
    } catch {
      // non-fatal; continue
    }
    await doPublish();
  }

  async function doPublish() {
    if (!user || !species || !coords || !photoUrl) return;
    setPublishing(true);
    try {
      const title =
        desc.trim().split(/\.|\n/)[0].slice(0, 80) ||
        `${species === "dog" ? "Cachorro" : "Gato"} avistado`;
      const { data, error } = await supabase
        .from("animal_reports")
        .insert({
          created_by: user.id,
          species,
          title,
          description: desc.trim(),
          urgency,
          risk_tags: riskTags,
          behavior_tags: behaviors,
          latitude: coords.lat,
          longitude: coords.lng,
          gps_accuracy: coords.acc ?? null,
          main_image_url: photoUrl,
          image_metadata: { source: "user_camera", captured_at: new Date().toISOString() },
          city: "Teresina",
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Caso publicado com sucesso!", {
        description: "A comunidade pode validar e ajudar.",
      });
      navigate(`/pet/${data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tente novamente.";
      toast.error("Falha ao publicar", { description: msg });
    } finally {
      setPublishing(false);
      setDuplicates(null);
    }
  }

  return (
    <MobileShell>
      <header>
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">
          Novo registro
        </p>
        <h1 className="font-display text-[28px] font-bold leading-tight text-balance mt-1">
          Viu um animal
          <br /> que precisa de ajuda?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Em poucos passos, a comunidade pode validar e agir com segurança.
        </p>
      </header>

      <div className="mt-4 rounded-2xl bg-warning/10 border border-warning/20 p-3 flex gap-2 items-start text-xs text-warning-foreground">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Reporte apenas o que <strong>você viu pessoalmente</strong>. Fotos
          devem ser do momento atual. Casos falsos prejudicam quem realmente
          precisa de ajuda.
        </p>
      </div>

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
                {uploading ? "Enviando foto..." : "Adicionar foto do animal"}
              </span>
              <span className="text-xs opacity-70">
                {uploading ? "Aguarde um momento" : "Toque para tirar ou escolher"}
              </span>
            </div>
          </button>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-3">Espécie</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "dog" as const, label: "Cachorro", Icon: Dog },
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
        <h2 className="font-semibold text-sm mb-3">Nível de urgência</h2>
        <div className="grid grid-cols-4 gap-2">
          {URGENCY_OPTIONS.map((u) => (
            <button
              key={u.id}
              onClick={() => setUrgency(u.id)}
              className={cn(
                "rounded-xl border-2 py-2 text-xs font-semibold transition",
                u.tone,
                urgency === u.id ? "border-primary bg-primary-soft text-primary" : "",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
          <ShieldAlert className="size-4 text-urgent" /> Sinalizar riscos no local
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Avise quem for ajudar sobre condições de perigo.
        </p>
        <div className="flex flex-wrap gap-2">
          {RISK_TAGS.map((t) => {
            const active = riskTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleRisk(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                  active
                    ? "bg-urgent/15 text-urgent border-urgent/40"
                    : "bg-card text-foreground border-border",
                )}
              >
                {RISK_TAG_LABELS[t]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <button
          onClick={captureLocation}
          disabled={locating}
          className="w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 shadow-soft disabled:opacity-70"
        >
          <div
            className={cn(
              "size-10 rounded-xl grid place-items-center",
              coords ? "bg-success/15 text-success" : "bg-primary-soft text-primary",
            )}
          >
            {locating ? (
              <Loader2 className="size-5 animate-spin" />
            ) : coords ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <MapPin className="size-5" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">
              {coords ? "Localização capturada" : "Capturar localização (obrigatório)"}
            </div>
            <div className="text-xs text-muted-foreground">
              {coords
                ? `±${Math.round(coords.acc ?? 0)} m · ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                : "Toque para usar GPS · sem GPS o caso não pode ser publicado"}
            </div>
          </div>
        </button>
      </section>

      <Button
        onClick={attemptPublish}
        disabled={publishing}
        className="w-full h-14 mt-8 rounded-full text-base font-semibold gradient-primary text-primary-foreground shadow-glow"
      >
        {publishing ? "A publicar..." : "Publicar caso"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground mt-3 mb-2 px-4">
        Ao publicar, declaro que vi este animal pessoalmente e aceito a
        responsabilidade pela informação prestada. Esta é uma plataforma
        colaborativa, não um serviço oficial de resgate.
      </p>

      {duplicates && duplicates.length > 0 && (
        <div className="fixed inset-0 z-[2000] grid place-items-center bg-background/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-elegant p-5">
            <div className="size-11 rounded-full bg-warning/15 text-warning-foreground grid place-items-center">
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="font-display font-bold text-lg mt-3">
              Este caso pode já existir
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Encontramos {duplicates.length} caso{duplicates.length > 1 ? "s" : ""}
              {" "}similares perto da sua localização nas últimas 48h.
              Ajude a comunidade evitando duplicados.
            </p>
            <div className="mt-4 max-h-56 overflow-y-auto space-y-2">
              {duplicates.map((d) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/pet/${d.id}`)}
                  className="w-full text-left rounded-xl border border-border p-3 hover:border-primary transition flex gap-3"
                >
                  <img src={d.main_image_url} alt="" className="size-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{d.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {d.location_text || d.city || "Local próximo"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setDuplicates(null)}>
                Voltar
              </Button>
              <Button onClick={doPublish} disabled={publishing}>
                {publishing ? "A publicar..." : "Publicar mesmo assim"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}