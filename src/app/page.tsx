import { Terminal } from "@/components/terminal";
import { getBlogPosts } from "@/data/blog";
import { getMediumPosts } from "@/data/medium-posts";

// The terminal prints posts as plain text, so drop the rendered HTML markup
function htmlToText(html: string) {
  return html
    .replace(/<\/(p|h[1-6]|li|pre|blockquote)>|<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:#x([\da-f]+)|#(\d+)|(amp|lt|gt|quot|apos|nbsp));/gi, (_, hex, dec, name) =>
      hex ? String.fromCodePoint(parseInt(hex, 16))
      : dec ? String.fromCodePoint(Number(dec))
      : { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }[name.toLowerCase() as "amp"]
    )
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export default async function Page() {
  const local = (await getBlogPosts()).map((post) => ({
    slug: post.slug,
    title: post.metadata.title,
    publishedAt: post.metadata.publishedAt,
    summary: post.metadata.summary,
    text: htmlToText(post.source),
    url: `/blog/${post.slug}`,
    isExternal: false,
  }));
  const external = getMediumPosts().map((post) => ({
    slug: post.url,
    title: post.title,
    publishedAt: post.publishedAt,
    summary: post.summary,
    text: post.summary,
    url: post.url,
    isExternal: true,
  }));
  const posts = [...local, ...external].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return <Terminal posts={posts} />;
}
