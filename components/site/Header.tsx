import Link from "next/link";
import type { Locale, Dictionary } from "@/lib/i18n";
import { VMark } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { HeaderBg } from "./nav/HeaderBg";
import { DesktopNav } from "./nav/DesktopNav";

export function Header({
  lang,
  nav,
  brand,
  ctaLabel,
}: {
  lang: Locale;
  nav: Dictionary["nav"];
  brand: string;
  ctaLabel: string;
}) {
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 h-(--header-h)">
      <HeaderBg />
      <div className="container-site flex h-full items-center justify-between gap-4">
        <Link
          href={`/${lang}/`}
          aria-label={`${brand}, ${nav.home}`}
          className="relative z-10 inline-flex min-h-11 items-center gap-3 text-lg font-semibold text-ink transition-colors delay-200 duration-200 [html[data-menu-open]_&]:text-white"
        >
          <VMark className="size-9 shrink-0 text-teal" />
          <span>{brand}</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <DesktopNav lang={lang} nav={nav} />
          <LangSwitch lang={lang} nav={nav} />
          <Link
            href={`/${lang}/contact/`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal-ink px-5 text-[17px] font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95"
          >
            {ctaLabel}
          </Link>
        </div>

        <MobileMenu lang={lang} nav={nav} brand={brand} ctaLabel={ctaLabel} />
      </div>
    </header>
  );
}
