import { MetadataRoute } from "next";
import productsConfig from "@/config/products.json";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://aiempire-one.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = productsConfig.tools as Array<{ slug: string }>;

  const staticPages = [
    "", "/pricing", "/blog", "/terms", "/privacy", "/status", "/changelog",
    "/auth/login", "/auth/signup",
  ];

  const toolPages = tools.map((t) => `/${t.slug}`);

  const allPages = [...staticPages, ...toolPages];

  return allPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/pricing" ? 0.9 : 0.7,
  }));
}
