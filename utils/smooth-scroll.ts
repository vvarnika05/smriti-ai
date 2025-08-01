import React from "react"

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
const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");

    if (!href) return;

    if (href === "#") {
        smoothScrollTo(0, 500);
    } else if (href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            smoothScrollTo(targetPosition, 500);
        }
    }
};

export default handleSmoothScroll;