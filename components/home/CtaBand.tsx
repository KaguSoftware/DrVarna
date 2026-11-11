import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { ArrowIcon } from "./icons";

export function CtaBand(props: { lang: Locale; title: string; button: string }) {
  return (
    <section className="mt-12 bg-ink-deep text-white md:mt-20">
      <div className="container-site flex flex-col items-start gap-10 py-20 md:py-28">
        <h2 className="max-w-[22ch] text-balance text-[2rem] font-semibold md:text-5xl">
          {props.title}
        </h2>
        <Link
          href={`/${props.lang}/contact/`}
          className="inline-flex min-h-12 items-center gap-3 rounded-full bg-teal-ink px-7 text-[1.0625rem] font-medium text-white transition-colors hover:bg-teal-deep focus-visible:outline-white"
        >
          {props.button}
          <ArrowIcon className="size-5 flip-rtl" />
        </Link>
      </div>
    </section>
  );
}
