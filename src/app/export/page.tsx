import type { Metadata } from "next";
import { ExportTool } from "@/components/export-tool";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Exporter mes Memories Snapchat",
  description:
    "Importe tes ZIP mydata Snapchat, filtre par période et télécharge une archive triée avec dates EXIF et GPS. Traitement 100 % local.",
  path: "/export",
});

export default function ExportPage() {
  return <ExportTool />;
}
