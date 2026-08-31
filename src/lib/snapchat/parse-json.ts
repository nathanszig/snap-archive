import type { ParsedMemory, SnapExportPayload, SnapMemory } from "./types";

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

  const entries = Array.isArray(payload)
    ? payload
    : payload["Saved Media"];

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(
      "Aucune memory trouvée. Vérifie que tu as exporté memories_history.json avec « Export JSON files ».",
    );
  }

  return entries.map(toParsedMemory);
}

export async function extractJsonFromZip(file: File): Promise<string> {
  const { unzip } = await import("fflate");
  const buffer = new Uint8Array(await file.arrayBuffer());
  const archive = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    unzip(buffer, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

  const jsonPath = Object.keys(archive).find((path) =>
    path.toLowerCase().endsWith("memories_history.json"),
  );

  if (!jsonPath) {
    throw new Error(
      "memories_history.json introuvable dans le ZIP. Exporte bien tes données avec « Export JSON files ».",
    );
  }

  return new TextDecoder("utf-8").decode(archive[jsonPath]);
}
