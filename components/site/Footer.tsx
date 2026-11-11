import Link from "next/link";
import type { Locale, Dictionary } from "@/lib/i18n";
import { site } from "@/lib/site";
import { VMark } from "./Logo";

const ph = site.isPlaceholder
  ? "border-b-[1.5px] border-dashed border-muted"
  : "";
const link =
  "inline-flex min-h-11 items-center hover:text-teal-ink";

export function Footer(props: {
  lang: Locale;
  footer: Dictionary["footer"];
  nav: Dictionary["nav"];
  brand: string;
}) {
  const { lang, footer: f, nav, brand } = props;
  const wa = `https://wa.me/${site.whatsapp}`;
  const rows: { label: string; node: React.ReactNode }[] = [
    {
      label: f.phoneLabel,
      node: (
        <a href={site.phone.href} dir="ltr" className={`${ph} ${link} tabular`}>
          {f.phone}
        </a>
      ),
    },
    {
      label: f.emailLabel,
      node: (
        <a href={`mailto:${site.email}`} dir="ltr" className={`${ph} ${link}`}>
          {site.email}
        </a>
      ),
    },
    {
      label: f.whatsappLabel,
      node: (
        <a href={wa} target="_blank" rel="noopener" dir="ltr" className={`${ph} ${link} tabular`}>
          {f.whatsapp}
        </a>
      ),
    },
    {
      label: f.addressLabel,
      node: <span className={ph}>{f.address}</span>,
    },
  ];

  return (
    <footer className="border-t border-line bg-white">
      <div className="container-site grid gap-12 py-14 md:grid-cols-[1.1fr_0.8fr_1.6fr] md:gap-16 md:py-20">
        <div className="flex items-center gap-3 self-start">
          <VMark className="h-9 w-9 text-teal-ink" />
          <span className="text-lg font-semibold text-ink-deep">{brand}</span>
        </div>
        <nav aria-label={f.navLabel}>
          <ul className="flex flex-col items-start">
            <li>
              <Link href={`/${lang}/#services`} className={link}>
                {nav.services}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/contact/`} className={link}>
                {nav.contact}
              </Link>
            </li>
          </ul>
        </nav>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr] sm:items-center">
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-sm text-muted">{r.label}</dt>
              <dd className="text-ink">{r.node}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-t border-line">
        <p className="container-site py-6 text-sm text-muted">{f.copyright}</p>
      </div>
    </footer>
  );
}
