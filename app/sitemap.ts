// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog";

const BASE =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static public routes
    const staticPaths = [
        "/",                // Home
        "/about",
        "/contributors",
        "/blogs",
        "/contact",
        "/privacy-policy",
        "/terms-of-use",
    ];

    const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
        url: new URL(p, BASE).toString(),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: p === "/" ? 1 : 0.8,
    }));

    // Dynamic blog post routes
    const posts = await getAllBlogPosts(); // returns BlogPost[] (slug, publishDate, etc.)
    const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: new URL(`/blogs/${post.slug}`, BASE).toString(),
        lastModified: post.publishDate ? new Date(post.publishDate) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
    }));

    return [...staticEntries, ...blogEntries];
}
