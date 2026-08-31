import { BlobReader, TextWriter, Uint8ArrayWriter, ZipReader } from "@zip.js/zip.js";
import type {
  ImportMode,
  MemoriesImportResult,
  ParsedMemory,
  SnapExportPayload,
  SnapMemory,
} from "./types";

const MEMORIES_JSON_NAME = "memories_history.json";
const LEGACY_MAIN_PATTERN = /(?:^|\/)memories\/(.+)-main\.(jpg|jpeg|png|mp4)$/i;
const BUNDLED_MEDIA_PATTERN = /(?:^|\/)memories\/([^/]+)\.(jpg|jpeg|mp4)$/i;

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function extractMid(link: string): string {
  const match = link.match(/mid=([^&]+)/i);
  if (match?.[1]) return match[1];

  try {
    const url = new URL(link);
    const mid = url.searchParams.get("mid");
    if (mid) return mid;
  } catch {
    // ignore invalid URLs
  }

  return link.slice(-12);
}

function parseSnapDate(raw: string): Date {
  const normalized = raw.trim().replace(" UTC", "Z").replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Date invalide dans l'export : ${raw}`);
  }
  return date;
}

function getDownloadLink(entry: SnapMemory): string | null {
  const candidates = [entry["Download Link"], entry["Media Download Url"]];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed || trimmed.toUpperCase() === "N/A") continue;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
  }

  return null;
}

