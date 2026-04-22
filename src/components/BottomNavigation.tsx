import { NavLink, useLocation } from "react-router-dom";
import { Map, Compass, Plus, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app/map", label: "Mapa", icon: Map },
  { to: "/app/explore", label: "Explorar", icon: Compass },
  { to: "/app/report", label: "Publicar", icon: Plus, primary: true },
  { to: "/app/stories", label: "Histórias", icon: Sparkles },
  { to: "/app/profile", label: "Perfil", icon: User },
];

export function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[1100] w-[calc(100%-1.5rem)] max-w-[460px]"
    >
      <div className="flex items-center justify-between gap-1 rounded-full bg-card/95 backdrop-blur-xl px-2 py-2 shadow-elegant border border-border/60">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname.startsWith(to);
          if (primary) {
            return (
              <NavLink
                key={to}
                to={to}
                className="grid place-items-center size-12 rounded-full gradient-primary text-primary-foreground shadow-glow active:scale-95 transition"
                aria-label={label}
              >
                <Icon className="size-5" strokeWidth={2.5} />
              </NavLink>
            );
          }
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-3 py-2 transition flex-1",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "fill-primary/15")} strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}