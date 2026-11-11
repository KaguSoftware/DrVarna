"use client";

import { useEffect, useState } from "react";

/** Paper background; the bottom hairline fades in only after a little scrolling. */
export function HeaderBg() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <span aria-hidden className="absolute inset-0 -z-10 bg-paper/95">
      <span
        className={`absolute inset-x-0 bottom-0 h-px bg-line transition-opacity duration-200 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
