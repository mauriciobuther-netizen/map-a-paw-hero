import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface Props {
  children: ReactNode;
  hideNav?: boolean;
  fullBleed?: boolean;
}

export function MobileShell({ children, hideNav, fullBleed }: Props) {
  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mobile-shell pb-28">
        <div className={fullBleed ? "" : "px-5 pt-6"}>{children}</div>
      </div>
      {!hideNav && <BottomNavigation />}
    </div>
  );
}