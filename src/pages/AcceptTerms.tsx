import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type TermsRow = {
  id: string;
  version_code: string;
  title: string;
  content: string;
};

export default function AcceptTerms() {
  const { user, refreshTermsAcceptance } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<TermsRow | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("terms_versions")
        .select("id, version_code, title, content")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (error) {
        toast.error("Não foi possível carregar os termos.");
      } else {
        setTerms(data);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function accept() {
    if (!user || !terms || !agreed) return;
    setSubmitting(true);
    const { error } = await supabase.from("user_terms_acceptance").insert({
      user_id: user.id,
      terms_version_id: terms.id,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível registrar o aceite.", {
        description: error.message,
      });
      return;
    }
    await refreshTermsAcceptance();
    navigate("/app/explore", { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!terms) return null;

  return (
    <main className="min-h-screen bg-background p-5 flex justify-center">
      <div className="w-full max-w-md flex flex-col gap-5">
        <header className="flex items-center gap-3 mt-4">
          <div className="size-10 rounded-full bg-primary-soft text-primary grid place-items-center">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Versão {terms.version_code}
            </p>
            <h1 className="font-display text-xl font-bold leading-tight">
              {terms.title}
            </h1>
          </div>
        </header>

        <p className="text-sm text-muted-foreground">
          Antes de continuar, leia e aceite os termos que regem o uso desta
          plataforma colaborativa.
        </p>

        <ScrollArea className="flex-1 rounded-2xl border border-border bg-card p-4 max-h-[55vh]">
          <div className="text-sm whitespace-pre-line leading-relaxed text-foreground/90">
            {terms.content}
          </div>
        </ScrollArea>

        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer">
          <Checkbox
            checked={agreed}
            onCheckedChange={(c) => setAgreed(c === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-relaxed">
            Li, compreendi e aceito os termos. Entendo que esta plataforma é
            colaborativa e que assumo responsabilidade pelas minhas decisões ao
            agir presencialmente.
          </span>
        </label>

        <Button
          onClick={accept}
          disabled={!agreed || submitting}
          className="w-full h-12 rounded-full font-semibold gradient-primary text-primary-foreground shadow-glow"
        >
          {submitting ? "A registar..." : "Aceitar e continuar"}
        </Button>
      </div>
    </main>
  );
}