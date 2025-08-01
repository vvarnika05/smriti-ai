"use client";
import { Brain, Zap } from "lucide-react";

const About = () => {
  return (
    <section
      id="about"
      className="text-white flex flex-col justify-center items-center px-6 py-24 relative"
    >
      <div className="max-w-4xl text-center space-y-10 relative z-[1]">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Forget Fast? <br />
          <span className="text-lime-400">Remember Faster with Smriti AI.</span>
        </h2>

        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
          Learning is easy, but retention is rare. Whether it's a lecture, PDF,
          or tutorial— we forget most of it within days. That’s why we built
          Smriti AI: a tool that turns passive learning into active remembering.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-xl transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-white flex items-center justify-center gap-2">
              <Brain className="text-primary" /> Smarter Study Cycles
            </h3>
            <p className="text-gray-400">
              Our system reminds you to revise before forgetting sets in—powered
              by spaced repetition.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-xl transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-white flex items-center justify-center gap-2">
              <Zap className="text-primary" /> From Content to Clarity
            </h3>
            <p className="text-gray-400">
              Upload notes or videos, and Smriti AI turns them into mindmaps and
              quiz cards.
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 w-[180px] h-[180px] bg-primary opacity-100 blur-[200px] transform -translate-x-1/2 -translate-y-1/2"></div>
    </section>
  );
};

export default About;
