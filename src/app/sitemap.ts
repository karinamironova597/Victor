import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://iqsafety.kz";

  const routes = [
    "",              // главная страница
    "/recognition",  // страница распознавания (если она доступна пользователям)
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}