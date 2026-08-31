const MAIN_FILE_PATTERN = /-main\.(jpg|jpeg|mp4|png)$/i;

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
      reject(new Error("Impossible de charger une image overlay."));
    };

    image.src = url;
  });
}

export function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|webp)$/i.test(filename);
}

export function isVideoFile(filename: string): boolean {
  return /\.mp4$/i.test(filename);
}

export function collectOverlayFiles(
  archive: Record<string, Uint8Array>,
  mainFileName: string,
): Uint8Array[] {
  return Object.entries(archive)
    .filter(([name]) => {
      if (name.endsWith("/") || name === mainFileName) return false;
      if (MAIN_FILE_PATTERN.test(name) || isVideoFile(name)) return false;
      return /\.(png|webp)$/i.test(name);
    })
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, data]) => data);
}

export async function mergeImageWithOverlays(
  mainData: Uint8Array,
  overlays: Uint8Array[],
): Promise<Blob> {
  if (overlays.length === 0) {
    return new Blob([mainData.slice()], { type: "image/jpeg" });
  }

  const mainBlob = new Blob([mainData.slice()], { type: "image/jpeg" });
  const mainImage = await loadImage(mainBlob);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas indisponible.");
  }

  canvas.width = mainImage.naturalWidth;
  canvas.height = mainImage.naturalHeight;
  context.drawImage(mainImage, 0, 0);

  for (const overlayData of overlays) {
    const overlayBlob = new Blob([overlayData.slice()], { type: "image/png" });
    const overlayImage = await loadImage(overlayBlob);
    context.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Export JPEG impossible."));
      },
      "image/jpeg",
      0.95,
    );
  });
}
