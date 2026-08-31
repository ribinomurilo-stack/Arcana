export type LightboxSwipeAction = "next" | "previous" | "close" | null;

const SWIPE_THRESHOLD = 48;
const CLOSE_THRESHOLD = 72;
const ZOOM_EPSILON = 1.02;

export function getLightboxSwipeAction(deltaX: number, deltaY: number, zoomScale = 1): LightboxSwipeAction {
  if (zoomScale > ZOOM_EPSILON) return null;
  if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > CLOSE_THRESHOLD) return "close";
  if (Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX < 0 ? "next" : "previous";
  }
  return null;
}
