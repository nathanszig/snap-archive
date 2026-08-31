export type SnapMediaType = "Image" | "Video" | "IMAGE" | "VIDEO" | string;

export interface SnapMemory {
  Date: string;
  "Media Type": SnapMediaType;
  Location?: string;
  "Download Link": string;
}

export interface SnapExportPayload {
  "Saved Media": SnapMemory[];
}

export interface ParsedMemory {
  id: string;
  date: Date;
  mediaType: SnapMediaType;
  location?: string;
  downloadLink: string;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface ExportOptions {
  embedExifDates: boolean;
  includeGps: boolean;
  mergeOverlays: boolean;
}

export interface DownloadProgress {
  total: number;
  completed: number;
  failed: number;
  currentLabel: string;
  status: "idle" | "running" | "done" | "error";
  errors: string[];
}

export interface ExportedFile {
  path: string;
  blob: Blob;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  embedExifDates: true,
  includeGps: true,
  mergeOverlays: true,
};
