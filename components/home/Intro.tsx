export function Intro(props: { text: string }) {
  return (
    <section className="container-site pt-16 pb-8 md:pt-28 md:pb-12">
      <p className="max-w-[62ch] text-pretty text-[1.375rem] leading-[1.65] text-ink-deep rtl:leading-[1.95] md:text-[1.75rem]">
        {props.text}
      </p>
    </section>
  );
}
