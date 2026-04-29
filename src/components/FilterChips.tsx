import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Chip {
  id: string;
  label: string;
  icon?: string;
  Icon?: LucideIcon;
}
interface Props {
  chips: Chip[];
  active: string;
  onChange: (id: string) => void;
}

export function FilterChips({ chips, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
      {chips.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition border inline-flex items-center gap-1.5",
              isActive
                ? "bg-foreground text-background border-foreground shadow-soft"
                : "bg-card text-foreground border-border hover:border-foreground/40",
            )}
          >
            {c.Icon ? (
              <c.Icon className="size-4" strokeWidth={2.2} />
            ) : c.icon ? (
              <span>{c.icon}</span>
            ) : null}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}