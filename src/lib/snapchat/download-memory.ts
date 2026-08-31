import { unzip } from "fflate";
import { embedExifMetadata } from "./embed-exif";
import { buildExportPath } from "./format-filename";
import {
  collectOverlayFiles,
  isImageFile,
  isVideoFile,
  mergeImageWithOverlays,
} from "./merge-overlays";
import type { ExportOptions, ExportedFile, ParsedMemory } from "./types";

const MAIN_FILE_PATTERN = /-main\.(jpg|jpeg|mp4|png)$/i;

async function unzipBuffer(buffer: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(buffer, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

function pickMainFile(files: Record<string, Uint8Array>): { name: string; data: Uint8Array } {
  const entries = Object.entries(files).filter(([name]) => !name.endsWith("/"));

  const main = entries.find(([name]) => MAIN_FILE_PATTERN.test(name));
  if (main) {
    return { name: main[0], data: main[1] };
  }

  const sorted = entries.sort((a, b) => b[1].length - a[1].length);
  if (!sorted[0]) {
    throw new Error("Archive vide.");
  }

  return { name: sorted[0][0], data: sorted[0][1] };
}

function inferMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

function isZip(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function isImageMemory(memory: ParsedMemory, filename: string): boolean {
  if (isVideoFile(filename)) return false;
  if (isImageFile(filename)) return true;
  return memory.mediaType.toLowerCase().includes("image");
}

async function buildBlobFromArchive(
  archive: Record<string, Uint8Array>,
  memory: ParsedMemory,
  options: ExportOptions,
): Promise<Blob> {
  const picked = pickMainFile(archive);
  const overlays = collectOverlayFiles(archive, picked.name);
  const canMergeOverlays =
    options.mergeOverlays && isImageMemory(memory, picked.name) && overlays.length > 0;

  if (canMergeOverlays) {
    return mergeImageWithOverlays(picked.data, overlays);
  }

  return new Blob([picked.data.slice()], { type: inferMimeType(picked.name) });
}

async function postProcessBlob(
  blob: Blob,
  memory: ParsedMemory,
  options: ExportOptions,
): Promise<Blob> {
  if (!blob.type.startsWith("image/")) {
    return blob;
  }

  if (!options.embedExifDates && !options.includeGps) {
    return blob;
  }

  return embedExifMetadata(blob, memory, {
    embedDates: options.embedExifDates,
    includeGps: options.includeGps,
  });
}

export async function downloadMemoryFile(
  memory: ParsedMemory,
  options: ExportOptions,
): Promise<ExportedFile> {
  const response = await fetch(memory.downloadLink);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  let blob: Blob;

  if (isZip(buffer)) {
    const archive = await unzipBuffer(buffer);
    blob = await buildBlobFromArchive(archive, memory, options);
  } else {
    blob = new Blob([buffer.slice()], {
      type: response.headers.get("content-type") ?? inferMimeType(memory.id),
    });
  }

  blob = await postProcessBlob(blob, memory, options);

  return {
    path: buildExportPath(memory, blob),
    blob,
  };
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}
