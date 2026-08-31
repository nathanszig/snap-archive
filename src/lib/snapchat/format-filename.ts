import type { ParsedMemory } from "./types";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function extensionFor(mediaType: string, blobType: string): string {
  if (blobType.includes("video") || mediaType.toLowerCase().includes("video")) {
    return "mp4";
  }
  if (blobType.includes("png")) return "png";
  return "jpg";
}

export function buildExportPath(memory: ParsedMemory, blob: Blob): string {
  const year = memory.date.getUTCFullYear();
  const month = pad(memory.date.getUTCMonth() + 1);
  const day = pad(memory.date.getUTCDate());
  const hours = pad(memory.date.getUTCHours());
  const minutes = pad(memory.date.getUTCMinutes());
  const seconds = pad(memory.date.getUTCSeconds());
  const ext = extensionFor(memory.mediaType, blob.type);

  return `${year}/${month}/${year}-${month}-${day}_${hours}-${minutes}-${seconds}_${memory.id}.${ext}`;
}
