import { DATA } from "@/data/resume";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${DATA.url}/sitemap.xml`,
  };
}
