import { Link, useNavigate, useParams } from "react-router-dom";
import { mockPets, mockVets } from "@/data/mockData";
import { ArrowLeft, MapPin, Navigation, Heart, Share2, PawPrint, Stethoscope, HandHeart, CheckCircle2 } from "lucide-react";
import { RescueStatusBadge } from "@/components/RescueStatusBadge";
import { PetMap } from "@/components/PetMap";
import { speciesLabel, timeAgo } from "@/lib/petHelpers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = mockPets.find((p) => p.id === id);

  if (!pet) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Caso não encontrado.</p>
          <Link to="/app/map" className="text-primary mt-3 inline-block">Voltar ao mapa</Link>
        </div>
      </div>
    );
  }

  const infoChips = [
    { label: speciesLabel[pet.species] },
    { label: pet.color },
    { label: pet.size === "small" ? "Pequeno" : pet.size === "medium" ? "Médio" : "Grande" },
    { label: pet.sex === "male" ? "Macho" : pet.sex === "female" ? "Fêmea" : "Sexo desconhecido" },
    ...(pet.ageEstimate ? [{ label: pet.ageEstimate }] : []),
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
              <button className="size-11 rounded-full bg-background/90 backdrop-blur grid place-items-center shadow-soft">
                <Share2 className="size-5" />
              </button>
              <button className="size-11 rounded-full bg-background/90 backdrop-blur grid place-items-center shadow-soft">
                <Heart className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 -mt-10 relative z-10 space-y-4">
          <div className="rounded-3xl bg-card p-5 shadow-elegant border border-border/60">
            <RescueStatusBadge status={pet.status} size="md" />
            <h1 className="mt-3 font-display text-2xl font-bold text-balance leading-tight">
              {pet.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
            <span>{pet.neighborhood} · {pet.distanceKm} km de você</span>
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
          </div>

          <div className="rounded-3xl bg-card p-5 shadow-soft border border-border/60">
            <h2 className="font-display font-bold text-base mb-2">Sobre o caso</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{pet.description}</p>
          </div>

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

          <div className="rounded-3xl overflow-hidden bg-card shadow-soft border border-border/60">
            <div className="h-44">
              <PetMap pets={[pet]} vets={mockVets} className="size-full" showVets />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{pet.address}</div>
                <div className="text-xs text-muted-foreground">Toque para abrir rota</div>
              </div>
              <Button size="sm" className="rounded-full gap-1.5">
                <Navigation className="size-4" /> Rota
              </Button>
            </div>
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
                { icon: PawPrint, label: "Já fui ao local" },
                { icon: CheckCircle2, label: "Resgatei" },
                { icon: Heart, label: "Adotei" },
                { icon: Stethoscope, label: "Levei ao vet" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => toast.success(`Obrigado! "${label}" registrado.`, { description: "A comunidade agradece." })}
                  className="rounded-2xl bg-card border border-border p-4 text-left hover:border-primary hover:shadow-soft transition active:scale-95"
                >
                  <Icon className="size-5 text-primary mb-2" />
                  <div className="text-sm font-semibold leading-tight">{label}</div>
                </button>
              ))}
              <button
                onClick={() => toast("Atualização registrada.")}
                className="rounded-2xl gradient-primary text-primary-foreground p-4 text-left shadow-glow active:scale-95"
              >
                <CheckCircle2 className="size-5 mb-2" />
                <div className="text-sm font-semibold leading-tight">Atualizar situação</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}