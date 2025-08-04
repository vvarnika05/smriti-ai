// app/blogs/[slug]/page.tsx
import { notFound } from "next/navigation";

const blogs = [
  {
    slug: "ai-in-education",
    title: "AI in Education",
    image: "/blog1.jpg",
    summary: "How AI is transforming education worldwide.",
    content: `
Artificial Intelligence (AI) is transforming the field of education in powerful ways. From personalized learning experiences to intelligent tutoring systems, AI is helping educators and students alike to improve learning outcomes.

One major application of AI in education is adaptive learning platforms, which adjust the difficulty and type of content based on a student’s progress and learning style. These platforms can identify areas where students struggle and provide tailored exercises to reinforce concepts.

AI is also enhancing administrative efficiency. Tasks like grading, attendance tracking, and even answering student queries can now be automated using AI-powered systems. This gives educators more time to focus on teaching and engaging with students.

Moreover, AI promotes inclusivity in education. Tools such as real-time captioning, text-to-speech readers, and language translation open up learning opportunities for students with disabilities and those in non-native language environments.

In conclusion, AI is not just a tool but a catalyst for educational innovation, paving the way for a smarter, more efficient, and inclusive future of learning.
`
,
    author: "Indhu",
    date: "Aug 3, 2025",
  },
  {
    slug: "future-of-chatbots",
    title: "The Future of Chatbots",
    image: "/blog2.jpg",
    summary: "Why conversational AI will dominate the next decade.",
    content: `
Robotics is rapidly changing how we live and work. As advancements in artificial intelligence and machine learning accelerate, modern robots are becoming more autonomous, intelligent, and capable of performing complex tasks.

From manufacturing lines to healthcare settings, robots are being used to increase efficiency and precision. For example, surgical robots assist doctors with high-precision procedures, reducing the risk of human error and improving patient recovery times.

In everyday life, robots like vacuum cleaners, delivery drones, and personal assistants are already part of many households. As this trend grows, robots are expected to take on more roles, including elder care, companionship, and education.

However, the rise of robotics also brings challenges. Concerns about job automation, ethical implications, and safety regulations must be addressed. It is essential to strike a balance between innovation and responsibility.

Ultimately, the future of robotics holds immense potential. With continued development, robots will become more integrated into our daily lives, working alongside humans to solve problems and improve our world.
`
,
    author: "Indhu",
    date: "Aug 2, 2025",
  },
];

export default function BlogDetails({ params }: { params: { slug: string } }) {
  const blog = blogs.find((b) => b.slug === params.slug);

  if (!blog) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded-xl mb-4" />
      <h1 className="text-4xl font-bold mb-2">{blog.title}</h1>
      <p className="text-gray-500 mb-6">By {blog.author} on {blog.date}</p>
      <p className="whitespace-pre-line leading-relaxed">{blog.content}</p>
    </div>
  );
}
