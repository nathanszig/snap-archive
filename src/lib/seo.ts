import type { Metadata } from "next";
import { DEFAULT_SITE_URL } from "@/lib/site-url";

export const SITE_NAME = "SnapArchive";

export function getSiteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}

export function buildPageMetadata({
  title,
  description,
  path,
  ogTitle,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
}): Metadata {
  const resolvedTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle ?? resolvedTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? resolvedTitle,
      description,
    },
  };
}

export const PUBLIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/export", priority: 0.95, changeFrequency: "weekly" as const },
  {
    path: "/guide/exporter-memories-snapchat",
    priority: 0.85,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/guide/snapchat-memories-5-go",
    priority: 0.85,
    changeFrequency: "monthly" as const,
  },
  { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cgu", priority: 0.3, changeFrequency: "yearly" as const },
];
