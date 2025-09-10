import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const BASE = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
