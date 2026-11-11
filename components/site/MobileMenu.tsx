"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { VMark } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { createSheetMotion } from "./nav/sheetMotion";
import { useCurrent, type NavKey } from "./nav/current";

type Props = { lang: Locale; nav: Dictionary["nav"]; brand: string; ctaLabel: string };

const FOCUSABLE = "a[href], button:not([disabled])";

export function MobileMenu({ lang, nav, brand, ctaLabel }: Props) {
  const pathname = usePathname();
  const current = useCurrent(pathname, lang);
  const sheetId = useId();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const btnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bar1 = useRef<HTMLElement>(null);
  const bar2 = useRef<HTMLElement>(null);
  const wmRef = useRef<HTMLDivElement>(null);
  const motion = useRef<ReturnType<typeof createSheetMotion> | null>(null);
  const wasOpen = useRef(false);
  const rtl = lang === "fa";

  const close = useCallback(() => setOpen(false), []);

  // Motion engine
  useEffect(() => {
    if (!sheetRef.current || !bar1.current || !bar2.current) return;
    const m = createSheetMotion(
      { sheet: sheetRef.current, bars: [bar1.current, bar2.current], watermark: wmRef.current },
      rtl,
    );
    m.jump(0);
    motion.current = m;
    return () => {
      m.destroy();
      motion.current = null;
    };
  }, [rtl]);

  // Drive open / close (interruptible: the spring keeps its current position and velocity)
  useEffect(() => {
    const m = motion.current;
    const b = btnRef.current;
    if (!m || !b) return;
    if (open) {
      const r = b.getBoundingClientRect();
      m.setGeometry(r.left + r.width / 2, r.top + r.height / 2, window.innerWidth, window.innerHeight);
      m.go(1);
    } else {
      m.go(0);
    }
  }, [open]);

  // Close on desktop, keep the reveal origin right on resize
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => {
      if (mq.matches) {
        motion.current?.jump(0);
        setOpen(false);
      }
    };
    const onResize = () => {
      const b = btnRef.current;
      if (!b || !motion.current) return;
      const r = b.getBoundingClientRect();
      motion.current.setGeometry(r.left + r.width / 2, r.top + r.height / 2, window.innerWidth, window.innerHeight);
    };
    mq.addEventListener("change", onMq);
    window.addEventListener("resize", onResize);
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // While open: inert page, scroll lock, focus, Esc, Tab trap, flag for the logo colour
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const inerted = [document.getElementById("main"), document.querySelector("body > footer")].filter(
      (n): n is Element => !!n,
    );
    inerted.forEach((n) => n.setAttribute("inert", ""));
    const sbw = window.innerWidth - root.clientWidth;
    const prev = { overflow: root.style.overflow, pe: root.style.paddingInlineEnd };
    root.style.overflow = "hidden";
    if (sbw > 0) root.style.paddingInlineEnd = `${sbw}px`;
    root.setAttribute("data-menu-open", "");

    sheetRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const list = [btnRef.current, ...Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
        (n): n is HTMLElement => !!n,
      );
      if (!list.length) return;
      const first = list[0];
      const lastEl = list[list.length - 1];
      const a = document.activeElement as HTMLElement | null;
      const inList = !!a && list.includes(a);
      if (e.shiftKey && (a === first || !inList)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (a === lastEl || !inList)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      inerted.forEach((n) => n.removeAttribute("inert"));
      root.style.overflow = prev.overflow;
      root.style.paddingInlineEnd = prev.pe;
      root.removeAttribute("data-menu-open");
    };
  }, [open]);

  // Return focus to the button after closing
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const a = document.activeElement;
    if (!a || a === document.body || sheetRef.current?.contains(a)) btnRef.current?.focus({ preventScroll: true });
  }, [open]);

  const items: { key: NavKey; href: string; label: string; s: string }[] = [
    { key: "services", href: `/${lang}/#services`, label: nav.services, s: ".2" },
    { key: "contact", href: `/${lang}/contact/`, label: nav.contact, s: ".3" },
  ];

  return (
    <div className="md:hidden">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label={open ? nav.menuClose : nav.menuOpen}
        onClick={() => setOpen((o) => !o)}
        className={`relative z-10 -me-2 size-12 touch-manipulation rounded-xl transition-colors duration-300 focus-visible:outline-offset-[-2px] ${open ? "text-white focus-visible:outline-[#7cc9ca]" : "text-ink"}`}
      >
        <i ref={bar1} aria-hidden className="absolute start-[13px] top-[22.75px] block h-[2.5px] w-[22px] rounded-sm bg-current" />
        <i ref={bar2} aria-hidden className="absolute start-[13px] top-[22.75px] block h-[2.5px] w-[22px] rounded-sm bg-current" />
      </button>

      <div
        ref={sheetRef}
        id={sheetId}
        role="dialog"
        aria-modal="true"
        aria-label={brand}
        inert={!open}
        style={{ visibility: "hidden", paddingTop: "calc(env(safe-area-inset-top, 0px) + var(--header-h) + 24px)" }}
        className="fixed inset-x-0 top-0 z-0 flex h-dvh flex-col justify-between overflow-y-auto overflow-x-hidden bg-ink-deep pb-[max(28px,env(safe-area-inset-bottom,0px))] ps-6 pe-6 text-white"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-10 -end-28 size-[440px] text-teal opacity-[0.07]">
            <div ref={wmRef} className="size-full">
              <VMark className="block size-full" />
            </div>
          </div>
        </div>

        <nav aria-label={brand} className="relative z-10 grid">
          {items.map((it) => {
            const cur = current === it.key;
            return (
              <Link
                key={it.key}
                href={it.href}
                data-s={it.s}
                aria-current={cur ? "page" : undefined}
                onClick={close}
                className="group flex min-h-24 items-center text-[clamp(40px,12vw,62px)] leading-[1.4] font-semibold text-white focus-visible:outline-none! rtl:font-display-fa"
              >
                <span className="relative inline-block py-0.5">
                  {it.label}
                  <i
                    aria-hidden
                    className="absolute inset-x-0 bottom-1 block h-[3px] scale-x-0 bg-white transition-transform duration-[550ms] ease-out group-hover:scale-x-100 group-active:scale-x-100 group-focus-visible:scale-x-100 ltr:origin-right ltr:group-hover:origin-left ltr:group-active:origin-left ltr:group-focus-visible:origin-left rtl:origin-left rtl:group-hover:origin-right rtl:group-active:origin-right rtl:group-focus-visible:origin-right"
                  />
                  {cur && (
                    <i
                      data-cur=""
                      aria-hidden
                      className="absolute inset-x-0 -bottom-[3px] block h-1 scale-x-0 bg-teal ltr:origin-left rtl:origin-right"
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div data-s=".45" className="relative z-10 flex items-center gap-3">
          <LangSwitch lang={lang} nav={nav} variant="menu" onNavigate={close} />
          <Link
            href={`/${lang}/contact/`}
            onClick={close}
            className="inline-flex min-h-14 flex-1 touch-manipulation items-center justify-center rounded-full bg-teal-ink px-6 text-lg font-bold text-white focus-visible:outline-white active:brightness-90"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
