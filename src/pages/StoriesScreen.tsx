import { MobileShell } from "@/components/MobileShell";
import { Heart, Sparkles, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Hint } from "@/components/Hint";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PublishStoryDialog } from "@/components/PublishStoryDialog";

interface StoryRow {
  id: string;
  rescuer_name: string;
  pet_name: string;
  action: string;
  story: string;
  before_photo_url: string;
  after_photo_url: string;
  likes_count: number;
  created_by: string;
}

export default function StoriesScreen() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [publishOpen, setPublishOpen] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("community_stories")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setStories((data ?? []) as StoryRow[]);
    if (user) {
      const { data: likes } = await supabase
        .from("story_likes")
        .select("story_id")
        .eq("user_id", user.id);
      setLiked(new Set((likes ?? []).map((l) => l.story_id)));
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  async function toggleLike(id: string) {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }
    const has = liked.has(id);
    setLiked((p) => {
      const n = new Set(p);
      has ? n.delete(id) : n.add(id);
      return n;
    });
    setStories((s) =>
      s.map((st) =>
        st.id === id ? { ...st, likes_count: st.likes_count + (has ? -1 : 1) } : st,
      ),
    );
    if (has) {
      await supabase.from("story_likes").delete().eq("story_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("story_likes").insert({ story_id: id, user_id: user.id });
    }
    toast.success(has ? "Curtida removida" : "Você curtiu esta história ❤️");
  }
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
        <Button
          onClick={() => {
            if (!user) {
              toast.error("Faça login para publicar uma história");
              return;
            }
            setPublishOpen(true);
          }}
          className="mt-4 rounded-full"
          size="lg"
        >
          <Plus className="size-4 mr-1" />
          Publicar minha história
        </Button>
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
        {stories.length === 0 && (
          <div className="rounded-3xl bg-card border border-dashed border-border p-8 text-center">
            <Sparkles className="size-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold text-base">Nenhuma história ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Seja o primeiro a inspirar a comunidade.
            </p>
          </div>
        )}
        {stories.map((h) => (
          <article key={h.id} className="rounded-3xl bg-card overflow-hidden shadow-soft border border-border/60 animate-float-up">
            <div className="grid grid-cols-2">
              <div className="relative aspect-square">
                <img src={h.before_photo_url} alt="Antes" className="size-full object-cover grayscale-[20%]" loading="lazy" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">Antes</span>
              </div>
              <div className="relative aspect-square">
                <img src={h.after_photo_url} alt="Depois" className="size-full object-cover" loading="lazy" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-semibold">Depois</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-sm font-bold">
                  {h.rescuer_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{h.rescuer_name}</div>
                  <div className="text-[11px] text-muted-foreground">{h.action} · {h.pet_name}</div>
                </div>
                <Hint
                  label="Curtir história"
                  description="Mostre apoio a este resgate"
                  side="left"
                >
                  <button
                    onClick={() => toggleLike(h.id)}
                    aria-label="Curtir história"
                    className="h-9 px-3 rounded-full bg-primary-soft text-primary inline-flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <Heart className={`size-4 ${liked.has(h.id) ? "fill-primary" : ""}`} />
                    <span className="text-xs font-semibold">{h.likes_count}</span>
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

      <PublishStoryDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onPublished={load}
      />
    </MobileShell>
  );
}