import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Estedad, Readex_Pro } from "next/font/google";
import "../globals.css";
import { dirOf, getDictionary, hasLocale, locales } from "@/lib/i18n";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// English: Readex Pro (Latin only). Farsi: Estedad (full Persian support, including every ی form).
const readex = Readex_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex",
  display: "swap",
});

const estedad = Estedad({
  subsets: ["arabic", "latin"],
  variable: "--font-estedad",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f9f8",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    icons: { icon: "/favicon.ico" },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/logo-1024.png"],
      locale: lang === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    alternates: { languages: { fa: "/fa/", en: "/en/" } },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} dir={dirOf(lang)} className={`${readex.variable} ${estedad.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
          style={{ insetInlineStart: 12 }}
        >
          {dict.nav.skip}
        </a>
        <Header lang={lang} nav={dict.nav} brand={dict.brand.name} ctaLabel={dict.hero.cta} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} footer={dict.footer} nav={dict.nav} brand={dict.brand.name} />
      </body>
    </html>
  );
}
