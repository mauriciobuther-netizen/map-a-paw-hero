import { CaseStatus, Species } from "@/types/pet";

export const statusLabels: Record<CaseStatus, string> = {
  spotted: "Avistado",
  needs_help: "Precisa de ajuda",
  urgent: "Urgente",
  injured: "Ferido",
  monitoring: "Em acompanhamento",
  fed: "Alimentado",
  rescued: "Resgatado",
  in_adoption: "Em adoção",
  adopted: "Adotado",
  closed: "Encerrado",
};

// classes Tailwind usando tokens semânticos
export const statusClass: Record<CaseStatus, string> = {
  spotted: "bg-white text-foreground border border-border shadow-sm",
  needs_help: "bg-warning text-warning-foreground border border-warning shadow-sm",
  urgent: "bg-urgent text-urgent-foreground border border-urgent shadow-sm",
  injured: "bg-urgent text-urgent-foreground border border-urgent shadow-sm",
  monitoring: "bg-accent text-accent-foreground border border-primary/40 shadow-sm",
  fed: "bg-success text-success-foreground border border-success shadow-sm",
  rescued: "bg-success text-success-foreground border border-success shadow-sm",
  in_adoption: "bg-primary text-primary-foreground border border-primary shadow-sm",
  adopted: "bg-success text-success-foreground border border-success shadow-sm",
  closed: "bg-muted text-foreground border border-border shadow-sm",
};

export const speciesLabel: Record<Species, string> = {
  dog: "Cachorro",
  cat: "Gato",
};

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d}d`;
  const w = Math.floor(d / 7);
  return `há ${w}sem`;
}

export function isUrgent(status: CaseStatus) {
  return status === "urgent" || status === "injured";
}