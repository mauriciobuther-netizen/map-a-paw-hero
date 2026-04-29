import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Só ativa drag para mouse/caneta. Touch usa o scroll nativo.
    if (e.pointerType === "touch") return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    // Só captura o ponteiro depois que o usuário moveu o suficiente para
    // ser considerado um arraste — assim cliques simples continuam funcionando.
    if (drag.current.moved > 5) {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      el.scrollLeft = drag.current.startScroll - dx;
    }
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current.active = false;
  }

  function onClickCapture(e: React.MouseEvent) {
    // Bloqueia o click apenas se houve arraste real
    if (drag.current.moved > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.moved = 0;
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    // Permite scroll horizontal com a roda vertical do mouse
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onWheel={onWheel}
      className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 cursor-grab active:cursor-grabbing select-none touch-pan-x scroll-smooth"
    >
      {chips.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            draggable={false}
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