function normalizeMediaKind(mediaType: string): "image" | "video" {
  return mediaType.toLowerCase().includes("video") ? "video" : "image";
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toCdnMemory(entry: SnapMemory, downloadLink: string): ParsedMemory {
  return {
    id: extractMid(downloadLink),
    date: parseSnapDate(entry.Date),
    mediaType: entry["Media Type"],
    location: entry.Location,
    downloadLink,
  };
}

function toBundledMemory(entry: SnapMemory, index: number): ParsedMemory {
  const date = parseSnapDate(entry.Date);
  return {
    id: `${date.getTime()}-${normalizeMediaKind(entry["Media Type"])}-${index}`,
    date,
    mediaType: entry["Media Type"],
    location: entry.Location,
  };
}

interface IndexedMainFile {
  zipFile: File;
  mainPath: string;
  dateMs: number | null;
  dayKey: string;
  mediaKind: "image" | "video";
  overlayPaths: string[];
}

function isSecondaryMydataZip(name: string): boolean {
  return /-\d+\.zip$/i.test(name);
}

function parseMainPath(
  path: string,
  lastModDate?: Date,
): Omit<IndexedMainFile, "zipFile" | "overlayPaths"> | null {
  const normalized = normalizeZipPath(path);
  const lower = normalized.toLowerCase();

  if (lower.endsWith(".html") || lower.endsWith(".png") || lower.endsWith("memories.html")) {
    return null;
  }

  const legacy = normalized.match(LEGACY_MAIN_PATTERN);
  const bundled = legacy ? null : normalized.match(BUNDLED_MEDIA_PATTERN);
  const match = legacy ?? bundled;
  if (!match) return null;

  const stem = match[1];
  const extension = match[2].toLowerCase();
  const msMatch = stem.match(/^(\d{10,13})/);
  let dateMs = msMatch ? Number(msMatch[1]) : null;

  const humanDateMatch = stem.match(/^(\d{4}-\d{2}-\d{2})/);
  if (humanDateMatch) {
    dateMs = Date.parse(`${humanDateMatch[1]}T12:00:00Z`);
  }

  const detailedDateMatch = stem.match(/(\d{4}-\d{2}-\d{2})[_-](\d{2})-(\d{2})-(\d{2})/);
  if (detailedDateMatch) {
    dateMs = Date.parse(
      `${detailedDateMatch[1]}T${detailedDateMatch[2]}:${detailedDateMatch[3]}:${detailedDateMatch[4]}Z`,
    );
  }

  if (dateMs === null && lastModDate) {
    dateMs = lastModDate.getTime();
  }

  const resolvedDayKey = humanDateMatch
    ? humanDateMatch[1]
    : dateMs
      ? dayKey(new Date(dateMs))
      : lastModDate
        ? dayKey(lastModDate)
        : "";

  return {
    mainPath: normalized,
    dateMs,
    dayKey: resolvedDayKey,
    mediaKind: extension === "mp4" ? "video" : "image",
  };
}

function findOverlayPaths(mainPath: string, paths: string[]): string[] {
  const main = normalizeZipPath(mainPath);
  const mainBase = main.replace(/-main\.[^/]+$/i, "").replace(/\.[^./]+$/i, "");

  return paths
    .map(normalizeZipPath)
    .filter((path) => {
      if (!path.toLowerCase().endsWith(".png")) return false;
      const pathBase = path.replace(/-overlay\.[^./]+$/i, "").replace(/\.[^./]+$/i, "");
      if (pathBase === mainBase) return true;
      return path.startsWith(`${mainBase}-overlay.`) || path.startsWith(`${mainBase}_-overlay.`);
    })
    .sort((left, right) => left.localeCompare(right));
}

async function indexMainFilesFromZip(
  zipFile: File,
  onProgress?: (message: string) => void,
): Promise<IndexedMainFile[]> {
  onProgress?.(`Indexation ${zipFile.name}…`);

  const reader = new ZipReader(new BlobReader(zipFile));
  try {
    const entries = await reader.getEntries();
    const paths = entries
      .filter((entry) => !entry.directory)
      .map((entry) => normalizeZipPath(entry.filename));

    const indexed: IndexedMainFile[] = [];

    for (const entry of entries) {
      if (entry.directory) continue;
      const path = normalizeZipPath(entry.filename);
      const parsed = parseMainPath(path, entry.lastModDate);
      if (!parsed) continue;

      indexed.push({
        zipFile,
        ...parsed,
        overlayPaths: findOverlayPaths(path, paths),
      });
    }

    return indexed;
  } finally {
    await reader.close();
  }
}

function takeFromBucket(
  bucket: IndexedMainFile[],
  usedPaths: Set<string>,
): IndexedMainFile | null {
  while (bucket.length > 0) {
    const candidate = bucket.shift();
    if (!candidate || usedPaths.has(candidate.mainPath)) continue;
    usedPaths.add(candidate.mainPath);
    return candidate;
  }
  return null;
}

function matchBundledMemories(
  memories: ParsedMemory[],
  indexedFiles: IndexedMainFile[],
): { memories: ParsedMemory[]; unmatched: number } {
  const usedPaths = new Set<string>();
  const byExactMs = new Map<string, IndexedMainFile[]>();
  const byDayKind = new Map<string, IndexedMainFile[]>();

  for (const file of indexedFiles) {
    if (file.dateMs !== null) {
      const exactKey = `${file.dateMs}:${file.mediaKind}`;
      const exactBucket = byExactMs.get(exactKey) ?? [];
      exactBucket.push(file);
      byExactMs.set(exactKey, exactBucket);
    }

    const day = file.dayKey || (file.dateMs ? dayKey(new Date(file.dateMs)) : "");
    if (!day) continue;
    const dayKeyName = `${day}:${file.mediaKind}`;
    const dayBucket = byDayKind.get(dayKeyName) ?? [];
    dayBucket.push(file);
    byDayKind.set(dayKeyName, dayBucket);
  }

  let unmatched = 0;
  const matched: ParsedMemory[] = [];

  for (const memory of memories) {
    const mediaKind = normalizeMediaKind(memory.mediaType);
    const exactKey = `${memory.date.getTime()}:${mediaKind}`;
    let file =
      takeFromBucket([...(byExactMs.get(exactKey) ?? [])], usedPaths) ??
      findByTimestampInPath(memory, mediaKind, indexedFiles, usedPaths) ??
      takeFromBucket([...(byDayKind.get(`${dayKey(memory.date)}:${mediaKind}`) ?? [])], usedPaths);

    if (!file) {
      unmatched += 1;
      continue;
    }

    matched.push({
      ...memory,
      id: file.mainPath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? memory.id,
      localSource: {
        zipFile: file.zipFile,
        mainPath: file.mainPath,
        overlayPaths: file.overlayPaths,
      },
    });
  }

  return { memories: matched, unmatched };
}

function findByTimestampInPath(
  memory: ParsedMemory,
  mediaKind: "image" | "video",
  indexedFiles: IndexedMainFile[],
  usedPaths: Set<string>,
): IndexedMainFile | null {
  const timestamp = String(memory.date.getTime());

  for (const file of indexedFiles) {
    if (usedPaths.has(file.mainPath)) continue;
    if (file.mediaKind !== mediaKind) continue;
    if (!file.mainPath.includes(timestamp)) continue;
    usedPaths.add(file.mainPath);
    return file;
  }

  return null;
}

export function parseMemoriesJson(text: string): {
  cdnMemories: ParsedMemory[];
  bundledEntries: SnapMemory[];
  skippedNoLink: number;
} {
  const payload = JSON.parse(text) as SnapExportPayload | SnapMemory[];
  const entries = Array.isArray(payload) ? payload : payload["Saved Media"];

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(
      "Aucune memory trouvée. Vérifie que tu as coché « Export JSON files » sur Snapchat.",
    );
  }

  const cdnMemories: ParsedMemory[] = [];
  const bundledEntries: SnapMemory[] = [];
  let skippedNoLink = 0;

  for (const entry of entries) {
    const downloadLink = getDownloadLink(entry);
    if (downloadLink) {
      cdnMemories.push(toCdnMemory(entry, downloadLink));
    } else if (entry.Date && entry["Media Type"]) {
      bundledEntries.push(entry);
    } else {
      skippedNoLink += 1;
    }
  }

  return { cdnMemories, bundledEntries, skippedNoLink };
}

function isMemoriesJsonFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".json") && name.includes("memories");
}

function isMydataZip(file: File): boolean {
  return file.name.toLowerCase().endsWith(".zip");
}

