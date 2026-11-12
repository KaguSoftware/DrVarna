"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { localizeDigits } from "@/lib/format";
import { site } from "@/lib/site";
import { ApiIcon, ArrowIcon, ImportIcon, WhatsAppIcon } from "@/components/home/icons";
import {
  allDetailKeys,
  buildPayload,
  buildWhatsAppText,
  contactRows,
  detailRows,
  topicFields,
  topicIds,
  validateContact,
  validateDetails,
  type Errors,
  type FieldDef,
  type FieldKey,
  type TopicId,
  type Values,
} from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error" | "nokey";

const TOTAL = 4;
const topicIcon: Partial<Record<TopicId, typeof ImportIcon>> = { import: ImportIcon, api: ApiIcon };

const inputCls =
  "block w-full min-h-12 rounded-sm border border-[#8793a0] bg-white px-3.5 text-start text-base text-ink placeholder:text-muted aria-[invalid=true]:border-err";
const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-teal-ink px-6 text-base font-medium text-white transition-colors hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-70";
const btnGhost =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 text-base font-medium text-ink transition-colors hover:border-[#8793a0]";
const textLink =
  "inline-flex min-h-11 items-center gap-2 text-base font-medium text-teal-ink underline decoration-teal-ink/40 underline-offset-4 hover:decoration-teal-ink";

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}

function CheckDraw() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: 500,
      delay: 100,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "backwards",
    });
  }, []);
  return (
    <svg viewBox="0 0 24 24" className="size-12 text-ok" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path ref={ref} d="M7.5 12.5l3 3 6-6.5" pathLength={1} strokeDasharray={1} />
    </svg>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-2 text-[0.9375rem] text-err">
      {msg}
    </p>
  );
}

function Row({ label, value, isolate }: { label: string; value: string; isolate?: boolean }) {
  return (
    <div className="grid gap-0.5 min-[480px]:grid-cols-[minmax(0,min(40%,14rem))_minmax(0,1fr)] min-[480px]:gap-x-6">
      <dt className="text-start text-base text-muted">{label}</dt>
      <dd className="text-start text-base whitespace-pre-line text-ink [overflow-wrap:anywhere]">
        {isolate ? <bdi>{value}</bdi> : value}
      </dd>
    </div>
  );
}

