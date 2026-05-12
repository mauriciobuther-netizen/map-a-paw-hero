import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPublished?: () => void;
}

export function PublishStoryDialog({ open, onOpenChange, onPublished }: Props) {
  const { user, profile } = useAuth();
  const [petName, setPetName] = useState("");
  const [action, setAction] = useState("Adotou");
  const [story, setStory] = useState("");
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<"before" | "after" | null>(null);
  const [publishing, setPublishing] = useState(false);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  function reset() {
    setPetName("");
    setAction("Adotou");
    setStory("");
    setBeforeUrl(null);
    setAfterUrl(null);
  }

  async function handleUpload(slot: "before" | "after", file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande", { description: "Máximo 8 MB." });
      return;
    }
    setUploadingSlot(slot);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/stories/${Date.now()}-${slot}.${ext}`;
      const { error } = await supabase.storage.from("pet-photos").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
      if (slot === "before") setBeforeUrl(data.publicUrl);
      else setAfterUrl(data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tente novamente.";
      toast.error("Falha no upload", { description: msg });
    } finally {
      setUploadingSlot(null);
    }
  }

  async function publish() {
    if (!user) {
      toast.error("Faça login para publicar.");
      return;
    }
    if (!beforeUrl || !afterUrl) {
      toast.error("Adicione fotos do antes e depois");
      return;
    }
    if (!petName.trim()) {
      toast.error("Informe o nome do animal");
      return;
    }
    if (story.trim().length < 20) {
      toast.error("Conte a história", { description: "Mínimo 20 caracteres." });
      return;
    }
    setPublishing(true);
    try {
      const { error } = await supabase.from("community_stories").insert({
        created_by: user.id,
        rescuer_name: profile?.full_name || "Anônimo",
        pet_name: petName.trim(),
        action: action.trim(),
        story: story.trim(),
        before_photo_url: beforeUrl,
        after_photo_url: afterUrl,
      });
      if (error) throw error;
      toast.success("História publicada!", {
        description: "Obrigado por inspirar a comunidade.",
      });
      reset();
      onOpenChange(false);
      onPublished?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tente novamente.";
      toast.error("Falha ao publicar", { description: msg });
    } finally {
      setPublishing(false);
    }
  }

  function PhotoSlot({
    label,
    url,
    slot,
    inputRef,
  }: {
    label: string;
    url: string | null;
    slot: "before" | "after";
    inputRef: React.RefObject<HTMLInputElement>;
  }) {
    return (
      <div>
        <Label className="text-xs">{label}</Label>
        <div
          onClick={() => !url && inputRef.current?.click()}
          className="mt-1 relative aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden grid place-items-center cursor-pointer hover:bg-muted/50 transition"
        >
          {url ? (
            <>
              <img src={url} alt={label} className="size-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (slot === "before") setBeforeUrl(null);
                  else setAfterUrl(null);
                }}
                className="absolute top-2 right-2 size-7 rounded-full bg-background/90 grid place-items-center"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : uploadingSlot === slot ? (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-center text-muted-foreground">
              <ImagePlus className="size-6 mx-auto" />
              <div className="text-[11px] mt-1">Adicionar</div>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) handleUpload(slot, f);
          }}
        />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar minha história</DialogTitle>
          <DialogDescription>
            Mostre uma transformação que aqueceu seu coração.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <PhotoSlot label="Foto do antes" url={beforeUrl} slot="before" inputRef={beforeRef} />
            <PhotoSlot label="Foto do depois" url={afterUrl} slot="after" inputRef={afterRef} />
          </div>

          <div>
            <Label htmlFor="petName" className="text-xs">Nome do animal</Label>
            <Input
              id="petName"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Ex: Mel"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="action" className="text-xs">O que você fez?</Label>
            <Input
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Ex: Adotou, Resgatou, Levou ao vet"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="story" className="text-xs">Conte a história</Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Como tudo começou e como está hoje..."
              rows={4}
              className="mt-1 resize-none"
            />
            <div className="text-[11px] text-muted-foreground mt-1 text-right">
              {story.length} caracteres
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={publishing}>
            Cancelar
          </Button>
          <Button onClick={publish} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" /> A publicar...
              </>
            ) : (
              "Publicar história"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}