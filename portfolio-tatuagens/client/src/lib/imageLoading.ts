export function getImageLoadingClass(loaded: boolean) {
  return `image-loading-shell${loaded ? " is-loaded" : ""}`;
}
