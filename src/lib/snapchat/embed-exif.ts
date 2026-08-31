import piexif from "piexifjs";
import { parseSnapLocation } from "./parse-location";
import type { ParsedMemory } from "./types";

export interface ExifOptions {
  embedDates: boolean;
  includeGps: boolean;
}

function formatExifDate(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join(":") + ` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);

  for (let index = 0; index < bytes.length; index += 1) {
    buffer[index] = bytes.charCodeAt(index);
  }

  return new Blob([buffer], { type: mime });
}

async function convertToJpeg(blob: Blob): Promise<Blob> {
  if (blob.type.includes("jpeg") || blob.type.includes("jpg")) {
    return blob;
  }

  if (!blob.type.includes("png") && !blob.type.includes("webp")) {
    return blob;
  }

  const image = await loadImage(blob);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return blob;
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Conversion JPEG impossible."));
      },
      "image/jpeg",
      0.95,
    );
  });
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    image.src = url;
  });
}

function isJpegBlob(blob: Blob): boolean {
  return blob.type.includes("jpeg") || blob.type.includes("jpg");
}

export async function embedExifMetadata(
  blob: Blob,
  memory: ParsedMemory,
  options: ExifOptions,
): Promise<Blob> {
  if (!options.embedDates && !options.includeGps) {
    return blob;
  }

  let workingBlob = blob;
  if (!isJpegBlob(workingBlob)) {
    workingBlob = await convertToJpeg(workingBlob);
  }
  const dataUrl = await blobToDataUrl(workingBlob);

  const zeroth: piexif.IExif = {};
  const exif: piexif.IExif = {};
  const gps: piexif.IExif = {};
  const formattedDate = formatExifDate(memory.date);

  if (options.embedDates) {
    zeroth[piexif.ImageIFD.DateTime] = formattedDate;
    exif[piexif.ExifIFD.DateTimeOriginal] = formattedDate;
    exif[piexif.ExifIFD.DateTimeDigitized] = formattedDate;
  }

  if (options.includeGps) {
    const coordinates = parseSnapLocation(memory.location);
    if (coordinates) {
      const lat = coordinates.latitude;
      const lon = coordinates.longitude;

      gps[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
      gps[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lat));
      gps[piexif.GPSIFD.GPSLongitudeRef] = lon >= 0 ? "E" : "W";
      gps[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lon));
    }
  }

  const exifBytes = piexif.dump({
    "0th": zeroth,
    Exif: exif,
    GPS: gps,
  });

  return dataUrlToBlob(piexif.insert(exifBytes, dataUrl));
}
