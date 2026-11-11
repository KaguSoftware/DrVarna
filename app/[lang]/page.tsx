import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { HeroGrains } from "@/components/home/HeroGrains";
import { Intro } from "@/components/home/Intro";
import { Services } from "@/components/home/Services";
import { CtaBand } from "@/components/home/CtaBand";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      {/* Swap to <HeroWindow .../> (components/home/HeroWindow.tsx) to use the "Giant V as a window" hero. */}
      <HeroGrains lang={lang} hero={dict.hero} />
      <Intro text={dict.intro} />
      <Services lang={lang} items={dict.services.items} />
      <CtaBand lang={lang} title={dict.ctaBand.title} button={dict.ctaBand.button} />
    </>
  );
}
