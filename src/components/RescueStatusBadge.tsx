import { CaseStatus } from "@/types/pet";
import { statusClass, statusLabels } from "@/lib/petHelpers";
import { cn } from "@/lib/utils";

interface Props {
  status: CaseStatus;
  size?: "sm" | "md";
  className?: string;
}

export function RescueStatusBadge({ status, size = "sm", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        statusClass[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {statusLabels[status]}
    </span>
  );
}