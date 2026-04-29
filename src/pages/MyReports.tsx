import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ReportRow, UrgencyLevel } from "@/lib/reports";
import { Hint } from "@/components/Hint";

const URGENCY_OPTIONS: { id: UrgencyLevel; label: string }[] = [
  { id: "low", label: "Baixa" },
  { id: "medium", label: "Média" },
  { id: "high", label: "Alta" },
  { id: "critical", label: "Crítica" },
];

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  under_review: "Em revisão",
  resolved: "Resolvido",
  archived: "Arquivado",
  hidden: "Oculto",
};

export default function MyReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [editing, setEditing] = useState<ReportRow | null>(null);
  const [deleting, setDeleting] = useState<ReportRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // form fields
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fUrgency, setFUrgency] = useState<UrgencyLevel>("medium");

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("animal_reports")
      .select("*")
      .eq("created_by", user.id)
      .order("reported_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar postagens", { description: error.message });
    } else {
      setReports(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function openEdit(r: ReportRow) {
    setEditing(r);
    setFTitle(r.title);
    setFDesc(r.description);
    setFUrgency(r.urgency);
  }

  async function saveEdit() {
    if (!editing) return;
    if (fTitle.trim().length < 3) {
      toast.error("Título muito curto");
      return;
    }
    if (fDesc.trim().length < 10) {
      toast.error("Descrição muito curta", { description: "Mínimo 10 caracteres." });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("animal_reports")
      .update({
        title: fTitle.trim(),
        description: fDesc.trim(),
        urgency: fUrgency,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast.error("Falha ao salvar", { description: error.message });
      return;
    }
    toast.success("Postagem atualizada");
    setEditing(null);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    const { error } = await supabase
      .from("animal_reports")
      .delete()
      .eq("id", deleting.id);
    setRemoving(false);
    if (error) {
      toast.error("Falha ao apagar", { description: error.message });
      return;
    }
    toast.success("Postagem apagada");
    setDeleting(null);
    setReports((prev) => prev.filter((r) => r.id !== deleting.id));
  }

  async function markResolved(r: ReportRow) {
    const { error } = await supabase
      .from("animal_reports")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", r.id);
    if (error) {
      toast.error("Falha ao atualizar", { description: error.message });
      return;
    }
    toast.success("Marcado como resolvido 🎉");
    load();
  }

  return (
    <MobileShell>
      <header className="flex items-center gap-3">
        <Hint label="Voltar" description="Volta para a tela anterior" side="bottom">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="size-10 rounded-full bg-card border border-border grid place-items-center hover:bg-muted transition active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </button>
        </Hint>
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight">Minhas postagens</h1>
          <p className="text-xs text-muted-foreground">Edite, marque como resolvido ou apague.</p>
        </div>
      </header>

      {loading ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Carregando suas postagens...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center px-6">
          <div className="size-16 rounded-full bg-primary-soft text-primary grid place-items-center">
            <Inbox className="size-7" />
          </div>
          <h2 className="font-display font-bold text-lg">Você ainda não publicou nada</h2>
          <p className="text-sm text-muted-foreground">
            Quando reportar um animal, ele aparecerá aqui para gerenciar.
          </p>
          <Button
            onClick={() => navigate("/app/report")}
            className="mt-2 rounded-full gradient-primary text-primary-foreground"
          >
            Reportar agora
          </Button>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden"
            >
              <button
                onClick={() => navigate(`/pet/${r.id}`)}
                className="w-full text-left flex gap-3 p-3"
              >
                <img
                  src={r.main_image_url}
                  alt={r.title}
                  className="size-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                      {r.title}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                        r.status === "resolved"
                          ? "bg-success/15 text-success"
                          : r.status === "active"
                            ? "bg-primary-soft text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="size-3" />
                    <span className="truncate">
                      {r.location_text || r.city || "Localização"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(r.reported_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · urgência "}
                    <span className="font-medium">{r.urgency}</span>
                  </div>
                </div>
              </button>
              <div className="flex border-t border-border divide-x divide-border">
                <Hint label="Editar postagem" description="Atualizar título, descrição ou urgência">
                  <button
                    onClick={() => openEdit(r)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition"
                  >
                    <Pencil className="size-3.5" /> Editar
                  </button>
                </Hint>
                {r.status !== "resolved" && (
                  <Hint label="Marcar como resolvido" description="O caso some das listas ativas">
                    <button
                      onClick={() => markResolved(r)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-success hover:bg-success/10 transition"
                    >
                      <CheckCircle2 className="size-3.5" /> Resolvido
                    </button>
                  </Hint>
                )}
                <Hint label="Apagar postagem" description="Esta ação não pode ser desfeita">
                  <button
                    onClick={() => setDeleting(r)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="size-3.5" /> Apagar
                  </button>
                </Hint>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar postagem</DialogTitle>
            <DialogDescription>
              Atualize as informações do animal. A localização e foto não podem ser
              alteradas — crie uma nova postagem se necessário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Título</label>
              <Input
                value={fTitle}
                onChange={(e) => setFTitle(e.target.value)}
                maxLength={80}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Descrição</label>
              <Textarea
                rows={4}
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Urgência</label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {URGENCY_OPTIONS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setFUrgency(u.id)}
                    className={cn(
                      "rounded-xl border-2 py-2 text-xs font-semibold transition",
                      fUrgency === u.id
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card",
                    )}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Salvando
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Apagar esta postagem?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Validações e interações da comunidade também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? <Loader2 className="size-4 animate-spin" /> : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}