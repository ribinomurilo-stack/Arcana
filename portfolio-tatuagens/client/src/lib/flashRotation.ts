import type { Drawing } from "@/data/drawings";

export const FLASH_BATCH_SIZE = 8;
export const FLASH_ROTATION_MS = 3 * 24 * 60 * 60 * 1000;
export const FLASH_ROTATION_ANCHOR = Date.parse("2026-01-01T00:00:00Z");

export function getActiveFlashDrawings(drawings: Drawing[], now = Date.now()) {
  if (drawings.length <= FLASH_BATCH_SIZE) return drawings;
  const cycle = Math.max(0, Math.floor((now - FLASH_ROTATION_ANCHOR) / FLASH_ROTATION_MS));
  const rotationStep = Math.min(4, drawings.length);
  const start = (cycle * rotationStep) % drawings.length;
  return Array.from({ length: FLASH_BATCH_SIZE }, (_, index) => drawings[(start + index) % drawings.length]);
}

export function getVisibleFlashDrawings(drawings: Drawing[], visibleCount: number) {
  return drawings.slice(0, Math.max(0, visibleCount));
}

export function hasMoreFlashDrawings(drawings: Drawing[], visibleCount: number) {
  return visibleCount < drawings.length;
}

export function getDrawingShareUrl(url: string, origin: string) {
  return new URL(url, origin).href;
}

export function getWhatsAppShareUrl(message: string) {
  return `https://api.whatsapp.com/send/?phone=5511984564012&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0&utm_source=ig`;
}

export function getNextFlashRotationAt(now = Date.now()) {
  const cycle = Math.max(0, Math.floor((now - FLASH_ROTATION_ANCHOR) / FLASH_ROTATION_MS));
  return FLASH_ROTATION_ANCHOR + (cycle + 1) * FLASH_ROTATION_MS;
}

export function getFlashCountdown(now = Date.now()) {
  const remaining = Math.max(0, getNextFlashRotationAt(now) - now);
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}
