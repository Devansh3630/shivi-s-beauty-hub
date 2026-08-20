export const SHOP = {
  name: "Shivi Parlour & Boutique",
  address: "Kabir Pur, Sultanpur Road, Lucknow, UP 226501",
  street: "Kabir Pur, Sultanpur Road",
  city: "Lucknow",
  region: "UP",
  postalCode: "226501",
  lat: 26.7606,
  lng: 81.0026,
  phone: "7897179580",
  phoneIntl: "+917897179580",
  hours: "10:00 AM – 9:00 PM (Open Daily)",
  // UPI ID used for online booking payments. Update if the shop uses a different handle.
  upiId: "7897179580@ybl",
  rating: 5.0,
  reviewCount: 12,
  mapsEmbed:
    "https://www.google.com/maps?q=Shivi+Parlour+%26+Boutique+Kabir+Pur+Sultanpur+Road+Lucknow+226501&output=embed",
  mapsLink:
    "https://share.google/fcOCPgscJ9npXDIzy",
  googleMapsListing: "https://share.google/fcOCPgscJ9npXDIzy",
  directionsLink:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Shivi Parlour & Boutique, Kabir Pur, Sultanpur Road, Lucknow, UP 226501"),
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

export function upiPayLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: SHOP.upiId,
    pn: SHOP.name,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export const GOOGLE_REVIEWS = [
  {
    author: "Priya Verma",
    rating: 5,
    date: "2 weeks ago",
    text: "Got my bridal makeup done here and it lasted the whole function. Very neat work and the staff is so polite.",
  },
  {
    author: "Anjali Singh",
    rating: 5,
    date: "1 month ago",
    text: "Best parlour on Sultanpur Road. Facial and threading are always perfect, and the cosmetics collection is genuine.",
  },
  {
    author: "Ritu Yadav",
    rating: 5,
    date: "1 month ago",
    text: "The tailor came home for measurements and my suit fitting was spot on. Very convenient service.",
  },
  {
    author: "Neha Gupta",
    rating: 5,
    date: "2 months ago",
    text: "Clean, calm and reasonably priced. Booked a slot online and there was no waiting at all.",
  },
] as const;

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: SHOP.name,
    description:
      "Beauty parlour, cosmetics store and boutique tailoring in Kabir Pur, Sultanpur Road, Lucknow. Parlour appointments, cosmetics and home tailor visits.",
    image: "https://lovable.dev/opengraph-image-p98pqg.png",
    telephone: SHOP.phoneIntl,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP.street,
      addressLocality: SHOP.city,
      addressRegion: SHOP.region,
      postalCode: SHOP.postalCode,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: SHOP.lat, longitude: SHOP.lng },
    hasMap: SHOP.googleMapsListing,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "21:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SHOP.rating,
      reviewCount: SHOP.reviewCount,
    },
    areaServed: { "@type": "City", name: "Lucknow" },
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI",
  };
}
