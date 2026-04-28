import { ReactNode, useRef, useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface Chip {
  id: string;
  label: string;
  /** Emoji ou string curta — mantido por compatibilidade. */
  icon?: string;
  /** Ícone como nó React (preferencial — usa DogIcon/CatIcon etc.). */
  iconNode?: ReactNode;
}
interface Props {
  chips: Chip[];
  active: string;
  onChange: (id: string) => void;
}

export function FilterChips({ chips, active, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ down: boolean; moved: boolean; startX: number; startScroll: number }>({
    down: false,
    moved: false,
    startX: 0,
    startScroll: 0,
  });
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = {
      down: true,
      moved: false,
      startX: e.pageX,
      startScroll: el.scrollLeft,
    };
  };
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s.down) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.pageX - s.startX;
    if (Math.abs(dx) > 4) {
      s.moved = true;
      if (!dragging) setDragging(true);
    }
    el.scrollLeft = s.startScroll - dx;
  };
  const endDrag = () => {
    dragState.current.down = false;
    if (dragging) setDragging(false);
  };

  return (
    <div
      ref={scrollerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      className={cn(
        "flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 select-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={{ scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}
    >
      {chips.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={(e) => {
              if (dragState.current.moved) {
                e.preventDefault();
                return;
              }
              onChange(c.id);
            }}
            style={{ scrollSnapAlign: "start" }}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition border",
              isActive
                ? "bg-foreground text-background border-foreground shadow-soft"
                : "bg-card text-foreground border-border hover:border-foreground/40",
            )}
          >
            {c.iconNode ? (
              <span className="grid place-items-center">{c.iconNode}</span>
            ) : c.icon ? (
              <span>{c.icon}</span>
            ) : null}
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}