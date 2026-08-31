declare module "piexifjs" {
  interface IExif {
    [key: number]: string | number | number[] | number[][];
  }

  interface GPSHelper {
    degToDmsRational(deg: number): number[][];
  }

  interface ImageIFD {
    DateTime: number;
  }

  interface ExifIFD {
    DateTimeOriginal: number;
    DateTimeDigitized: number;
  }

  interface GPSIFD {
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
  }

  export const ImageIFD: ImageIFD;
  export const ExifIFD: ExifIFD;
  export const GPSIFD: GPSIFD;
  export const GPSHelper: GPSHelper;

  export function dump(exifObj: {
    "0th": IExif;
    Exif: IExif;
    GPS: IExif;
  }): string;

  export function insert(exifBytes: string, dataUrl: string): string;
}