export async function extractJsonFromZip(file: File): Promise<string | null> {
  const reader = new ZipReader(new BlobReader(file));

  try {
    const entries = await reader.getEntries();
    const jsonEntry = entries
      .filter((entry) => !entry.directory)
      .sort((left, right) => {
        const leftScore = left.filename.toLowerCase().includes("json/") ? 0 : 1;
        const rightScore = right.filename.toLowerCase().includes("json/") ? 0 : 1;
        return leftScore - rightScore;
      })
      .find((entry) => entry.filename.toLowerCase().endsWith(MEMORIES_JSON_NAME));

    if (!jsonEntry || jsonEntry.directory) return null;

    return jsonEntry.getData(new TextWriter());
  } finally {
    await reader.close();
  }
}

function sortZipFilesForImport(files: File[]): File[] {
  return [...files].sort((left, right) => {
    const leftSecondary = isSecondaryMydataZip(left.name);
    const rightSecondary = isSecondaryMydataZip(right.name);
    if (leftSecondary !== rightSecondary) return leftSecondary ? 1 : -1;
    return left.size - right.size;
  });
}

export async function resolveMemoriesImport(
  files: File[],
  onProgress?: (message: string) => void,
): Promise<MemoriesImportResult> {
  if (files.length === 0) {
    throw new Error("Aucun fichier sélectionné.");
  }

  const jsonFiles = files.filter(isMemoriesJsonFile);
  const zipFiles = files.filter(isMydataZip);

  let jsonText: string | null = null;
  let jsonSource = "";

  if (jsonFiles.length === 1) {
    jsonText = await jsonFiles[0].text();
    jsonSource = jsonFiles[0].name;
  } else if (zipFiles.length > 0) {
    const orderedZips = sortZipFilesForImport(zipFiles);

    for (let index = 0; index < orderedZips.length; index += 1) {
      const zip = orderedZips[index];
      onProgress?.(
        orderedZips.length > 1
          ? `Analyse ${zip.name} (${index + 1}/${orderedZips.length})…`
          : `Analyse de ${zip.name}…`,
      );

      try {
        const extracted = await extractJsonFromZip(zip);
        if (extracted) {
          jsonText = extracted;
          jsonSource = zip.name;
          break;
        }
      } catch {
        // Try the next archive.
      }
    }
  }

  if (!jsonText) {
    throw new Error(
      zipFiles.length > 0
        ? "memories_history.json introuvable dans tes ZIP. Vérifie que tu as coché « Export JSON files » et ajouté tous les fichiers mydata."
        : "Fichier non reconnu. Glisse tes ZIP mydata Snapchat (ou memories_history.json).",
    );
  }

  const { cdnMemories, bundledEntries, skippedNoLink } = parseMemoriesJson(jsonText);

  if (cdnMemories.length > 0) {
    return {
      memories: cdnMemories,
      mode: "cdn",
      sourceLabel:
        zipFiles.length > 1
          ? `${zipFiles.length} ZIP Snapchat · JSON dans ${jsonSource}`
          : jsonSource || jsonFiles[0]?.name || "memories_history.json",
      skippedNoLink,
      unmatchedLocal: 0,
    };
  }

  if (bundledEntries.length === 0) {
    throw new Error(
      "Export Snapchat vide ou illisible. Vérifie que « Export JSON files » était bien coché.",
    );
  }

  onProgress?.("Indexation des médias dans tes ZIP…");

  const indexedFiles: IndexedMainFile[] = [];
  for (const zip of sortZipFilesForImport(zipFiles.length > 0 ? zipFiles : files.filter(isMydataZip))) {
    indexedFiles.push(...(await indexMainFilesFromZip(zip, onProgress)));
  }

  if (indexedFiles.length === 0) {
    throw new Error(
      "Aucun fichier media trouvé dans tes ZIP. Vérifie que tu as bien téléchargé tous les mydata~….zip depuis Snapchat.",
    );
  }

  const bundledMemories = bundledEntries.map(toBundledMemory);
  const { memories, unmatched } = matchBundledMemories(bundledMemories, indexedFiles);

  if (memories.length === 0) {
    throw new Error(
      "Impossible d'associer le JSON aux fichiers media. Vérifie que tous les ZIP mydata sont bien présents.",
    );
  }

  return {
    memories,
    mode: "bundled",
    sourceLabel: `${zipFiles.length || files.length} ZIP Snapchat · export media inclus (${indexedFiles.length.toLocaleString("fr-FR")} fichiers)`,
    skippedNoLink,
    unmatchedLocal: unmatched,
  };
}

export async function readZipEntryBytes(zipFile: File, entryPath: string): Promise<Uint8Array> {
  const reader = new ZipReader(new BlobReader(zipFile));
  const normalizedTarget = normalizeZipPath(entryPath);

  try {
    const entries = await reader.getEntries();
    const entry = entries.find(
      (candidate) =>
        !candidate.directory && normalizeZipPath(candidate.filename) === normalizedTarget,
    );

    if (!entry || entry.directory) {
      throw new Error(`Fichier introuvable dans l'archive : ${entryPath}`);
    }

    return entry.getData(new Uint8ArrayWriter());
  } finally {
    await reader.close();
  }
}
