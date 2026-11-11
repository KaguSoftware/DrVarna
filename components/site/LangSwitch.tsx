"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/format";

type Props = {
  lang: Locale;
  nav: Dictionary["nav"];
  variant?: "header" | "menu";
  className?: string;
  onNavigate?: () => void;
};

export function LangSwitch({ lang, nav, variant = "header", className = "", onNavigate }: Props) {
  const pathname = usePathname();
  const other: Locale = lang === "fa" ? "en" : "fa";
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  const look =
    variant === "menu"
      ? "min-h-12 min-w-12 border-white/40 text-white active:bg-white/15 focus-visible:outline-[#7cc9ca]"
      : "min-h-11 min-w-11 border-line text-ink hover:border-teal-ink hover:text-teal-ink";

  return (
    <Link
      href={`${switchLocalePath(pathname, other)}${hash}`}
      lang={other}
      hrefLang={other}
      aria-label={nav.switchLabel}
      onClick={onNavigate}
      className={`inline-flex touch-manipulation items-center justify-center rounded-full border px-4 text-[18px] font-semibold transition-colors ${look} ${className}`}
    >
      {nav.switchTo}
    </Link>
  );
}
