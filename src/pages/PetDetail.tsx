import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockVets } from "@/data/mockData";
import {
  ArrowLeft, MapPin, Navigation, Heart, Share2, PawPrint, Stethoscope,
  HandHeart, CheckCircle2, Eye, EyeOff, Flag, AlertTriangle, ShieldAlert,
  Loader2,
} from "lucide-react";
import { RescueStatusBadge } from "@/components/RescueStatusBadge";
import { PetMap } from "@/components/PetMap";
import { speciesLabel, timeAgo } from "@/lib/petHelpers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  countValidations,
  createValidation,
  fetchReportById,
  fetchUserValidations,
  rowToPetCase,
  RISK_TAG_LABELS,
  type ReportRow,
  type ValidationAction,
} from "@/lib/reports";
import { ValidationBadge } from "@/components/ValidationBadge";
import { SafetyWarningDialog } from "@/components/SafetyWarningDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [row, setRow] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Set<ValidationAction>>(new Set());
  const [counts, setCounts] = useState<Record<ValidationAction, number> | null>(null);
  const [busy, setBusy] = useState<ValidationAction | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const r = await fetchReportById(id);
        if (!active) return;
        setRow(r);
        if (r) {
          const c = await countValidations(r.id);
          if (active) setCounts(c);
          if (user) {
            const votes = await fetchUserValidations(r.id, user.id);
            if (active) setUserVotes(votes);
          }
        }
      } catch (e) {
        toast.error("Falha ao carregar caso", {
          description: e instanceof Error ? e.message : undefined,
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Caso não encontrado.</p>
          <Link to="/app/map" className="text-primary mt-3 inline-block">Voltar ao mapa</Link>
        </div>
      </div>
    );
  }

  const pet = rowToPetCase(row);

  const infoChips = [
    { label: speciesLabel[pet.species] },
    { label: pet.color },
    { label: pet.size === "small" ? "Pequeno" : pet.size === "medium" ? "Médio" : "Grande" },
  ];

  async function handleValidation(action: ValidationAction, label: string) {
    if (!user || !profile || !row) {
      toast.error("Faça login para validar este caso.");
      return;
    }
    if (userVotes.has(action)) {
      toast.message("Você já registrou esta validação para este caso.");
      return;
    }
    setBusy(action);
    try {
      // Validation weight reflects the user's trust score at the moment of action.
      const weight = Math.max(1, Math.round((profile.trust_score ?? 25) / 25));
      await createValidation({
        reportId: row.id,
        userId: user.id,
        action,
        weight,
      });
      const newCounts = await countValidations(row.id);
      setCounts(newCounts);
      setUserVotes((prev) => new Set(prev).add(action));
      // re-fetch to pick up updated validation_status from trigger
      const fresh = await fetchReportById(row.id);
      if (fresh) setRow(fresh);
      toast.success(`Validação registada: ${label}`, {
        description: "Obrigado por ajudar a manter a comunidade segura.",
      });
    } catch (e) {
      toast.error("Falha ao registar validação", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  }

  const validationActions: { id: ValidationAction; label: string; icon: typeof Eye }[] = [
    { id: "confirm_seen", label: "Vi também", icon: Eye },
    { id: "deny_not_there", label: "Não está mais lá", icon: EyeOff },
    { id: "already_helped", label: "Já foi ajudado", icon: CheckCircle2 },
    { id: "possible_fake", label: "Possível caso falso", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mobile-shell pb-32">
        {/* Hero */}
        <div className="relative h-[55vh] overflow-hidden">
          <img src={pet.photos[0]} alt={pet.title} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />

          <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="size-11 rounded-full bg-background/90 backdrop-blur grid place-items-center shadow-soft"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const data = { title: pet.title, text: `Ajude este caso na Pata Amiga: ${pet.title}`, url: window.location.href };
                  try {
                    if (navigator.share) await navigator.share(data);
                    else {
                      await navigator.clipboard.writeText(data.url);
                      toast.success("Link copiado", { description: "Compartilhe com sua rede." });
                    }
                  } catch {/* cancelado */}
                }}
                aria-label="Compartilhar"
                className="size-11 rounded-full bg-background/90 backdrop-blur grid place-items-center shadow-soft active:scale-95 transition"
              >
                <Share2 className="size-5" />
              </button>
              <button
                onClick={() => {
                  setFavorited((v) => !v);
                  toast.success(favorited ? "Removido dos favoritos" : "Adicionado aos favoritos");
                }}
                aria-label="Favoritar"
                className="size-11 rounded-full bg-background/90 backdrop-blur grid place-items-center shadow-soft active:scale-95 transition"
              >
                <Heart className={`size-5 ${favorited ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 -mt-10 relative z-10 space-y-4">
          <div className="rounded-3xl bg-card p-5 shadow-elegant border border-border/60">
            <div className="flex flex-wrap gap-2">
              <RescueStatusBadge status={pet.status} size="md" />
              <ValidationBadge status={row.validation_status} />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-balance leading-tight">
              {pet.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>{pet.neighborhood}</span>
              <span>·</span>
              <span>{timeAgo(pet.reportedAt)}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {infoChips.map((c, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium">
                  {c.label}
                </span>
              ))}
            </div>

            {row.risk_tags.length > 0 && (
              <div className="mt-4 rounded-2xl bg-urgent/10 border border-urgent/20 p-3">
                <div className="flex items-center gap-2 text-urgent text-xs font-semibold mb-1">
                  <ShieldAlert className="size-4" /> Atenção a estes riscos no local
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {row.risk_tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-urgent/15 text-urgent text-[11px] font-medium">
                      {RISK_TAG_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-warning/10 border border-warning/20 p-3 flex gap-2 items-start text-xs text-warning-foreground">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Plataforma colaborativa: as informações são fornecidas por
              utilizadores e <strong>não são oficialmente verificadas</strong>.
              Avalie sempre a situação antes de agir e procure ajuda
              profissional quando necessário.
            </p>
          </div>

          <div className="rounded-3xl bg-card p-5 shadow-soft border border-border/60">
            <h2 className="font-display font-bold text-base mb-2">Sobre o caso</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{pet.description}</p>
          </div>

          {pet.behaviors.length > 0 && (
            <div className="rounded-3xl bg-card p-5 shadow-soft border border-border/60">
            <h2 className="font-display font-bold text-base mb-3">Comportamento observado</h2>
            <div className="flex flex-wrap gap-2">
              {pet.behaviors.map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold capitalize">
                  {b === "scared" && "Assustado"}
                  {b === "aggressive" && "Agressivo"}
                  {b === "docile" && "Dócil"}
                  {b === "injured" && "Ferido"}
                  {b === "hungry" && "Faminto"}
                  {b === "lost" && "Perdido"}
                </span>
              ))}
            </div>
            </div>
          )}

          <div className="rounded-3xl bg-card p-5 shadow-soft border border-border/60">
            <h2 className="font-display font-bold text-base mb-1">Esta informação está correta?</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Confirme apenas o que você realmente observou.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {validationActions.map(({ id: vId, label, icon: Icon }) => {
                const voted = userVotes.has(vId);
                const c = counts?.[vId] ?? 0;
                return (
                  <button
                    key={vId}
                    onClick={() => handleValidation(vId, label)}
                    disabled={voted || busy === vId}
                    className={`rounded-2xl border p-3 text-left text-xs transition active:scale-95 disabled:opacity-60 ${voted ? "bg-primary-soft border-primary text-primary" : "bg-card border-border hover:border-primary"}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="size-4" />
                      <span className="text-[10px] font-bold opacity-70">{c}</span>
                    </div>
                    <div className="mt-2 font-semibold leading-tight">{label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden bg-card shadow-soft border border-border/60">
            <div className="h-44">
              <PetMap pets={[pet]} vets={mockVets} className="size-full" showVets />
            </div>
            <button
              onClick={() => setSafetyOpen(true)}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{pet.address}</div>
                <div className="text-xs text-muted-foreground">Toque para abrir rota</div>
              </div>
              <Button
                asChild
                size="sm"
                className="rounded-full gap-1.5"
              >
                <span><Navigation className="size-4" /> Rota</span>
              </Button>
            </button>
          </div>

          <div className="rounded-3xl bg-card p-5 shadow-soft border border-border/60">
            <h2 className="font-display font-bold text-base mb-3">Reportado por</h2>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full gradient-primary grid place-items-center text-primary-foreground font-bold">
                {pet.reportedBy.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{pet.reportedBy.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pet.helpers} pessoas já ajudaram este caso
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-base mb-3 px-1">Como você pode ajudar?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: HandHeart, label: "Quero ajudar" },
                { icon: Share2, label: "Compartilhar caso" },
                { icon: Heart, label: "Adotei" },
                { icon: Stethoscope, label: "Levei ao vet" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === "Compartilhar caso" && navigator.share) {
                      navigator.share({ title: pet.title, url: window.location.href }).catch(() => {});
                      return;
                    }
                    toast.success(`Obrigado! "${label}" registrado.`, {
                      description: "Considere ajuda profissional sempre que necessário.",
                    });
                  }}
                  className="rounded-2xl bg-card border border-border p-4 text-left hover:border-primary hover:shadow-soft transition active:scale-95"
                >
                  <Icon className="size-5 text-primary mb-2" />
                  <div className="text-sm font-semibold leading-tight">{label}</div>
                </button>
              ))}
              <button
                onClick={() => toast.message("Em breve: enviar atualização do caso.")}
                className="rounded-2xl gradient-primary text-primary-foreground p-4 text-left shadow-glow active:scale-95"
              >
                <CheckCircle2 className="size-5 mb-2" />
                <div className="text-sm font-semibold leading-tight">Atualizar situação</div>
              </button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground text-center px-2">
              Se for seguro, considere ajudar. Em situações de risco, procure
              ajuda profissional ou autoridades competentes.
            </p>
          </div>
        </div>
      </div>
      <SafetyWarningDialog
        open={safetyOpen}
        riskTags={row.risk_tags.map((t) => RISK_TAG_LABELS[t] ?? t)}
        onOpenChange={setSafetyOpen}
        onConfirm={() => {
          setSafetyOpen(false);
          const url = `https://www.google.com/maps/dir/?api=1&destination=${pet.lat},${pet.lng}`;
          window.open(url, "_blank", "noopener");
        }}
      />
    </div>
  );
}