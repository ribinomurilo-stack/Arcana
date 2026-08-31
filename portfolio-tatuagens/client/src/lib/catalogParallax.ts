export function getCatalogParallaxOffset(rectTop: number, rectHeight: number, viewportHeight: number, maxOffset = 10) {
  if (rectHeight <= 0 || maxOffset <= 0) return 0;
  const sectionCenter = rectTop + rectHeight / 2;
  const viewportCenter = viewportHeight / 2;
  const normalizedDistance = (viewportCenter - sectionCenter) / rectHeight;
  const offset = normalizedDistance * maxOffset;
  return Number(Math.max(-maxOffset, Math.min(maxOffset, offset)).toFixed(2));
}
