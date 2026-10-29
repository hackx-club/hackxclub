// Single source for contact details. Replace PHONE with the real number (country code, no plus).
export const PHONE = "91XXXXXXXXXX";
export const REGISTER_TEXT = "Hi HackX, I want to register for HackX 1.0";
export const whatsappUrl = (text = REGISTER_TEXT) =>
  `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

export const site = {
  name: "HackX",
  event: "HackX 1.0",
  domain: "hackx.club",
  url: "https://hackx.club",
  date: "2026-12-28",
};
