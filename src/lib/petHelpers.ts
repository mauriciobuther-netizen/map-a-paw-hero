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
  spotted: "bg-secondary text-foreground",
  needs_help: "bg-warning/15 text-warning-foreground border border-warning/30",
  urgent: "bg-urgent text-urgent-foreground",
  injured: "bg-urgent/90 text-urgent-foreground",
  monitoring: "bg-accent text-accent-foreground",
  fed: "bg-success/15 text-success border border-success/30",
  rescued: "bg-success text-success-foreground",
  in_adoption: "bg-primary-soft text-primary border border-primary/30",
  adopted: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
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