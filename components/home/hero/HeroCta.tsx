import Link from "next/link";
import type { Locale } from "@/lib/i18n";

/** Primary call to action (contact) plus the quiet secondary link to the services section. */
export function HeroCta({ lang, cta, secondary }: { lang: Locale; cta: string; secondary: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
      <Link
        href={`/${lang}/contact/`}
        className="inline-flex min-h-14 items-center justify-center rounded-full bg-teal-ink px-8 text-lg font-medium text-white transition-[background-color,scale] duration-150 ease-out hover:bg-teal-deep active:scale-[.97]"
      >
        {cta}
      </Link>
      <a
        href="#services"
        className="inline-flex min-h-12 items-center rounded-sm font-medium text-ink underline decoration-teal decoration-[1.5px] underline-offset-[7px] transition-colors duration-150 hover:text-teal-ink hover:decoration-teal-ink"
      >
        {secondary}
      </a>
    </div>
  );
}
