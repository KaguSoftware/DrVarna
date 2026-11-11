"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, Dictionary } from "@/lib/i18n";
import { useCurrent, type NavKey } from "./current";

export function DesktopNav({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const pathname = usePathname();
  const current = useCurrent(pathname, lang);
  const items: { key: NavKey; href: string; label: string }[] = [
    { key: "services", href: `/${lang}/#services`, label: nav.services },
    { key: "contact", href: `/${lang}/contact/`, label: nav.contact },
  ];
  return (
    <nav className="flex items-center gap-2">
      {items.map((it) => {
        const cur = current === it.key;
        return (
          <Link
            key={it.key}
            href={it.href}
            aria-current={cur ? "page" : undefined}
            className="group relative inline-flex min-h-11 items-center px-3 text-[17px] font-medium text-ink"
          >
            <span className="relative py-1">
              {it.label}
              <i
                aria-hidden
                className={`absolute inset-x-0 -bottom-0.5 block h-0.5 bg-teal transition-transform duration-500 ease-out ltr:origin-left rtl:origin-right group-hover:scale-x-100 group-focus-visible:scale-x-100 ${cur ? "scale-x-100" : "scale-x-0"}`}
              />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
