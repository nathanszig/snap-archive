import type { ParsedMemory } from "./types";
import { getMemoryDateBounds } from "./filter-memories";

/** Snapchat free Memories storage (2025–2026 rollout). */
export const SNAP_FREE_STORAGE_BYTES = 5 * 1024 * 1024 * 1024;

const DEFAULT_VIDEO_BYTES = 2_500_000;
const DEFAULT_IMAGE_BYTES = 150_000;

export interface SnapFreeTierSelection {
  from: Date;
  to: Date;
  count: number;
  totalBytes: number;
  usesEstimatedSizes: boolean;
}

function estimateMediaSize(memory: ParsedMemory): number {
  if (memory.mediaSizeBytes && memory.mediaSizeBytes > 0) {
    return memory.mediaSizeBytes;
  }
  return memory.mediaType.toLowerCase().includes("video")
    ? DEFAULT_VIDEO_BYTES
    : DEFAULT_IMAGE_BYTES;
}

/**
 * Snap keeps the newest memories within 5 Go. Everything older in the stack
 * (chronologically) falls outside the free tier and is at deletion risk.
 */
export function getOutsideFreeTierSelection(
  memories: ParsedMemory[],
): SnapFreeTierSelection | null {
  if (memories.length === 0) return null;

  const sortedNewestFirst = [...memories].sort(
    (left, right) => right.date.getTime() - left.date.getTime(),
  );

  let keptBytes = 0;
  let usesEstimatedSizes = false;
  let firstOutsideIndex = sortedNewestFirst.length;

  for (let index = 0; index < sortedNewestFirst.length; index += 1) {
    const memory = sortedNewestFirst[index];
    if (!memory.mediaSizeBytes) usesEstimatedSizes = true;
    keptBytes += estimateMediaSize(memory);
    if (keptBytes > SNAP_FREE_STORAGE_BYTES) {
      firstOutsideIndex = index;
      break;
    }
  }

  const outsideFree = sortedNewestFirst.slice(firstOutsideIndex);
  if (outsideFree.length === 0) return null;

  const timestamps = outsideFree.map((memory) => memory.date.getTime());
  const totalBytes = outsideFree.reduce(
    (sum, memory) => sum + estimateMediaSize(memory),
    0,
  );

  return {
    from: new Date(Math.min(...timestamps)),
    to: new Date(Math.max(...timestamps)),
    count: outsideFree.length,
    totalBytes,
    usesEstimatedSizes,
  };
}

export function getFullRangeSelection(memories: ParsedMemory[]): SnapFreeTierSelection {
  const bounds = getMemoryDateBounds(memories);
  const totalBytes = memories.reduce((sum, memory) => sum + estimateMediaSize(memory), 0);

  return {
    from: bounds.min,
    to: bounds.max,
    count: memories.length,
    totalBytes,
    usesEstimatedSizes: memories.some((memory) => !memory.mediaSizeBytes),
  };
}

export function getLastMonthsSelection(
  memories: ParsedMemory[],
  months: number,
): SnapFreeTierSelection | null {
  if (memories.length === 0) return null;

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  cutoff.setHours(0, 0, 0, 0);

  const selected = memories.filter((memory) => memory.date >= cutoff);
  if (selected.length === 0) return null;

  const timestamps = selected.map((memory) => memory.date.getTime());

  return {
    from: new Date(Math.min(...timestamps)),
    to: new Date(Math.max(...timestamps)),
    count: selected.length,
    totalBytes: selected.reduce((sum, memory) => sum + estimateMediaSize(memory), 0),
    usesEstimatedSizes: selected.some((memory) => !memory.mediaSizeBytes),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(1)} Go`;
  }
  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(0)} Mo`;
  }
  return `${(bytes / 1024).toFixed(0)} Ko`;
}
