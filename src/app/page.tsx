import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "SnapArchive — Exporte tes Memories Snapchat",
  description:
    "Transforme l'export Snapchat incompréhensible en archive ZIP triée par date. 100 % dans ton navigateur, sans upload serveur. Sauve tes Memories avant la limite 5 Go.",
  path: "/",
  ogTitle: "SnapArchive — Sauve tes Memories avant la suppression",
});

export default function HomePage() {
  return <HomeContent />;
}
