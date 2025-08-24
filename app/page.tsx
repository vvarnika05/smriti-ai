"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        // Scroll smoothly to the element
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname]);

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <About />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
