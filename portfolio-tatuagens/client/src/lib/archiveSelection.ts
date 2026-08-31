import type { Drawing } from "@/data/drawings";

export const ARCHIVE_SELECTION_SIZE = 10;
export const ARCHIVE_SELECTION_ROTATION_MS = 4 * 24 * 60 * 60 * 1000;
export const ARCHIVE_SELECTION_ANCHOR = Date.parse("2026-01-01T00:00:00Z");

export function getActiveArchiveSelection(drawings: Drawing[], now = Date.now()) {
  if (drawings.length <= ARCHIVE_SELECTION_SIZE) return drawings;
  const cycle = Math.max(0, Math.floor((now - ARCHIVE_SELECTION_ANCHOR) / ARCHIVE_SELECTION_ROTATION_MS));
  const rotationStep = Math.min(6, drawings.length);
  const start = (cycle * rotationStep) % drawings.length;
  return Array.from({ length: ARCHIVE_SELECTION_SIZE }, (_, index) => drawings[(start + index) % drawings.length]);
}

export function getNextArchiveSelectionAt(now = Date.now()) {
  const cycle = Math.max(0, Math.floor((now - ARCHIVE_SELECTION_ANCHOR) / ARCHIVE_SELECTION_ROTATION_MS));
  return ARCHIVE_SELECTION_ANCHOR + (cycle + 1) * ARCHIVE_SELECTION_ROTATION_MS;
}

export function getArchiveSelectionCountdown(now = Date.now()) {
  const remaining = Math.max(0, getNextArchiveSelectionAt(now) - now);
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}
