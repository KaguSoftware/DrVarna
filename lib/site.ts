// PLACEHOLDERS: replace the email and WhatsApp number with the real ones before launch.
export const site = {
  phone: { display: "+98 21 0000 0000", href: "tel:+982100000000" },
  email: "info@example.com",
  whatsapp: "989000000000", // international format, digits only, used for wa.me links
  web3formsKey: process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "",
  isPlaceholder: true,

  // Feature switches. The company has no WhatsApp or phone line yet.
  // Flip to true to bring them back (footer row and the contact form button). Nothing else to change.
  showWhatsApp: false,
  showPhone: false,
};
