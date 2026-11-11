import type { Locale, Dictionary } from "@/lib/i18n";
import { ApiIcon, ImportIcon } from "./icons";

const icons = { import: ImportIcon, api: ApiIcon } as const;

export function Services(props: { lang: Locale; items: Dictionary["services"]["items"] }) {
  return (
    <section
      id="services"
      className="container-site scroll-mt-[calc(var(--header-h)+16px)] py-12 md:py-20"
    >
      <div className="border-b border-line">
        {props.items.map((s) => {
          const Icon = icons[s.id as keyof typeof icons];
          return (
            <article
              key={s.id}
              className="grid gap-8 border-t border-line py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:py-16"
            >
              <h2 className="flex items-start gap-4 text-2xl font-semibold text-ink-deep md:text-[1.75rem]">
                {Icon ? (
                  <span className="flex h-[1lh] shrink-0 items-center text-teal-ink">
                    <Icon className="size-8" />
                  </span>
                ) : null}
                <span className="text-balance">{s.title}</span>
              </h2>
              <ul className="space-y-6">
                {s.points.map((p) => (
                  <li
                    key={p}
                    className="relative ps-7 text-[1.0625rem] text-ink before:absolute before:start-0 before:top-[0.95em] before:h-px before:w-4 before:bg-teal-ink"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
