import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";

export const dynamic = "force-static";

function escape(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await getBlogPosts();

  const items = posts
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .map((post) => {
      const url = `${DATA.url}/blog/${post.slug}/`;
      return `    <item>
      <title>${escape(post.metadata.title)}</title>
      <link>${url}</link>
      <description>${escape(post.metadata.summary ?? "")}</description>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${url}</guid>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(DATA.name)}</title>
    <link>${DATA.url}</link>
    <description>${escape(DATA.description)}</description>
    <language>en-us</language>
    <atom:link href="${DATA.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/xml" },
  });
}
