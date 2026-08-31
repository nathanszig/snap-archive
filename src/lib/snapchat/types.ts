export type SnapMediaType = "Image" | "Video" | "IMAGE" | "VIDEO" | string;



export interface SnapMemory {

  Date: string;

  "Media Type": SnapMediaType;

  Location?: string;

  "Download Link"?: string;

  "Media Download Url"?: string;

}



export interface SnapExportPayload {

  "Saved Media": SnapMemory[];

}



export interface LocalMediaSource {

  zipFile: File;

  mainPath: string;

  overlayPaths: string[];

}



export interface ParsedMemory {

  id: string;

  date: Date;

  mediaType: SnapMediaType;

  location?: string;

  downloadLink?: string;

  localSource?: LocalMediaSource;

  mediaSizeBytes?: number;
}



export type ImportMode = "cdn" | "bundled";



export interface MemoriesImportResult {

  memories: ParsedMemory[];

  mode: ImportMode;

  sourceLabel: string;

  skippedNoLink: number;

  unmatchedLocal: number;

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