export function ContactStepper(props: { lang: "fa" | "en"; t: Dictionary["contact"] }) {
  const { lang, t } = props;
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const dirRef = useRef<1 | -1>(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const done = status === "success";

  const n = (v: number) => localizeDigits(v, lang);
  const setVal = (key: FieldKey, v: string) => {
    setValues((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // Directional slide (RTL aware) and focus on the new step's heading.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
    const el = panelRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = 24 * dirRef.current * (lang === "fa" ? -1 : 1);
    el.animate(
      [
        { opacity: 0, transform: `translateX(${from}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [step, done, lang]);

  const go = (to: number) => {
    dirRef.current = to >= step ? 1 : -1;
    setErrors({});
    setStep(to);
  };

  const focusFirst = (errs: Errors, order: FieldKey[]) => {
    const first = order.find((k) => errs[k]);
    if (first) document.getElementById(`cf-${first}`)?.focus();
  };

  const pickTopic = (id: TopicId) => {
    if (id !== topic) {
      setValues((p) => {
        const next = { ...p };
        for (const k of allDetailKeys) delete next[k];
        return next;
      });
    }
    setTopic(id);
    dirRef.current = 1;
    setErrors({});
    setStep(1);
  };

  const send = async () => {
    if (!topic) return;
    if (!site.web3formsKey) {
      setStatus("nokey");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildPayload(t, site.web3formsKey, topic, values)),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (res.ok && data?.success) {
        dirRef.current = 1;
        setStatus("success");
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (step === 1 && topic) {
      const errs = validateDetails(topic, values, t);
      setErrors(errs);
      if (Object.keys(errs).length) return focusFirst(errs, topicFields[topic].map((f) => f.key));
      go(2);
    } else if (step === 2) {
      const errs = validateContact(values, t);
      setErrors(errs);
      if (Object.keys(errs).length) return focusFirst(errs, ["name", "org", "phone", "email"]);
      go(3);
    } else if (step === 3) {
      void send();
    }
  };

  const reset = () => {
    dirRef.current = -1;
    setTopic(null);
    setValues({});
    setErrors({});
    setStatus("idle");
    setStep(0);
  };

  const waHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(buildWhatsAppText(t, topic, values))}`;
  const waLink = (
    <a href={waHref} target="_blank" rel="noopener" className={btnGhost}>
      <WhatsAppIcon className="size-5" />
      {t.wa}
    </a>
  );

  const label = t.steps[step];
  const live = t.stepOf.replace("{n}", n(step + 1)).replace("{total}", n(TOTAL)).replace("{label}", label);
  const h2 = "text-2xl font-semibold text-ink-deep outline-none";

  const renderField = (f: FieldDef) => {
    const id = `cf-${f.key}`;
    const err = errors[f.key];
    const errId = `${id}-err`;
    if (f.kind === "choice") {
      return (
        <fieldset key={f.key}>
          <legend className="mb-2 text-base font-medium text-ink-deep">{t.fields[f.key]}</legend>
          <div className="flex flex-wrap gap-2">
            {f.options?.map((o, i) => (
              <label
                key={o}
                className="relative inline-flex min-h-12 cursor-pointer items-center rounded-md border border-[#8793a0] bg-white px-5 text-base has-[:checked]:border-teal-ink has-[:checked]:bg-teal-wash has-[:checked]:font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-ink"
              >
                <input
                  type="radio"
                  id={i === 0 ? id : undefined}
                  name={f.key}
                  value={o}
                  checked={values[f.key] === o}
                  onChange={() => setVal(f.key, o)}
                  className="sr-only"
                />
                {t.options[o]}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    const common = {
      id,
      name: f.key,
      value: values[f.key] ?? "",
      "aria-invalid": err ? (true as const) : undefined,
      "aria-describedby": err ? errId : undefined,
      "aria-required": f.required ? (true as const) : undefined,
      style: { unicodeBidi: "plaintext" as const },
    };
    return (
      <div key={f.key}>
        <label htmlFor={id} className="mb-2 block text-base font-medium text-ink-deep">
          {t.fields[f.key]}
        </label>
        {f.kind === "textarea" ? (
          <textarea
            {...common}
            rows={4}
            placeholder={t.placeholders[f.key as keyof typeof t.placeholders]}
            onChange={(e) => setVal(f.key, e.target.value)}
            className={`${inputCls} py-3`}
          />
        ) : (
          <input
            {...common}
            type="text"
            placeholder={t.placeholders[f.key as keyof typeof t.placeholders]}
            inputMode={f.inputMode}
            onChange={(e) => setVal(f.key, e.target.value)}
            className={inputCls}
          />
        )}
        <FieldError id={errId} msg={err} />
      </div>
    );
  };

  const contactField = (key: "name" | "org" | "phone" | "email") => {
    const id = `cf-${key}`;
    const err = errors[key];
    const describedBy =
      [key === "phone" ? "cf-hint" : undefined, err ? `${id}-err` : undefined].filter(Boolean).join(" ") ||
      undefined;
    const type = key === "phone" ? "tel" : key === "email" ? "email" : "text";
    const ltrField = key === "phone" || key === "email";
    const autoComplete = { name: "name", org: "organization", phone: "tel", email: "email" }[key];
    return (
      <div key={key}>
        <label htmlFor={id} className="mb-2 block text-base font-medium text-ink-deep">
          {t.fields[key]}
        </label>
        <input
          id={id}
          name={key}
          type={type}
          inputMode={key === "phone" ? "tel" : key === "email" ? "email" : undefined}
          autoComplete={autoComplete}
          value={values[key] ?? ""}
          onChange={(e) => setVal(key, e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={describedBy}
          aria-required={key === "name" ? true : undefined}
          placeholder={t.placeholders[key]}
          {...(ltrField ? { dir: "ltr" as const } : { style: { unicodeBidi: "plaintext" as const } })}
          className={`${inputCls} ${ltrField ? (lang === "fa" ? "text-end" : "text-start") : ""}`}
        />
        <FieldError id={`${id}-err`} msg={err} />
      </div>
    );
  };

  const group = (title: string, to: number, children: React.ReactNode) => (
    <section className="py-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-semibold text-ink-deep">{title}</h3>
        <button type="button" onClick={() => go(to)} aria-label={`${t.edit} ${title}`} className={`${textLink} shrink-0`}>
          {t.edit}
        </button>
      </div>
      {children}
    </section>
  );

  const reviewRow = (r: { key: FieldKey; label: string; value: string }) => {
    const v = r.key === "phone" ? localizeDigits(r.value, lang) : r.value;
    return <Row key={r.key} label={r.label} value={v} isolate />;
  };

  let body: React.ReactNode = null;

  if (done) {
    body = (
      <div className="flex flex-col items-start gap-6">
        <CheckDraw />
        <h2 ref={headingRef} tabIndex={-1} className={h2}>
          {t.ok}
        </h2>
        <div className="flex flex-wrap gap-3">
          {site.showWhatsApp && waLink}
          <button type="button" onClick={reset} className={btnGhost}>
            {t.startOver}
          </button>
        </div>
      </div>
    );
  } else if (step === 0) {
    body = (
      <>
        <h2 ref={headingRef} tabIndex={-1} className={h2}>
          {t.q1}
        </h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {topicIds.map((id) => {
            const Icon = topicIcon[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => pickTopic(id)}
                  aria-pressed={topic === id}
                  className="flex min-h-16 w-full items-center gap-4 py-4 text-start transition-colors hover:text-teal-ink"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center text-teal-ink">
                    {Icon ? <Icon className="size-7" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.0625rem] font-medium text-ink-deep">{t.topics[id].title}</span>
                    <span className="block text-[0.9375rem] text-muted">{t.topics[id].sub}</span>
                  </span>
                  <ArrowIcon className="size-5 shrink-0 text-muted flip-rtl" />
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  } else if (step === 1 && topic) {
    body = (
      <>
        <h2 ref={headingRef} tabIndex={-1} className={h2}>
          {t.topics[topic].title}
        </h2>
        <p className="mt-1 text-base text-muted">{t.detailsTitle}</p>
        <div className="mt-6 space-y-5">{topicFields[topic].map(renderField)}</div>
      </>
    );
  } else if (step === 2) {
    body = (
      <>
        <h2 ref={headingRef} tabIndex={-1} className={h2}>
          {t.yourDetails}
        </h2>
        <p id="cf-hint" className="mt-1 text-base text-muted">
          {t.hint}
        </p>
        <div className="mt-6 space-y-5">{(["name", "org", "phone", "email"] as const).map(contactField)}</div>
      </>
    );
  } else if (step === 3 && topic) {
    const d = detailRows(topic, values, t);
    const c = contactRows(values, t);
    body = (
      <>
        <h2 ref={headingRef} tabIndex={-1} className={h2}>
          {t.review}
        </h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {group(t.steps[0], 0, <p className="text-base text-ink">{t.topics[topic].title}</p>)}
          {d.length > 0 && group(t.steps[1], 1, <dl className="mt-1 flex flex-col gap-3">{d.map(reviewRow)}</dl>)}
          {group(t.steps[2], 2, <dl className="mt-1 flex flex-col gap-3">{c.map(reviewRow)}</dl>)}
        </div>
        {(status === "error" || status === "nokey") && (
          <p role="alert" className="mt-5 rounded-sm bg-[#fbeeea] px-4 py-3 text-base text-err">
            {status === "nokey" ? t.errNoKey : t.err}
          </p>
        )}
      </>
    );
  }

  return (
    <section className="container-site py-14 md:py-24">
      <div className="mx-auto max-w-[680px]">
        <h1 className="text-balance text-[2rem] font-semibold text-ink-deep md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted">{t.lead}</p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-10 rounded-lg border border-line bg-white p-5 sm:p-8"
        >
          <p className="sr-only" role="status" aria-live="polite">
            {done ? t.ok : live}
          </p>

          {!done && (
            <div className="mb-8" aria-hidden="true">
              <p className="mb-3 text-base font-medium text-ink-deep sm:hidden">
                <span className="tabular-nums">{n(step + 1)}</span> / <span className="tabular-nums">{n(TOTAL)}</span>{" "}
                {label}
              </p>
              <ol className="grid grid-cols-4 gap-2">
                {t.steps.map((s, i) => (
                  <li key={s}>
                    <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-teal-ink" : "bg-line"}`} />
                    <span
                      className={`mt-2 hidden text-sm sm:block ${i === step ? "font-medium text-ink-deep" : "text-muted"}`}
                    >
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div ref={panelRef}>{body}</div>

          {!done && step > 0 && step < 3 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => go(step - 1)} className={btnGhost}>
                <ArrowIcon back className="size-5 flip-rtl" />
                {t.back}
              </button>
              <button type="submit" className={btnPrimary}>
                {t.next}
                <ArrowIcon className="size-5 flip-rtl" />
              </button>
            </div>
          )}

          {!done && step === 3 && (
            <>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button type="submit" disabled={status === "sending"} className={`${btnPrimary} w-full sm:w-auto`}>
                  {status === "sending" && <Spinner />}
                  {status === "sending" ? t.sending : t.send}
                </button>
                {site.showWhatsApp && (
                  <a href={waHref} target="_blank" rel="noopener" className={`${btnGhost} w-full sm:w-auto`}>
                    <WhatsAppIcon className="size-5" />
                    {t.wa}
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6">
                <button type="button" onClick={() => go(2)} className={textLink}>
                  <ArrowIcon back className="size-5 flip-rtl" />
                  {t.back}
                </button>
                <button type="button" onClick={reset} className={textLink}>
                  {t.startOver}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
