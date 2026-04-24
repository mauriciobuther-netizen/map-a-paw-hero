import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReportRow = Database["public"]["Tables"]["animal_reports"]["Row"];
export type ReportInsert = Database["public"]["Tables"]["animal_reports"]["Insert"];
export type ValidationAction = Database["public"]["Enums"]["validation_action"];
export type ValidationStatus = Database["public"]["Enums"]["validation_status"];
export type SpeciesType = Database["public"]["Enums"]["species_type"];
export type UrgencyLevel = Database["public"]["Enums"]["urgency_level"];

import type { PetCase } from "@/types/pet";

/** Adapt a DB report row to the legacy PetCase shape used by UI components. */
export function rowToPetCase(r: ReportRow): PetCase {
  const status: PetCase["status"] =
    r.urgency === "critical" || r.urgency === "high" ? "urgent" : "needs_help";
  return {
    id: r.id,
    species: r.species as PetCase["species"],
    status,
    photos: [r.main_image_url],
    title: r.title,
    description: r.description,
    color: r.color_description ?? "—",
    size: (r.size_category as PetCase["size"]) ?? "medium",
    sex: "unknown",
    behaviors: (r.behavior_tags as PetCase["behaviors"]) ?? [],
    count: 1,
    lat: r.latitude,
    lng: r.longitude,
    neighborhood: r.location_text ?? r.city ?? "—",
    address: r.location_text ?? "",
    reportedAt: r.reported_at,
    reportedBy: { id: r.created_by ?? "anon", name: "Voluntário" },
    helpers: 0,
  };
}

export const RISK_TAG_LABELS: Record<string, string> = {
  dangerous_area: "Zona perigosa",
  aggressive_animal: "Animal agressivo",
  isolated_area: "Local isolado",
  low_visibility: "Baixa visibilidade",
  traffic_risk: "Via movimentada",
  hard_access: "Difícil acesso",
  health_risk: "Risco sanitário",
  needs_professional_help: "Necessita ajuda profissional",
};

export const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  unverified: "Não verificado",
  in_validation: "Em validação",
  confirmed: "Confirmado pela comunidade",
  inconsistent: "Informação inconsistente",
  possible_fake: "Possível caso falso",
  hidden_for_review: "Em revisão",
};

export const VALIDATION_TONE: Record<ValidationStatus, string> = {
  unverified: "bg-muted text-muted-foreground",
  in_validation: "bg-primary-soft text-primary border border-primary/30",
  confirmed: "bg-success/15 text-success border border-success/30",
  inconsistent: "bg-warning/15 text-warning-foreground border border-warning/30",
  possible_fake: "bg-urgent/15 text-urgent border border-urgent/30",
  hidden_for_review: "bg-muted text-muted-foreground",
};

/** Distance between two GPS points in meters (Haversine). */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Look up nearby reports of the same species in the last 48h. */
export async function findPossibleDuplicates(params: {
  species: SpeciesType;
  lat: number;
  lng: number;
  radiusMeters?: number;
  hoursWindow?: number;
}): Promise<ReportRow[]> {
  const { species, lat, lng } = params;
  const radius = params.radiusMeters ?? 200;
  const hours = params.hoursWindow ?? 48;

  // Bounding box pre-filter (~0.0018 deg ≈ 200m at this latitude)
  const delta = (radius / 111_000) * 1.5;
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("animal_reports")
    .select("*")
    .eq("species", species)
    .eq("status", "active")
    .gte("reported_at", since)
    .gte("latitude", lat - delta)
    .lte("latitude", lat + delta)
    .gte("longitude", lng - delta)
    .lte("longitude", lng + delta)
    .limit(20);

  if (error) throw error;
  return (data ?? []).filter(
    (r) => distanceMeters({ lat, lng }, { lat: r.latitude, lng: r.longitude }) <= radius,
  );
}

export async function fetchActiveReports(): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from("animal_reports")
    .select("*")
    .eq("status", "active")
    .order("reported_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function fetchReportById(id: string): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from("animal_reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createValidation(params: {
  reportId: string;
  userId: string;
  action: ValidationAction;
  weight: number;
  note?: string;
}) {
  const { error } = await supabase.from("report_validations").insert({
    report_id: params.reportId,
    user_id: params.userId,
    action_type: params.action,
    validation_weight: params.weight,
    note: params.note,
  });
  if (error) throw error;
}

export async function fetchUserValidations(reportId: string, userId: string) {
  const { data, error } = await supabase
    .from("report_validations")
    .select("action_type")
    .eq("report_id", reportId)
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.action_type as ValidationAction));
}

export async function countValidations(reportId: string) {
  const { data, error } = await supabase
    .from("report_validations")
    .select("action_type")
    .eq("report_id", reportId);
  if (error) throw error;
  const counts: Record<ValidationAction, number> = {
    confirm_seen: 0,
    confirm_info: 0,
    deny_not_there: 0,
    possible_fake: 0,
    already_helped: 0,
    animal_removed: 0,
  };
  for (const r of data ?? []) counts[r.action_type as ValidationAction]++;
  return counts;
}

/** Get current GPS position with high accuracy. */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalização não disponível neste dispositivo."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}