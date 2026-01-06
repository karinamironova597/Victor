import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://iqsafety.kz"; // поменяй если домен еще не готов

  const routes = [
    "",
    "/services",
    "/projects",
    "/equipment",
    "/about",
    "/contacts",
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}