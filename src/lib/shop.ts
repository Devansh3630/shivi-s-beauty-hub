export const SHOP = {
  name: "Shivi Parlour & Boutique",
  address: "Kabir Pur, Sultanpur Road, Lucknow, UP 226501",
  phone: "7897179580",
  phoneIntl: "+917897179580",
  hours: "10:00 AM – 9:00 PM (Open Daily)",
  mapsEmbed:
    "https://www.google.com/maps?q=Shivi+Parlour+%26+Boutique+Kabir+Pur+Sultanpur+Road+Lucknow+226501&output=embed",
  mapsLink:
    "https://share.google/fcOCPgscJ9npXDIzy",
  googleMapsListing: "https://share.google/fcOCPgscJ9npXDIzy",
} as const;

export const TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
] as const;

export const OUTFIT_TYPES = ["Blouses", "Suits", "Dresses", "Lehenga", "Other"] as const;

export function inr(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${SHOP.phoneIntl.replace("+", "")}?text=${encodeURIComponent(message)}`;
}
