import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  return [
    { url: `${DATA.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${DATA.url}/portfolio/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${DATA.url}/blog/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${DATA.url}/showcase/`, changeFrequency: "monthly", priority: 0.7 },
    ...posts.map((post) => ({
      url: `${DATA.url}/blog/${post.slug}/`,
      lastModified: post.metadata.publishedAt,
      changeFrequency: "never" as const,
      priority: 0.6,
    })),
  ];
}
