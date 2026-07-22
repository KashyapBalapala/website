export interface MediumPost {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  isExternal?: boolean;
}

// Add your own Medium (or other external platform) posts here — they'll
// show up in the blog listing and knowledge graph alongside your local posts.
export const mediumPosts: MediumPost[] = [];

export function getMediumPosts(): MediumPost[] {
  return mediumPosts;
}
