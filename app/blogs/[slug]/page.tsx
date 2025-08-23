import { getBlogPostBySlug } from '@/lib/blog';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

interface BlogPostPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return notFound();
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-4">
        By {post.author} • {new Date(post.publishDate).toLocaleDateString()}
      </p>
      {post.featureImage.url && (
        <div className="relative w-full h-64 mb-6">
          <Image src={post.featureImage.url} alt={post.featureImage.description || post.title} fill className="object-cover rounded" />
        </div>
      )}
      
        {documentToReactComponents(post.content)}
      </div>
    </main>
  );
}
