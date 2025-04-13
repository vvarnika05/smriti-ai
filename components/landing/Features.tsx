'use client';

const Features = () => {
  const features = [
    {
      title: '🧩 Mindmap Generator',
      desc: 'Turn complex topics into clean, interactive visual mindmaps using AI.',
    },
    {
      title: '📝 Auto Quiz Creation',
      desc: 'Smriti AI generates personalized MCQs and revision questions from your notes.',
    },
    {
      title: '⏰ Timed Reminders',
      desc: 'We notify you right before your brain starts to forget—based on proven memory curves.',
    },
    {
      title: '📥 Save Resources',
      desc: 'Bookmark important PDFs and videos to revise later with context.',
    },
    {
      title: '📊 Topic Mastery Tracker',
      desc: 'Track what you’ve retained, what’s fading, and what needs review.',
    },
    {
      title: '📲 WhatsApp Assistant',
      desc: 'Receive reminders, quizzes, and flashcards directly on your WhatsApp.',
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-black text-white px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-lime-400">Features That Stick</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-14">
          Smriti AI makes remembering effortless, fun, and intelligent—built to serve modern learners.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-xl hover:scale-[1.02] transition"
            >
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;