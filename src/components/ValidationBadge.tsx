import { ShieldCheck, ShieldAlert, ShieldQuestion, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { VALIDATION_LABELS, VALIDATION_TONE, type ValidationStatus } from "@/lib/reports";

const ICONS: Record<ValidationStatus, React.ComponentType<{ className?: string }>> = {
  unverified: Shield,
  in_validation: ShieldQuestion,
  confirmed: ShieldCheck,
  inconsistent: ShieldAlert,
  possible_fake: ShieldAlert,
  hidden_for_review: Shield,
};

export function ValidationBadge({
  status,
  className,
}: {
  status: ValidationStatus;
  className?: string;
}) {
  const Icon = ICONS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        VALIDATION_TONE[status],
        className,
      )}
    >
      <Icon className="size-3" />
      {VALIDATION_LABELS[status]}
    </span>
  );
}