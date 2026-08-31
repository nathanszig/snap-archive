import type { MetadataRoute } from "next";
import { getSiteOrigin, PUBLIC_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${origin}${path || "/"}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
