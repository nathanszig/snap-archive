import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import type { ParsedMemory, SnapExportPayload, SnapMemory } from "./types";

const MEMORIES_JSON_NAME = "memories_history.json";

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

function toParsedMemory(entry: SnapMemory): ParsedMemory {
  if (!entry["Download Link"]) {
    throw new Error("Entrée sans lien de téléchargement.");
  }

  return {
    id: extractMid(entry["Download Link"]),
    date: parseSnapDate(entry.Date),
    mediaType: entry["Media Type"],
    location: entry.Location,
    downloadLink: entry["Download Link"],
  };
}

export function parseMemoriesJson(text: string): ParsedMemory[] {
  const payload = JSON.parse(text) as SnapExportPayload | SnapMemory[];

  const entries = Array.isArray(payload) ? payload : payload["Saved Media"];

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(
      "Aucune memory trouvée. Vérifie que tu as coché « Export JSON files » sur Snapchat.",
    );
  }

  return entries.map(toParsedMemory);
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
    const jsonEntry = entries.find(
      (entry) =>
        !entry.directory &&
        entry.filename.toLowerCase().endsWith(MEMORIES_JSON_NAME),
    );

    if (!jsonEntry || jsonEntry.directory) return null;

    return jsonEntry.getData(new TextWriter());
  } finally {
    await reader.close();
  }
}

export interface ResolvedMemoriesImport {
  jsonText: string;
  sourceLabel: string;
}

export async function resolveMemoriesJsonFromFiles(
  files: File[],
  onProgress?: (message: string) => void,
): Promise<ResolvedMemoriesImport> {
  if (files.length === 0) {
    throw new Error("Aucun fichier sélectionné.");
  }

  const jsonFiles = files.filter(isMemoriesJsonFile);
  if (jsonFiles.length === 1) {
    return {
      jsonText: await jsonFiles[0].text(),
      sourceLabel: jsonFiles[0].name,
    };
  }

  const zipFiles = files.filter(isMydataZip).sort((a, b) => a.size - b.size);
  if (zipFiles.length === 0) {
    throw new Error(
      "Fichier non reconnu. Glisse tes ZIP mydata Snapchat (ou memories_history.json).",
    );
  }

  for (let index = 0; index < zipFiles.length; index += 1) {
    const zip = zipFiles[index];
    onProgress?.(
      zipFiles.length > 1
        ? `Analyse ${zip.name} (${index + 1}/${zipFiles.length})…`
        : `Analyse de ${zip.name}…`,
    );

    try {
      const jsonText = await extractJsonFromZip(zip);
      if (jsonText) {
        return {
          jsonText,
          sourceLabel:
            zipFiles.length > 1
              ? `${zipFiles.length} ZIP Snapchat · trouvé dans ${zip.name}`
              : zip.name,
        };
      }
    } catch {
      // Try the next archive — Snapchat splits exports across several ZIPs.
    }
  }

  throw new Error(
    zipFiles.length > 1
      ? "memories_history.json introuvable dans tes ZIP. Vérifie que tu as bien coché « Export JSON files » et que tu as téléchargé tous les fichiers mydata."
      : "memories_history.json introuvable dans ce ZIP. Coche « Export JSON files » sur Snapchat ou ajoute les autres parties mydata.",
  );
}
