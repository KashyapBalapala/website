import { getBlogPosts } from "@/data/blog";
import { getMediumPosts } from "@/data/medium-posts";
import HomeClient from "./home-client";

export default async function Page() {
  const localPosts = await getBlogPosts();
  const mediumPosts = getMediumPosts();

  const posts = [
    ...localPosts.map((post) => ({
      slug: post.slug,
      title: post.metadata.title,
      url: `/blog/${post.slug}`,
      isExternal: false,
      tags: post.metadata.tags || [],
    })),
    ...mediumPosts.map((post) => ({
      slug: post.url,
      title: post.title,
      url: post.url,
      isExternal: true,
      tags: post.tags || [],
    })),
  ];

  return <HomeClient posts={posts} />;
}
