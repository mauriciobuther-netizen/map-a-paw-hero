import { useEffect, useState } from "react";

export function TopBlurOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-24 pointer-events-none z-40 transition-opacity duration-300 top-blur-overlay ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}