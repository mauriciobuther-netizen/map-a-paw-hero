import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { PawPrint, Heart, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Auth() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/app/explore" replace />;
  }

  const handleGoogle = async () => {
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Não foi possível entrar",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Fundo de mapa estilizado */}
      <div className="absolute inset-0 auth-map-bg" aria-hidden="true" />

      {/* "Ruas" do mapa */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="auth-road" style={{ top: "22%", left: "-10%", width: "120%", height: "10px", transform: "rotate(-8deg)" }} />
        <div className="auth-road" style={{ top: "58%", left: "-10%", width: "120%", height: "8px", transform: "rotate(6deg)" }} />
        <div className="auth-road" style={{ top: "-10%", left: "30%", width: "8px", height: "70%", transform: "rotate(12deg)" }} />
        <div className="auth-road" style={{ top: "10%", left: "70%", width: "6px", height: "60%", transform: "rotate(-14deg)" }} />
      </div>

      {/* Patinhas animadas espalhadas pelo mapa */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <FloatingPaw style={{ top: "8%", left: "12%" }} dx={14} dy={-12} dur={6} delay={0} rot={-12} color="primary" />
        <FloatingPaw style={{ top: "14%", left: "62%" }} dx={-16} dy={10} dur={7.5} delay={0.6} rot={18} color="primary" pulse />
        <FloatingPaw style={{ top: "30%", left: "82%" }} dx={-12} dy={-14} dur={5.8} delay={1.2} rot={-6} color="urgent" pulse />
        <FloatingPaw style={{ top: "44%", left: "20%" }} dx={18} dy={8} dur={8} delay={0.3} rot={10} color="primary" />
        <FloatingPaw style={{ top: "52%", left: "55%" }} dx={-10} dy={-12} dur={6.6} delay={1.5} rot={-20} color="success" pulse />
        <FloatingPaw style={{ top: "66%", left: "8%" }} dx={12} dy={10} dur={7} delay={0.9} rot={6} color="primary" />
        <FloatingPaw style={{ top: "70%", left: "74%" }} dx={-14} dy={-8} dur={5.5} delay={0.2} rot={-10} color="primary" />
        <FloatingPaw style={{ top: "82%", left: "38%" }} dx={10} dy={-10} dur={7.2} delay={1.8} rot={14} color="urgent" pulse />
      </div>

      {/* Camada de leitura — gradiente para contraste do conteúdo */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />

      {/* Hero */}
      <section className="relative flex-1 flex flex-col justify-end px-7 pt-14 pb-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl" />
            <img
              src={logo}
              alt="Pata Amiga"
              className="relative w-28 h-28 drop-shadow-2xl animate-float-up"
            />
          </div>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border text-[11px] font-semibold text-foreground/80 shadow-sm">
            <MapPin className="size-3.5 text-primary" /> Teresina · Piauí
          </div>

          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.05] text-foreground text-balance">
            Cada patinha no mapa
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              é uma vida à espera.
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Junte-se à comunidade que resgata, alimenta e adota cães e gatos da nossa cidade.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <Stat icon={<Heart className="size-3.5" />} label="1.2k ajudados" />
            <Stat icon={<PawPrint className="size-3.5" />} label="230 voluntários" />
          </div>
        </div>
      </section>

      {/* Cartão de login */}
      <section
        className="relative rounded-t-[32px] p-6 pb-10 shadow-elegant border-t border-border backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(to top, hsl(27 89% 60% / 0.7) 0%, hsl(27 89% 60% / 0.15) 18%, hsl(var(--card) / 0.95) 35%)",
        }}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-muted mb-5" />
        <h2 className="font-display font-bold text-xl text-center">Entrar na conta</h2>
        <p className="text-center text-sm text-muted-foreground mt-1">
          Continue com sua conta Google em segundos.
        </p>

        <button
          onClick={handleGoogle}
          disabled={submitting || loading}
          className="mt-6 w-full flex items-center justify-center gap-3 rounded-2xl bg-foreground text-background font-semibold py-3.5 text-sm active:scale-[0.99] hover:opacity-95 transition disabled:opacity-60 shadow-md"
        >
          {submitting ? (
            <span className="size-5 rounded-full border-2 border-background border-t-transparent animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {submitting ? "A entrar..." : "Continuar com Google"}
        </button>

        <div className="mt-5 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span className="uppercase tracking-wider">100% seguro</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <p className="mt-4 text-[11px] text-center text-muted-foreground leading-relaxed">
          Ao continuar você concorda com os <span className="underline">Termos</span> e a{" "}
          <span className="underline">Política de Privacidade</span>.
        </p>
      </section>
    </main>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur border border-border text-[11px] font-medium text-foreground/80 shadow-sm">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

type PawColor = "primary" | "urgent" | "success";
function FloatingPaw({
  style,
  dx,
  dy,
  dur,
  delay,
  rot,
  color,
  pulse,
}: {
  style: React.CSSProperties;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
  rot: number;
  color: PawColor;
  pulse?: boolean;
}) {
  const colorMap: Record<PawColor, string> = {
    primary: "bg-primary text-primary-foreground",
    urgent: "bg-[hsl(var(--urgent))] text-[hsl(var(--urgent-foreground))]",
    success: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  };
  return (
    <div
      className="absolute paw-marker"
      style={
        {
          ...style,
          ["--dx" as any]: `${dx}px`,
          ["--dy" as any]: `${dy}px`,
          ["--dur" as any]: `${dur}s`,
          ["--delay" as any]: `${delay}s`,
          ["--r" as any]: `${rot}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className={`relative size-9 rounded-full ${colorMap[color]} flex items-center justify-center shadow-lg ring-2 ring-card ${pulse ? "paw-pulse" : ""}`}
      >
        <PawPrint className="size-4" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-inherit" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1S8.69 6 12 6c1.88 0 3.14.8 3.86 1.49l2.64-2.55C16.86 3.4 14.65 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.54 0 9.2-3.9 9.2-9.38 0-.63-.07-1.11-.16-1.62H12z"
      />
      <path fill="#34A853" d="M3.6 7.5l3.16 2.32C7.6 8 9.62 6 12 6c1.88 0 3.14.8 3.86 1.49l2.64-2.55C16.86 3.4 14.65 2.4 12 2.4 8.34 2.4 5.18 4.49 3.6 7.5z" opacity="0"/>
    </svg>
  );
}