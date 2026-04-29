import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface HintProps {
  /** Texto curto explicando para que serve o botão/elemento. */
  label: string;
  /** Conteúdo extra opcional mostrado abaixo do label. */
  description?: string;
  /** Lado preferido do tooltip. */
  side?: "top" | "right" | "bottom" | "left";
  /** Filho único interativo (botão, link, etc.). */
  children: React.ReactElement;
}

/**
 * Envolve um elemento interativo com uma dica do que ele faz:
 *  - Desktop: tooltip ao passar o mouse (hover) e ao focar.
 *  - Mobile: long-press (>450ms) revela a dica via toast e cancela o clique
 *    seguinte para o usuário poder descobrir a função sem disparar a ação.
 * Também adiciona `title` nativo como fallback universal.
 */
export function Hint({ label, description, side = "top", children }: HintProps) {
  const pressTimer = React.useRef<number | null>(null);
  const longPressed = React.useRef(false);

  const clearTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const showHintToast = () => {
    toast.message(label, description ? { description } : undefined);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Apenas para toque — mouse usa hover do tooltip.
    if (e.pointerType !== "touch") return;
    longPressed.current = false;
    clearTimer();
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      showHintToast();
    }, 450);
  };

  const handlePointerEnd = () => {
    clearTimer();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (longPressed.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressed.current = false;
    }
  };

  const childProps = children.props as Record<string, unknown>;
  const enhanced = React.cloneElement(children, {
    title: (childProps.title as string | undefined) ?? label,
    onPointerDown: (e: React.PointerEvent) => {
      handlePointerDown(e);
      (childProps.onPointerDown as ((ev: React.PointerEvent) => void) | undefined)?.(e);
    },
    onPointerUp: (e: React.PointerEvent) => {
      handlePointerEnd();
      (childProps.onPointerUp as ((ev: React.PointerEvent) => void) | undefined)?.(e);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      handlePointerEnd();
      (childProps.onPointerLeave as ((ev: React.PointerEvent) => void) | undefined)?.(e);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      handlePointerEnd();
      (childProps.onPointerCancel as ((ev: React.PointerEvent) => void) | undefined)?.(e);
    },
    onClickCapture: (e: React.MouseEvent) => {
      handleClickCapture(e);
      (childProps.onClickCapture as ((ev: React.MouseEvent) => void) | undefined)?.(e);
    },
  });

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{enhanced}</TooltipTrigger>
      <TooltipContent side={side} className="max-w-[220px] text-xs">
        <div className="font-semibold">{label}</div>
        {description && (
          <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{description}</div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}