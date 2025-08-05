import React from "react"
import { MouseEvent } from "react";
import { useRouter } from "next/router";

// Helper function smoothScrollTo
function smoothScrollTo(targetPosition: number, duration: number = 500): void {
    const start = window.pageYOffset;
    const distance = targetPosition - start;
    let startTime: number | null = null;

    function animation(currentTime: number) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutQuad(progress);
        window.scrollTo(0, start + distance * ease);
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    function easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    requestAnimationFrame(animation);
}

// Event handler
const handleSmoothScroll = (router: ReturnType<typeof useRouter>) => {
  return (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();

      if (router.pathname === "/") {
        // Already on homepage, scroll to section
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to homepage with hash
        router.push("/" + href);
      }
    }
  };
};

export default handleSmoothScroll;