import { cn } from "@/lib/utils";
import { Star, Users } from "lucide-react";

export type CommunityStatusType = "none" | "community" | "neighborhood_star";

const config: Record<Exclude<CommunityStatusType, "none">, { label: string; icon: typeof Star; tone: string }> = {
  community: {
    label: "Comunitário",
    icon: Users,
    tone: "bg-primary-soft text-primary border border-primary/30",
  },
  neighborhood_star: {
    label: "Estrela do Bairro",
    icon: Star,
    tone: "bg-warning/15 text-warning-foreground border border-warning/30",
  },
};

interface Props {
  status: CommunityStatusType;
  size?: "sm" | "md";
  className?: string;
}

export function CommunityBadge({ status, size = "sm", className }: Props) {
  if (status === "none") return null;
  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        c.tone,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {c.label}
    </span>
  );
}