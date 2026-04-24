import { AlertTriangle, ShieldCheck } from "lucide-react";
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

interface Props {
  open: boolean;
  riskTags?: string[];
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SafetyWarningDialog({ open, onOpenChange, onConfirm, riskTags = [] }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="size-11 rounded-full bg-warning/15 text-warning-foreground grid place-items-center mb-2">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle>Vá apenas se for seguro</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Esta plataforma é colaborativa e informativa. Avalie as condições
              do local antes de agir e <strong>nunca se exponha a risco</strong>.
            </p>
            {riskTags.length > 0 && (
              <div className="rounded-xl bg-urgent/10 border border-urgent/20 p-3 text-urgent">
                <p className="font-semibold text-xs mb-1">Atenção neste caso:</p>
                <ul className="text-xs list-disc pl-4">
                  {riskTags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs flex items-start gap-2">
              <ShieldCheck className="size-4 mt-0.5 text-primary shrink-0" />
              Em situações de perigo, contacte ajuda profissional ou autoridades
              competentes. A plataforma facilita a conexão, não substitui
              equipas oficiais de resgate.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Entendi, vou com segurança
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}