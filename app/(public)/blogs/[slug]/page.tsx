import { getBlogPostBySlug } from "@/lib/blog";
import Image from "next/image";
import { notFound } from "next/navigation";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return notFound();

  return (
    <main className="max-w-2xl mx-auto pb-24 px-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-4">
        By {post.author} • {new Date(post.publishDate).toLocaleDateString()}
      </p>
      {post.featureImage?.url && (
        <div className="relative w-full h-64 mb-6">
          <Image
            src={post.featureImage.url}
            alt={post.featureImage.description || post.title}
            fill
            sizes="(min-width: 640px) 42rem, 100vw"
            className="object-cover rounded"
          />
        </div>
      )}

      <div className="prose prose-lg">
        {documentToReactComponents(post.content)}
      </div>
    </main>
  );
}
