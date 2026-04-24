import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level =
    score >= 75
      ? { label: "Altamente confiável", tone: "bg-success/15 text-success border-success/30" }
      : score >= 50
        ? { label: "Confiável", tone: "bg-primary-soft text-primary border-primary/30" }
        : score >= 25
          ? { label: "Confiança inicial", tone: "bg-secondary text-foreground border-border" }
          : { label: "Em observação", tone: "bg-muted text-muted-foreground border-border" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border",
        level.tone,
        className,
      )}
    >
      <Sparkles className="size-3" />
      {level.label} · {score}
    </span>
  );
}