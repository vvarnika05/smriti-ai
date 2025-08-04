// app/blogs/page.tsx
import Link from "next/link";

const blogs = [
  {
    slug: "ai-in-education",
    title: "AI in Education",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    summary: "How AI is transforming education worldwide.",
    author: "Indhu",
    date: "Aug 3, 2025",
  },
  {
    slug: "future-of-chatbots",
    title: "The Future of Chatbots",
    image: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9",
    summary: "Why conversational AI will dominate the next decade.",
    author: "Indhu",
    date: "Aug 2, 2025",
  },
];

export default function BlogList() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Our Latest Blogs</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {blogs.map((blog) => (
          <div key={blog.slug} className="border rounded-xl shadow-md hover:shadow-lg transition">
            <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-t-xl" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              <p className="text-gray-500 text-sm">By {blog.author} on {blog.date}</p>
              <p className="mt-2">{blog.summary}</p>
              <Link href={`/blogs/${blog.slug}`} className="text-blue-600 hover:underline mt-4 inline-block">
                Read more →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
