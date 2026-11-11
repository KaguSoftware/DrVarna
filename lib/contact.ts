import type { Dictionary } from "@/lib/i18n";
import { toLatinDigits } from "@/lib/format";

export type ContactT = Dictionary["contact"];
export type TopicId = keyof ContactT["topics"];
export type FieldKey = keyof ContactT["fields"];
export type OptionKey = keyof ContactT["options"];
export type Values = Partial<Record<FieldKey, string>>;
export type Errors = Partial<Record<FieldKey, string>>;

export type FieldDef = {
  key: FieldKey;
  kind: "text" | "textarea" | "choice";
  required?: boolean;
  options?: OptionKey[];
  inputMode?: "text" | "numeric" | "decimal";
};

export const topicIds: TopicId[] = ["import", "api", "supplier", "other"];

const note: FieldDef = { key: "note", kind: "textarea" };

export const topicFields: Record<TopicId, FieldDef[]> = {
  import: [
    { key: "products", kind: "text", required: true },
    { key: "quantity", kind: "text" },
    { key: "coldChain", kind: "choice", options: ["yes", "no", "notSure"] },
    note,
  ],
  api: [
    { key: "material", kind: "text", required: true },
    { key: "grade", kind: "text" },
    { key: "monthlyVolume", kind: "text", inputMode: "decimal" },
    note,
  ],
  supplier: [
    { key: "company", kind: "text", required: true },
    { key: "range", kind: "text" },
    { key: "gmp", kind: "choice", options: ["yes", "no"] },
    note,
  ],
  other: [{ key: "message", kind: "textarea", required: true }],
};

export const allDetailKeys: FieldKey[] = Array.from(
  new Set(Object.values(topicFields).flatMap((fs) => fs.map((f) => f.key))),
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function phoneDigits(v: string): string {
  return toLatinDigits(v).replace(/\D/g, "");
}

export function validateDetails(topic: TopicId, values: Values, t: ContactT): Errors {
  const errors: Errors = {};
  for (const f of topicFields[topic]) {
    if (f.required && !(values[f.key] ?? "").trim()) errors[f.key] = t.v.required;
  }
  return errors;
}

/** Field order matches the DOM order so the first key is the first invalid field. */
export const contactKeys: FieldKey[] = ["name", "org", "phone", "email"];

export function validateContact(values: Values, t: ContactT): Errors {
  const errors: Errors = {};
  const name = (values.name ?? "").trim();
  const phone = (values.phone ?? "").trim();
  const email = (values.email ?? "").trim();
  if (!name) errors.name = t.v.name;
  if (!phone && !email) errors.phone = t.v.contact;
  if (phone) {
    const n = phoneDigits(phone).length;
    if (n < 7 || n > 15) errors.phone = t.v.phone;
  }
  if (email && !EMAIL_RE.test(email)) errors.email = t.v.email;
  return errors;
}

export function displayValue(key: FieldKey, values: Values, t: ContactT): string {
  const raw = (values[key] ?? "").trim();
  if (!raw) return "";
  if (key === "coldChain" || key === "gmp") {
    return t.options[raw as OptionKey] ?? raw;
  }
  return raw;
}

export type Row = { key: FieldKey; label: string; value: string };

function rowsFor(keys: FieldKey[], values: Values, t: ContactT): Row[] {
  return keys
    .map((key) => ({ key, label: t.fields[key], value: displayValue(key, values, t) }))
    .filter((r) => r.value);
}

export function detailRows(topic: TopicId, values: Values, t: ContactT): Row[] {
  return rowsFor(
    topicFields[topic].map((f) => f.key),
    values,
    t,
  );
}

export function contactRows(values: Values, t: ContactT): Row[] {
  return rowsFor(contactKeys, values, t);
}

function allLines(topic: TopicId, values: Values, t: ContactT): string[] {
  return [...detailRows(topic, values, t), ...contactRows(values, t)].map(
    (r) => `${r.label}: ${r.value}`,
  );
}

export function buildWhatsAppText(t: ContactT, topic: TopicId | null, values: Values): string {
  if (!topic) return t.waHi.trim();
  const head = `${t.waHi}${t.topics[topic].title}`;
  return [head, ...allLines(topic, values, t)].join("\n");
}

export function buildPayload(
  t: ContactT,
  accessKey: string,
  topic: TopicId,
  values: Values,
): Record<string, string> {
  const payload: Record<string, string> = {
    access_key: accessKey,
    subject: t.topics[topic].title,
    from_name: (values.name ?? "").trim(),
    [t.topic]: t.topics[topic].title,
  };
  for (const r of [...detailRows(topic, values, t), ...contactRows(values, t)]) {
    payload[r.label] = r.value;
  }
  const email = (values.email ?? "").trim();
  if (email) payload.email = email;
  return payload;
}
