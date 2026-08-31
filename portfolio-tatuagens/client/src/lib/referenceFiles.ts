export type ReferenceFileMetadata = {
  name: string;
  type: string;
  size: number;
};

export function reorderReferenceFiles<T>(files: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || fromIndex >= files.length || toIndex < 0 || toIndex >= files.length || fromIndex === toIndex) {
    return files;
  }

  const next = [...files];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function formatReferenceFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

export function formatReferenceFileType(file: ReferenceFileMetadata): string {
  const extension = file.name.split(".").pop()?.trim().toUpperCase();
  if (extension && extension.length <= 5) return extension === "JPEG" ? "JPG" : extension;
  const mimeType = file.type.split("/").pop()?.trim().toUpperCase();
  return mimeType || "IMAGEM";
}
