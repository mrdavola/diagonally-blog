import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://diagonally.org"

  const staticPages = [
    "", // home
    "/about",
    "/schools",
    "/parents",
    "/blog",
    "/research",
    "/press",
    "/contact",
    "/newsletter",
  ]

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }))
}
