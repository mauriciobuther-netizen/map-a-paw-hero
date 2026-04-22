import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import slide1 from "@/assets/onboarding-1.jpg";
import slide2 from "@/assets/onboarding-2.jpg";
import slide3 from "@/assets/onboarding-3.jpg";

const slides = [
  {
    img: slide1,
    title: "Vê no mapa\nquem precisa de ti.",
    text: "Cada ponto é um cão ou gato real à espera de uma mão amiga em Teresina.",
  },
  {
    img: slide2,
    title: "Regista em segundos.",
    text: "Tira uma foto, descreve o que viste e ajuda toda a comunidade a agir rápido.",
  },
  {
    img: slide3,
    title: "Salvem vidas\njuntos.",
    text: "Resgata, adota ou apoia. Cada pequena ação muda uma história.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = slides[step];
  const last = step === slides.length - 1;

  function next() {
    if (last) navigate("/auth");
    else setStep((s) => s + 1);
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mobile-shell flex flex-col">
        <div className="relative h-[62vh] overflow-hidden">
          <img
            key={slide.img}
            src={slide.img}
            alt=""
            className="size-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <button
            onClick={() => navigate("/auth")}
            className="absolute top-5 right-5 text-sm text-white/90 bg-black/25 backdrop-blur px-4 py-1.5 rounded-full"
          >
            Saltar
          </button>
        </div>

        <div className="flex-1 px-7 -mt-6 relative z-10 flex flex-col">
          <div className="flex gap-1.5 mb-5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-8 bg-primary" : "w-2 bg-muted",
                )}
              />
            ))}
          </div>

          <h1 className="font-display text-[34px] leading-[1.05] font-bold text-foreground whitespace-pre-line text-balance animate-float-up">
            {slide.title}
          </h1>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed text-balance animate-float-up">
            {slide.text}
          </p>

          <div className="mt-auto pt-8 pb-8">
            <Button
              onClick={next}
              size="lg"
              className="w-full h-14 rounded-full text-base font-semibold gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            >
              {last ? "Entrar na comunidade" : "Continuar"}
            </Button>
            {!last && (
              <p className="text-center text-xs text-muted-foreground mt-4">
                Pequenas ações salvam vidas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}