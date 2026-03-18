import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://aiempire-one.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/profile/", "/admin/", "/earn-tokens/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
