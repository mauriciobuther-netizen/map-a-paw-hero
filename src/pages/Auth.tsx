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
    <main className="min-h-screen bg-background flex flex-col">
      <section className="relative flex-1 flex flex-col justify-end overflow-hidden gradient-primary text-primary-foreground p-8 pb-12">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
        <div className="absolute -left-12 top-24 size-40 rounded-full bg-white/10" />
        <div className="absolute right-10 bottom-40 size-24 rounded-full bg-white/10" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold mb-6">
            <PawPrint className="size-3.5" /> Teresina · Piauí
          </div>
          <img
            src={logo}
            alt="Pata Amiga"
            className="w-28 h-28 mb-4 drop-shadow-xl"
          />
          <h1 className="font-display text-[36px] font-bold leading-[1.05] text-balance">
            Cada resgate começa
            <br /> com um clique.
          </h1>
          <p className="mt-3 text-sm opacity-90 max-w-xs">
            Junta-te à comunidade que ajuda cães e gatos abandonados na tua cidade.
          </p>

          <div className="mt-8 flex gap-3 text-[11px] opacity-90">
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" /> 1.2k ajudados
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> 230 voluntários
            </span>
          </div>
        </div>
      </section>

      <section className="bg-card -mt-6 rounded-t-[32px] p-6 pb-10 shadow-soft">
        <h2 className="font-display font-bold text-xl text-center">Entrar na conta</h2>
        <p className="text-center text-sm text-muted-foreground mt-1">
          Continua com a tua conta Google em segundos.
        </p>

        <button
          onClick={handleGoogle}
          disabled={submitting || loading}
          className="mt-6 w-full flex items-center justify-center gap-3 rounded-2xl bg-foreground text-background font-semibold py-3.5 text-sm active:scale-[0.99] transition disabled:opacity-60"
        >
          {submitting ? (
            <span className="size-5 rounded-full border-2 border-background border-t-transparent animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {submitting ? "A entrar..." : "Continuar com Google"}
        </button>

        <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
          Ao continuar concordas com os <span className="underline">Termos</span> e a{" "}
          <span className="underline">Política de Privacidade</span>.
        </p>
      </section>
    </main>
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