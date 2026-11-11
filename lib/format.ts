// Safe to use from both server and client components.
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS.charAt(Number(d)));
}

export function toLatinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
}

export function localizeDigits(input: string | number, locale: string): string {
  return locale === "fa" ? toPersianDigits(input) : String(input);
}

/** Swap the locale segment of a path: /fa/contact/ -> /en/contact/ */
export function switchLocalePath(pathname: string, to: string): string {
  const parts = pathname.split("/");
  if (parts[1] === "fa" || parts[1] === "en") parts[1] = to;
  else parts.splice(1, 0, to);
  const out = parts.join("/") || `/${to}/`;
  return out.endsWith("/") ? out : `${out}/`;
}
