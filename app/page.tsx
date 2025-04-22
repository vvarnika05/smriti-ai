"use client";

import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";

export default function Home() {
  return (
    <main>
      <div className="z-0 relative min-h-screen w-full overflow-hidden">
        <Hero />

        <Features />

        <Pricing />

        <About />
      </div>
    </main>
  );
}
