"use client";

import { useEffect, useState } from "react";

export type NavKey = "services" | "contact";

export function normalize(pathname: string) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/** Light scroll-spy: true only while the #services section crosses the middle of the viewport. */
function useServicesInView(onHome: boolean) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!onHome) return;
    const el = document.getElementById("services");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "-45% 0px -45% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onHome]);
  return onHome && inView;
}

/** Contact is current on its own page; Services only while its section is in view on the home page. */
export function useCurrent(pathname: string, lang: string): NavKey | null {
  const p = normalize(pathname);
  const onHome = p === `/${lang}/`;
  const spy = useServicesInView(onHome);
  if (p === `/${lang}/contact/`) return "contact";
  return spy ? "services" : null;
}
