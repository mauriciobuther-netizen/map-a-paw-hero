export type Species = "dog" | "cat";
export type Sex = "male" | "female" | "unknown";
export type Size = "small" | "medium" | "large";

export type CaseStatus =
  | "spotted"        // Avistado
  | "needs_help"     // Precisa de ajuda
  | "urgent"         // Urgente
  | "injured"        // Ferido
  | "monitoring"     // Em acompanhamento
  | "fed"            // Alimentado
  | "rescued"        // Resgatado
  | "in_adoption"    // Em adoção
  | "adopted"        // Adotado
  | "closed";        // Encerrado

export type Behavior =
  | "scared"
  | "aggressive"
  | "docile"
  | "injured"
  | "hungry"
  | "lost";

export interface PetCase {
  id: string;
  species: Species;
  status: CaseStatus;
  photos: string[];
  title: string;
  description: string;
  color: string;
  size: Size;
  sex: Sex;
  ageEstimate?: string;
  behaviors: Behavior[];
  count: number;
  lat: number;
  lng: number;
  neighborhood: string;
  address: string;
  reportedAt: string;        // ISO
  reportedBy: { id: string; name: string; avatar?: string };
  helpers: number;
  distanceKm?: number;
  updates?: CaseUpdate[];
}

export interface CaseUpdate {
  id: string;
  type: "fed" | "watered" | "vet" | "rescued" | "adopted" | "ngo" | "note";
  by: string;
  at: string;
  comment?: string;
  photo?: string;
}

export interface Vet {
  id: string;
  name: string;
  type: "clinic" | "hospital" | "ngo";
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  hours?: string;
}

export interface HappyEnding {
  id: string;
  petName: string;
  beforePhoto: string;
  afterPhoto: string;
  rescuerName: string;
  rescuerAvatar?: string;
  action: string;
  story: string;
  resolvedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  avatar?: string;
  level: number;
  points: number;
  helped: number;
  reported: number;
  resolved: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}