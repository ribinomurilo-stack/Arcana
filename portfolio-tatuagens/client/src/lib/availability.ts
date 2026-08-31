import type { DrawingStatus } from "@/data/drawings";

export function getAvailabilityClass(status: DrawingStatus) {
  if (status === "Reservado") return "is-reserved";
  if (status === "Indisponível") return "is-unavailable";
  return "is-available";
}

export function getAvailabilityLabel(status: DrawingStatus) {
  return status;
}
