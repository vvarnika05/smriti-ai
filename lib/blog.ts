import { contentfulClient } from "@/lib/contentful";
import { BlogPost } from "@/types/blog";

// Fetch all blog posts
type Entry = any;

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const entries = await contentfulClient.getEntries({
    content_type: "blogPost",
    order: ["-fields.publishDate"],
  });
  return entries.items.map(mapEntryToBlogPost);
}

// Fetch single blog post by slug
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const entries = await contentfulClient.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  });
  if (!entries.items.length) return null;
  return mapEntryToBlogPost(entries.items[0]);
}

function mapEntryToBlogPost(entry: Entry): BlogPost {
  const fields = entry.fields;
  return {
    title: fields.title,
    slug: fields.slug,
    featureImage: {
      url: fields.featureImage?.fields?.file?.url
        ? `https:${fields.featureImage.fields.file.url}`
        : "",
      description: fields.featureImage?.fields?.description,
    },
    summary: fields.summary,
    content: fields.content,
    author: fields.author,
    publishDate: fields.publishDate,
  };
}
