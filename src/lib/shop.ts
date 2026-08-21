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
  mapsLink: "https://share.google/fcOCPgscJ9npXDIzy",
  googleMapsListing: "https://share.google/fcOCPgscJ9npXDIzy",
  directionsLink:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Shivi Parlour & Boutique, Kabir Pur, Sultanpur Road, Lucknow, UP 226501"),
} as const;

export const CHAIR_RESOURCES = [
  { id: "Chair 1", name: "Chair 1", description: "Hair Styling & General Workstation" },
  { id: "Chair 2", name: "Chair 2", description: "Makeup & Beauty Workstation" },
] as const;

export type HaircutStyle = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  durationMinutes: number;
};

export const HAIRCUT_SUB_OPTIONS: HaircutStyle[] = [
  {
    id: "v-shape",
    name: "V-Shape Haircut",
    description:
      "Sharp and stylish V-angled layers at the back for a dramatic cascading silhouette.",
    badge: "Popular",
    durationMinutes: 45,
  },
  {
    id: "u-shape",
    name: "U-Shape Haircut",
    description:
      "Classic softly rounded bottom curve giving full volume, clean edges and natural bounce.",
    durationMinutes: 35,
  },
  {
    id: "layer-cut",
    name: "Layer Cut",
    description:
      "Multi-tiered dynamic layers adding volume, seamless texture and effortless movement.",
    badge: "Trending",
    durationMinutes: 45,
  },
  {
    id: "step-cut",
    name: "Step Cut",
    description:
      "Prominent structured step tiers that create noticeable bounce and separated depth.",
    durationMinutes: 45,
  },
  {
    id: "bob-cut",
    name: "Bob Cut",
    description:
      "Chic chin or shoulder-grazing sleek, textured, or blunt bob tailored to face shape.",
    badge: "Classic",
    durationMinutes: 40,
  },
  {
    id: "feather-cut",
    name: "Feather Cut",
    description: "Lightweight outward/inward feathered flicks that delicately frame the face.",
    durationMinutes: 45,
  },
  {
    id: "custom",
    name: "Other / Custom Haircut",
    description:
      "Curtain bangs, butterfly cut, wolf cut, french fringe, trim, or personalized styling.",
    badge: "Custom",
    durationMinutes: 45,
  },
];

export type WaxingServiceOption = {
  id: string;
  name: string;
  shortName: string;
  category: "Waxing";
  price: number;
  durationMinutes: number;
  description: string;
  badge?: string;
  isCustom?: boolean;
};

export const WAXING_SUB_OPTIONS: WaxingServiceOption[] = [
  {
    id: "wax-full-arms",
    name: "Full Arms Waxing",
    shortName: "Full Arms",
    category: "Waxing",
    price: 250,
    durationMinutes: 25,
    description:
      "Complete hair removal from shoulder to fingertips with gentle, skin-safe wax and cooling aloe soothing gel.",
    badge: "Popular",
  },
  {
    id: "wax-half-arms",
    name: "Half Arms Waxing",
    shortName: "Half Arms",
    category: "Waxing",
    price: 150,
    durationMinutes: 15,
    description:
      "Elbow to wrist waxing for clean, silky smooth forearms with quick post-wax calm lotion.",
  },
  {
    id: "wax-full-legs",
    name: "Full Legs Waxing",
    shortName: "Full Legs",
    category: "Waxing",
    price: 450,
    durationMinutes: 35,
    description:
      "Thorough waxing from upper thighs down to ankles, leaving skin velvety soft, exfoliated and hair-free.",
    badge: "Popular",
  },
  {
    id: "wax-half-legs",
    name: "Half Legs Waxing",
    shortName: "Half Legs",
    category: "Waxing",
    price: 250,
    durationMinutes: 20,
    description: "Knees to ankles quick, precise waxing session with cooling moisturiser massage.",
  },
  {
    id: "wax-underarms",
    name: "Underarms Waxing",
    shortName: "Underarms",
    category: "Waxing",
    price: 80,
    durationMinutes: 10,
    description:
      "Gentle strip waxing to remove stubble cleanly while preventing ingrown hairs and darkening.",
  },
  {
    id: "wax-full-body",
    name: "Full Body Waxing",
    shortName: "Full Body",
    category: "Waxing",
    price: 1499,
    durationMinutes: 90,
    description:
      "Comprehensive package including Full Arms, Full Legs, Underarms, Back and Stomach with premium salon-grade wax.",
    badge: "Best Value",
  },
  {
    id: "wax-other-custom",
    name: "Other Available Waxing Services",
    shortName: "Other / Custom",
    category: "Waxing",
    price: 200,
    durationMinutes: 20,
    description:
      "Bikini line, stomach wax, back wax, facial wax (upper lip, chin, forehead, sides), or custom customized requests.",
    badge: "Custom",
    isCustom: true,
  },
];

export type HandsFeetServiceOption = {
  id: string;
  name: string;
  shortName: string;
  category: "Hands & Feet";
  price: number;
  durationMinutes: number;
  description: string;
  badge?: string;
};

export const HANDS_FEET_SUB_OPTIONS: HandsFeetServiceOption[] = [
  {
    id: "hf-manicure",
    name: "Manicure",
    shortName: "Manicure",
    category: "Hands & Feet",
    price: 399,
    durationMinutes: 35,
    description:
      "Complete hand care including nail trimming, shaping, cuticle nourishment, gentle exfoliating scrub, relaxing hand massage and smooth buff & shine.",
    badge: "Popular",
  },
  {
    id: "hf-pedicure",
    name: "Pedicure",
    shortName: "Pedicure",
    category: "Hands & Feet",
    price: 549,
    durationMinutes: 45,
    description:
      "Therapeutic warm foot soak, calloused heel softening, dead skin exfoliation with organic scrub, relaxing foot massage, cuticle grooming and nail polish.",
    badge: "Relaxing",
  },
  {
    id: "hf-deluxe-pedicure",
    name: "Deluxe Pedicure & Foot Spa",
    shortName: "Deluxe Pedicure",
    category: "Hands & Feet",
    price: 799,
    durationMinutes: 60,
    description:
      "Luxury aromatherapy foot soak, intensive calloused skin removal, peppermint sea-salt scrub, deep hydration mask, and extended 20-min pressure-point massage.",
    badge: "Spa Special",
  },
  {
    id: "hf-nail-art",
    name: "Nail Art & Gel Polish",
    shortName: "Nail Art",
    category: "Hands & Feet",
    price: 299,
    durationMinutes: 30,
    description:
      "Trendy custom nail art accents, glitter ombré, French tips or durable gel polish application for long-lasting high shine.",
  },
];

export type DefaultParlourService = {
  id: string;
  category: string;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
};

export const DEFAULT_PARLOUR_CATEGORIES = [
  "Hair",
  "Facials",
  "Threading",
  "Skin",
  "Makeup",
  "Waxing",
  "Hands & Feet",
] as const;

export const DEFAULT_PARLOUR_SERVICES: DefaultParlourService[] = [
  // Hair
  {
    id: "svc-hair-1",
    category: "Hair",
    name: "Hair Cut & Styling",
    price: 350,
    duration_minutes: 45,
    description: "Professional haircut tailored to your face shape with wash, blow dry & styling.",
  },
  {
    id: "svc-hair-2",
    category: "Hair",
    name: "Hair Spa Treatment",
    price: 900,
    duration_minutes: 60,
    description: "Deep nourishing hair spa with scalp massage, steam, and intense gloss mask.",
  },
  {
    id: "svc-hair-3",
    category: "Hair",
    name: "Global Hair Colour",
    price: 2200,
    duration_minutes: 120,
    description: "Full head ammonia-free hair coloring with rich tone and radiant shine.",
  },
  {
    id: "svc-hair-4",
    category: "Hair",
    name: "Keratin Smoothening",
    price: 3500,
    duration_minutes: 150,
    description: "Frizz-free, silky straight and manageable hair treatment lasting up to 6 months.",
  },
  {
    id: "svc-hair-5",
    category: "Hair",
    name: "Hair Wash & Blow Dry",
    price: 300,
    duration_minutes: 30,
    description:
      "Clarifying wash followed by professional blowout styling (straight or outward curl).",
  },
  {
    id: "svc-hair-6",
    category: "Hair",
    name: "Hair Straightening / Rebonding",
    price: 4000,
    duration_minutes: 180,
    description: "Permanent sleek straight hair transformation with damage protection serum.",
  },

  // Facials
  {
    id: "svc-facial-1",
    category: "Facials",
    name: "Gold Facial",
    price: 1100,
    duration_minutes: 60,
    description: "24K gold dust enriched facial giving instant bridal radiance and firming effect.",
  },
  {
    id: "svc-facial-2",
    category: "Facials",
    name: "Fruit Facial",
    price: 600,
    duration_minutes: 45,
    description:
      "Natural fruit enzyme extracts suitable for sensitive skin, deeply nourishing & refreshing.",
  },
  {
    id: "svc-facial-3",
    category: "Facials",
    name: "Hydra Glow Facial",
    price: 1800,
    duration_minutes: 75,
    description:
      "Intense hydration and pore cleansing treatment delivering a glass-skin dewy finish.",
  },
  {
    id: "svc-facial-4",
    category: "Facials",
    name: "Diamond Facial",
    price: 1500,
    duration_minutes: 60,
    description:
      "Diamond ash micro-dermabrasion action for youthful firmness and dark spot reduction.",
  },
  {
    id: "svc-facial-5",
    category: "Facials",
    name: "O3+ Bridal Glow Facial",
    price: 2200,
    duration_minutes: 75,
    description:
      "Premium brightening & whitening professional treatment for weddings and celebrations.",
  },
  {
    id: "svc-facial-6",
    category: "Facials",
    name: "Anti-Tan & Brightening Facial",
    price: 950,
    duration_minutes: 50,
    description: "Removes stubborn sun tanning, pigmentation, and evens out dull skin tone.",
  },
  {
    id: "svc-facial-7",
    category: "Facials",
    name: "Papaya Clean Up",
    price: 450,
    duration_minutes: 35,
    description: "Quick pore unclogging, blackhead extraction and soothing fruit pack.",
  },

  // Threading
  {
    id: "svc-thread-1",
    category: "Threading",
    name: "Eyebrow Threading",
    price: 50,
    duration_minutes: 10,
    description: "Precision eyebrow shaping matching your natural arch with soothing aloe gel.",
  },
  {
    id: "svc-thread-2",
    category: "Threading",
    name: "Upper Lip & Chin",
    price: 60,
    duration_minutes: 10,
    description: "Gentle removal of fine upper lip and chin fuzz for a flawless base.",
  },
  {
    id: "svc-thread-3",
    category: "Threading",
    name: "Forehead Threading",
    price: 40,
    duration_minutes: 10,
    description: "Neat hairline clean up and forehead threading.",
  },
  {
    id: "svc-thread-4",
    category: "Threading",
    name: "Full Face Threading",
    price: 250,
    duration_minutes: 25,
    description:
      "Complete facial threading (brows, upper lip, chin, forehead and sides) with calming lotion.",
  },

  // Skin
  {
    id: "svc-skin-1",
    category: "Skin",
    name: "Skin Polishing",
    price: 1200,
    duration_minutes: 60,
    description: "Full body or face micro-crystal exfoliation for smooth, baby-soft texture.",
  },
  {
    id: "svc-skin-2",
    category: "Skin",
    name: "De-Tan Treatment",
    price: 800,
    duration_minutes: 45,
    description: "Effective sun tan reversal pack with lactic acid & kojic brightening actives.",
  },
  {
    id: "svc-skin-3",
    category: "Skin",
    name: "Anti-Acne Clean Up",
    price: 700,
    duration_minutes: 40,
    description: "Tea tree and neem therapeutic extraction preventing breakouts and excess oil.",
  },
  {
    id: "svc-skin-4",
    category: "Skin",
    name: "Full Face Bleach",
    price: 350,
    duration_minutes: 30,
    description: "Gentle gold or herbal bleach to lighten facial hair and brighten complexion.",
  },
  {
    id: "svc-skin-5",
    category: "Skin",
    name: "Oxy Bleach & Glow Pack",
    price: 450,
    duration_minutes: 35,
    description: "Oxygen infused bleach with radiant glow pack for instant luminosity.",
  },

  // Makeup
  {
    id: "svc-mu-1",
    category: "Makeup",
    name: "Party Makeup",
    price: 2500,
    duration_minutes: 75,
    description: "Glamorous evening makeup with lashes, contouring and hairstyling included.",
  },
  {
    id: "svc-mu-2",
    category: "Makeup",
    name: "Bridal Makeup Package",
    price: 12000,
    duration_minutes: 180,
    description:
      "Complete HD/Airbrush bridal transformation including hair styling, draping, lashes & touch-up kit.",
  },
  {
    id: "svc-mu-3",
    category: "Makeup",
    name: "Engagement Makeup",
    price: 6000,
    duration_minutes: 120,
    description: "Soft romantic HD makeup look with elegant floral or modern hair styling.",
  },
  {
    id: "svc-mu-4",
    category: "Makeup",
    name: "HD Reception Makeup",
    price: 5000,
    duration_minutes: 90,
    description: "High-definition camera ready finish with long-lasting waterproof formula.",
  },
  {
    id: "svc-mu-5",
    category: "Makeup",
    name: "Eye Makeup & Lashes",
    price: 800,
    duration_minutes: 30,
    description: "Smokey, cut-crease, or glitter eye makeup with dramatic 3D false lashes.",
  },
  {
    id: "svc-mu-6",
    category: "Makeup",
    name: "Saree Draping & Styling",
    price: 400,
    duration_minutes: 20,
    description: "Flawless pleated saree, lehenga dupatta, or can-can setting.",
  },

  // Waxing
  ...WAXING_SUB_OPTIONS.map((w) => ({
    id: w.id,
    category: "Waxing",
    name: w.name,
    price: w.price,
    duration_minutes: w.durationMinutes,
    description: w.description,
  })),

  // Hands & Feet
  ...HANDS_FEET_SUB_OPTIONS.map((h) => ({
    id: h.id,
    category: "Hands & Feet",
    name: h.name,
    price: h.price,
    duration_minutes: h.durationMinutes,
    description: h.description,
  })),
];

export type ChairId = (typeof CHAIR_RESOURCES)[number]["id"];
export const TOTAL_CHAIRS = CHAIR_RESOURCES.length; // 2 chairs

export const SHOP_OPEN_HOUR = 10; // 10:00 AM
export const SHOP_CLOSE_HOUR = 21; // 09:00 PM
export const SHOP_OPEN_MINUTES = SHOP_OPEN_HOUR * 60; // 600
export const SHOP_CLOSE_MINUTES = SHOP_CLOSE_HOUR * 60; // 1260

export const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/**
 * Converts a time string like "10:00 AM" or "02:30 PM" or "14:30" to minutes from midnight (0..1439).
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();

  const is12Hour = clean.includes("AM") || clean.includes("PM");
  if (is12Hour) {
    const isPM = clean.includes("PM");
    const parts = clean.replace(/[AP]M/, "").trim().split(":");
    let hours = parseInt(parts[0] ?? "0", 10);
    const minutes = parseInt(parts[1] ?? "0", 10);
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const [h, m] = clean.split(":").map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight into 12-hour formatted time, e.g. 645 -> "10:45 AM"
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.floor(totalMinutes)));
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedHours = hours12.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${paddedHours}:${paddedMinutes} ${period}`;
}

/**
 * Computes end time string based on start slot and duration.
 */
export function calculateEndTime(startSlot: string, durationMinutes: number): string {
  const startMin = timeToMinutes(startSlot);
  const endMin = startMin + Math.max(1, durationMinutes);
  return minutesToTime(endMin);
}

/**
 * Checks whether two half-open intervals [startA, startA + durA) and [startB, startB + durB) overlap.
 */
export function doesIntervalOverlap(
  startA: number,
  durA: number,
  startB: number,
  durB: number,
): boolean {
  const endA = startA + durA;
  const endB = startB + durB;
  return startA < endB && startB < endA;
}

export type BookedSlotItem = {
  id?: string;
  chair_id?: string | null;
  time_slot: string;
  duration_minutes?: number | null;
  status?: string;
};

export type SlotAvailability = {
  slot: string;
  availableChairs: string[];
  occupiedChairs: string[];
  totalChairs: number;
  availableCount: number;
  isAvailable: boolean;
  suggestedChair: string | null;
  endTime: string;
  exceedsClosingTime: boolean;
};

/**
 * Calculates real availability for a specific time slot & duration against booked appointments on that date.
 */
export function calculateSlotAvailability(
  slot: string,
  durationMinutes: number,
  existingBookings: BookedSlotItem[],
): SlotAvailability {
  const startMin = timeToMinutes(slot);
  const duration = Math.max(1, durationMinutes || 30);
  const endMin = startMin + duration;
  const endTime = minutesToTime(endMin);
  const exceedsClosingTime = endMin > SHOP_CLOSE_MINUTES;

  if (exceedsClosingTime) {
    return {
      slot,
      availableChairs: [],
      occupiedChairs: CHAIR_RESOURCES.map((c) => c.id),
      totalChairs: TOTAL_CHAIRS,
      availableCount: 0,
      isAvailable: false,
      suggestedChair: null,
      endTime,
      exceedsClosingTime: true,
    };
  }

  // Active bookings (ignore cancelled)
  const activeBookings = existingBookings.filter(
    (b) => (b.status ?? "").toLowerCase() !== "cancelled",
  );

  const availableChairs: string[] = [];
  const occupiedChairs: string[] = [];

  // Track chair usage count for intelligent workload balancing
  const chairBookedMinutes: Record<string, number> = { "Chair 1": 0, "Chair 2": 0 };
  for (const b of activeBookings) {
    const chair = b.chair_id || "Chair 1";
    chairBookedMinutes[chair] = (chairBookedMinutes[chair] || 0) + (b.duration_minutes || 30);
  }

  for (const resource of CHAIR_RESOURCES) {
    const chairId = resource.id;
    // Check if this chair has any overlapping booking
    const hasConflict = activeBookings.some((b) => {
      const bChair = b.chair_id || "Chair 1";
      if (bChair !== chairId) return false;
      const bStart = timeToMinutes(b.time_slot);
      const bDur = b.duration_minutes || 30;
      return doesIntervalOverlap(startMin, duration, bStart, bDur);
    });

    if (hasConflict) {
      occupiedChairs.push(chairId);
    } else {
      availableChairs.push(chairId);
    }
  }

  let suggestedChair: string | null = null;
  if (availableChairs.length === 1) {
    suggestedChair = availableChairs[0] ?? null;
  } else if (availableChairs.length > 1) {
    // Balance workload: pick chair with fewer booked minutes, default to Chair 1
    const minutes1 = chairBookedMinutes["Chair 1"] ?? 0;
    const minutes2 = chairBookedMinutes["Chair 2"] ?? 0;
    suggestedChair = minutes2 < minutes1 ? "Chair 2" : "Chair 1";
  }

  return {
    slot,
    availableChairs,
    occupiedChairs,
    totalChairs: TOTAL_CHAIRS,
    availableCount: availableChairs.length,
    isAvailable: availableChairs.length > 0,
    suggestedChair,
    endTime,
    exceedsClosingTime: false,
  };
}

export type BoutiqueServiceCategory =
  | "All"
  | "Stitching Services"
  | "Designing & Styling"
  | "Bridal & Party Wear"
  | "Alterations & Fitting";

export type BoutiqueServiceItem = {
  id: string;
  name: string;
  category: Exclude<BoutiqueServiceCategory, "All">;
  price: number;
  isComplimentary?: boolean;
  priceNote?: string;
  turnaround: string;
  description: string;
  features: string[];
  badge?: string;
  imageUrl: string;
  popularStyles?: string[];
};

export const BOUTIQUE_SERVICES: BoutiqueServiceItem[] = [
  {
    id: "boutique-suit-stitching",
    name: "Suit Stitching",
    category: "Stitching Services",
    price: 799,
    turnaround: "3–4 Days",
    description:
      "Expert stitching for Salwar Suits, Straight Pant Suits, Palazzo Sets, Afghani Suits, and Patiala Suits with perfect shoulder & bust fitting.",
    features: [
      "Interlock & lining included",
      "Custom neck & bottom styling",
      "Trial & fit adjustments",
    ],
    badge: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1610030469668-8e9f34d2e5b6?w=600&q=80",
    popularStyles: [
      "Straight Pant Suit",
      "Anarkali Suit",
      "Palazzo Suit",
      "Patiala Salwar",
      "Afghani Suit",
    ],
  },
  {
    id: "boutique-kurti-stitching",
    name: "Kurti Stitching",
    category: "Stitching Services",
    price: 449,
    turnaround: "2–3 Days",
    description:
      "Daily wear and designer kurti stitching — straight cut, A-line, Alia cut, Nayra cut, kaftan, and umbrella flare kurtis.",
    features: [
      "Neat side slits & piping",
      "Multiple sleeve length options",
      "Comfortable everyday fit",
    ],
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    popularStyles: [
      "Straight Cut",
      "Alia Cut",
      "Nayra Cut Flare",
      "A-Line Kurti",
      "Short Peplum Kurti",
    ],
  },
  {
    id: "boutique-blouse-stitching",
    name: "Blouse Stitching",
    category: "Stitching Services",
    price: 499,
    turnaround: "2–3 Days",
    description:
      "Precision tailored saree blouses — Princess cut, Padded cups, Katori cut, Back open, Side zip, and classic 4-tucks with zero shoulder drop.",
    features: [
      "High-grade breathable padding",
      "Zero shoulder drop guarantee",
      "Custom neck depths",
    ],
    badge: "Signature",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
    popularStyles: [
      "Princess Cut Padded",
      "Katori Blouse",
      "Boat Neck",
      "Deep Back with Dori",
      "Collar Neck",
    ],
  },
  {
    id: "boutique-lehenga-stitching",
    name: "Lehenga Stitching",
    category: "Stitching Services",
    price: 1799,
    turnaround: "4–6 Days",
    description:
      "Complete lehenga tailoring — heavy flare kalis, double can-can net attachment, custom stitched choli/blouse, and designer latkans & dupatta edging.",
    features: [
      "Heavy can-can flare shaping",
      "Canvas belt with zip & dori",
      "Custom choli styling",
    ],
    badge: "Festive Pick",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
    popularStyles: [
      "Bridal Can-Can Lehenga",
      "Semi-Stitched Fitting",
      "Kali/Panel Lehenga",
      "Circular Flare",
    ],
  },
  {
    id: "boutique-dress-stitching",
    name: "Dress Stitching",
    category: "Stitching Services",
    price: 1199,
    turnaround: "3–5 Days",
    description:
      "Western and fusion one-piece dress tailoring — flared midi dresses, wrap dresses, maxis, bodycon fits, and co-ord sets crafted to your silhouette.",
    features: ["Smooth inner lining", "Concealed zippers", "Bespoke pattern drafting"],
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
    popularStyles: [
      "Flared Maxi Dress",
      "Indo-Western Fusion Gown",
      "Fit & Flare Midi",
      "Tiered Summer Dress",
    ],
  },
  {
    id: "boutique-saree-blouse-designing",
    name: "Saree Blouse Designing",
    category: "Designing & Styling",
    price: 899,
    turnaround: "3–4 Days",
    description:
      "High-fashion saree blouse design transformations: Sabyasachi deep-V cuts, halter necks, corset-style blouses, backless silhouettes, and illusion net necks.",
    features: [
      "Designer pattern illustration",
      "Custom back tie-ups & latkans",
      "Premium finish & edging",
    ],
    badge: "Trending",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    popularStyles: [
      "Sabyasachi Plunging Neck",
      "Corset Blouse",
      "Backless Halter",
      "Sheer Illusion Net",
    ],
  },
  {
    id: "boutique-alterations-fittings",
    name: "Alterations & Fittings",
    category: "Alterations & Fitting",
    price: 149,
    turnaround: "Same Day / 24h",
    description:
      "Express alterations for ready-made & old garments — bust tightening, waist tapering, length shortening, zipper replacements, hook-eye repairs, and sleeve attachment.",
    features: ["Quick turnaround", "Clean internal finish", "Original border & hem retention"],
    badge: "Quick Fix",
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
    popularStyles: [
      "Bust & Waist Tapering",
      "Kurti Length Alteration",
      "Zip Replacement",
      "Sleeve Attachment",
    ],
  },
  {
    id: "boutique-custom-dress-designing",
    name: "Custom Dress Designing",
    category: "Designing & Styling",
    price: 2499,
    turnaround: "5–7 Days",
    description:
      "Full bespoke garment designing from scratch. Share your reference Pinterest/Instagram photos or work with our boutique stylist to design your dream outfit.",
    features: [
      "Personal styling session",
      "Fabric & color consultation",
      "Multiple fittings till perfection",
    ],
    badge: "Bespoke",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    popularStyles: [
      "Pinterest Recreations",
      "Red Carpet Gowns",
      "Indo-Western Co-Ords",
      "Concept Drapes",
    ],
  },
  {
    id: "boutique-bridal-party-wear",
    name: "Bridal & Party Wear Designing",
    category: "Bridal & Party Wear",
    price: 4499,
    turnaround: "7–10 Days",
    description:
      "Opulent bridal, sangeet, and reception couture — heavy embroidered wedding lehengas, reception sharara sets, reception gowns, and bridesmaid matching ensembles.",
    features: [
      "Grand flare construction",
      "Double dupatta draping prep",
      "VIP master tailor home visits",
    ],
    badge: "Luxury",
    imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&q=80",
    popularStyles: [
      "Bridal Wedding Lehenga",
      "Sangeet Sharara Set",
      "Cocktail Evening Gown",
      "Haldi Peplum Set",
    ],
  },
  {
    id: "boutique-custom-embroidery",
    name: "Custom Embroidery",
    category: "Bridal & Party Wear",
    price: 799,
    turnaround: "4–6 Days",
    description:
      "Handcrafted and machine embroidery additions — Zardozi, Aari needlework, gota patti borders, thread work, mirror embellishments, and custom initials/motifs.",
    features: [
      "Pure metallic threads & zari",
      "Intricate neck & sleeve borders",
      "Custom design stencils",
    ],
    badge: "Handcrafted",
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&q=80",
    popularStyles: [
      "Zardozi Neck Borders",
      "Gota Patti Work",
      "Mirror Work Detailing",
      "Sequins & Beads",
    ],
  },
  {
    id: "boutique-custom-measurements",
    name: "Custom Measurements",
    category: "Alterations & Fitting",
    price: 0,
    isComplimentary: true,
    priceNote: "Free within 5 km",
    turnaround: "At Your Doorstep",
    description:
      "Professional at-home body measurement and posture profiling by our master tailor across Lucknow. Ensures zero fitting issues and flattering silhouettes.",
    features: [
      "18+ point precision body measuring",
      "Fabric pickup from your home",
      "Fitting preference profile saved",
    ],
    badge: "Free Visit",
    imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80",
    popularStyles: [
      "At-Home Master Measuring",
      "Cloth & Sample Pickup",
      "Style Consultation",
      "Trial at Home",
    ],
  },
  {
    id: "boutique-designer-neck-sleeve",
    name: "Designer Neck & Sleeve Designs",
    category: "Designing & Styling",
    price: 349,
    turnaround: "2–3 Days",
    description:
      "Signature neck and sleeve upgrades — sweetheart neckline, keyhole back, potli button plackets, organza puff sleeves, bell sleeves, and scalloped cutout borders.",
    features: [
      "Handmade potli buttons & tassels",
      "Scalloped & lace inserts",
      "Organza & tissue attachments",
    ],
    badge: "Styling Add-on",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
    popularStyles: [
      "Sweetheart Neck",
      "Organza Puff Sleeves",
      "Potli Button Placket",
      "Scallop Cutout Edges",
      "Bell Sleeves",
    ],
  },
];

export const OUTFIT_TYPES = [
  "Suit Stitching",
  "Kurti Stitching",
  "Blouse Stitching",
  "Lehenga Stitching",
  "Dress Stitching",
  "Saree Blouse Designing",
  "Alterations & Fittings",
  "Custom Dress Designing",
  "Bridal & Party Wear Designing",
  "Custom Embroidery",
  "Custom Measurements",
  "Designer Neck & Sleeve Designs",
  "Blouses",
  "Suits",
  "Dresses",
  "Lehenga",
  "Other",
] as const;

export type OutfitType = (typeof OUTFIT_TYPES)[number];

export const BOUTIQUE_ITEM_PRICES: Record<string, number> = {
  "Suit Stitching": 799,
  "Kurti Stitching": 449,
  "Blouse Stitching": 499,
  "Lehenga Stitching": 1799,
  "Dress Stitching": 1199,
  "Saree Blouse Designing": 899,
  "Alterations & Fittings": 149,
  "Custom Dress Designing": 2499,
  "Bridal & Party Wear Designing": 4499,
  "Custom Embroidery": 799,
  "Custom Measurements": 0,
  "Designer Neck & Sleeve Designs": 349,
  Blouses: 499,
  Suits: 799,
  Dresses: 1199,
  Lehenga: 1799,
  Other: 499,
};

export function getBoutiqueItemPrice(name: string): number {
  if (name in BOUTIQUE_ITEM_PRICES) {
    return BOUTIQUE_ITEM_PRICES[name] ?? 499;
  }
  const found = BOUTIQUE_SERVICES.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (found) return found.price;
  return 499; // default estimate for custom items
}

export const FREE_DELIVERY_RADIUS_KM = 5;
export const PER_KM_CHARGE = 15; // ₹15 per km beyond 5 km radius
export const FIRST_ORDER_DISCOUNT_AMOUNT = 100; // ₹100 First-Time User Discount

/**
 * Calculates straight line / driving estimation distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c * 1.25; // Apply ~1.25 routing road-factor for realistic city road travel
  return Math.max(0.5, Math.round(d * 10) / 10);
}

export function calculateDeliveryFee(distanceKm: number): {
  distanceKm: number;
  isFree: boolean;
  extraKm: number;
  perKmRate: number;
  deliveryFee: number;
} {
  const dist = Math.max(0, distanceKm);
  if (dist <= FREE_DELIVERY_RADIUS_KM) {
    return {
      distanceKm: dist,
      isFree: true,
      extraKm: 0,
      perKmRate: PER_KM_CHARGE,
      deliveryFee: 0,
    };
  }
  const extraKm = Math.round((dist - FREE_DELIVERY_RADIUS_KM) * 10) / 10;
  const deliveryFee = Math.round(extraKm * PER_KM_CHARGE);
  return {
    distanceKm: dist,
    isFree: false,
    extraKm,
    perKmRate: PER_KM_CHARGE,
    deliveryFee,
  };
}

export const LUCKNOW_POPULAR_AREAS = [
  { name: "Kabir Pur / Sultanpur Road (Local)", distanceKm: 1 },
  { name: "Ahimamau / Arjunganj", distanceKm: 4 },
  { name: "Shaheed Path / Lulu Mall", distanceKm: 6 },
  { name: "Gomti Nagar Extension / Ekana Stadium", distanceKm: 7.5 },
  { name: "Gomti Nagar / Patrakarpuram", distanceKm: 11 },
  { name: "Alambagh / Telibagh", distanceKm: 9 },
  { name: "Hazratganj / City Centre", distanceKm: 13 },
  { name: "Indira Nagar / Munshipulia", distanceKm: 15 },
  { name: "Charbagh / Railway Station", distanceKm: 12 },
  { name: "Aliganj / Vikas Nagar", distanceKm: 17 },
  { name: "Custom / Enter Distance Manually", distanceKm: 5 },
] as const;

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
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
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

export type AppointmentReceiptData = {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  service_name: string;
  services_count?: number;
  services_subtotal?: number;
  appointment_date: string;
  time_slot: string;
  end_time?: string;
  duration_minutes?: number;
  chair_id?: string;
  has_pickup_drop?: boolean;
  pickup_address?: string;
  pickup_fee?: number;
  discount_amount?: number;
  price: number;
  payment_method?: string;
  status?: string;
};

export type TailorVisitReceiptData = {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  outfit_type?: string;
  outfits?: string[];
  items_subtotal?: number;
  preferred_date?: string;
  preferred_slot?: string;
  address?: string;
  delivery_fee?: number;
  discount_amount?: number;
  final_total?: number;
  price?: number;
  status?: string;
};

export type CosmeticsOrderReceiptData = {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  items?: Array<{ name: string; price: number; quantity: number }> | unknown;
  total_amount: number;
  payment_method?: string;
  address?: string;
  status?: string;
  created_at?: string;
};

export function generateAppointmentWhatsAppText(data: AppointmentReceiptData): string {
  const ref = data.id.slice(0, 8).toUpperCase();
  const dur = data.duration_minutes || 45;
  const chair = data.chair_id || "Chair 1";
  const payMode = data.payment_method === "upi" ? `UPI (${SHOP.upiId})` : "Pay at Salon";
  const subtotal = data.services_subtotal || data.price;
  const pickupFee = data.pickup_fee ?? (data.has_pickup_drop ? 0 : 0);
  const discount = data.discount_amount || 0;

  return [
    `🌸 *${SHOP.name.toUpperCase()}* 🌸`,
    `📍 *Address:* ${SHOP.address}`,
    `📞 *Helpline / WhatsApp:* ${SHOP.phoneIntl}`,
    `✨ *OFFICIAL PARLOUR BOOKING BILL & RECEIPT* ✨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Booking Ref:* #${ref}`,
    `👤 *Customer Name:* ${data.customer_name || "Valued Customer"}`,
    data.customer_phone ? `📱 *Phone:* ${data.customer_phone}` : null,
    `📅 *Appointment Date:* ${data.appointment_date}`,
    `⏰ *Time Slot:* ${data.time_slot}${data.end_time ? ` – ${data.end_time}` : ""} (${dur} mins)`,
    `🪑 *Assigned Workstation:* ${chair}`,
    `💅 *Booked Services:* ${data.service_name}`,
    data.has_pickup_drop
      ? `🚗 *Lucknow Pickup & Drop:* ${data.pickup_address || "Requested"} (${pickupFee === 0 ? "FREE within 5 km" : inr(pickupFee)})`
      : null,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *BILL BREAKDOWN:*`,
    `• Services Subtotal: ${inr(subtotal)}`,
    data.has_pickup_drop
      ? `• Pickup & Drop: ${pickupFee === 0 ? "FREE (₹0)" : inr(pickupFee)}`
      : null,
    discount > 0 ? `• Welcome 1st Order Discount: -${inr(discount)}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *FINAL TOTAL PAYABLE: ${inr(data.price)}*`,
    `💳 *Payment Mode:* ${payMode}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💖 *THANK YOU FOR CHOOSING SHIVI PARLOUR & BOUTIQUE!* 💖`,
    `"We are committed to giving you the best beauty care and salon experience in Lucknow. For any rescheduling or queries, reach us anytime on ${SHOP.phone}."`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateTailorVisitWhatsAppText(data: TailorVisitReceiptData): string {
  const ref = data.id.slice(0, 8).toUpperCase();
  const outfits = data.outfits?.join(", ") || data.outfit_type || "Custom Stitching";
  const total = data.final_total ?? data.price ?? 0;
  const subtotal = data.items_subtotal || total;
  const deliveryFee = data.delivery_fee || 0;
  const discount = data.discount_amount || 0;

  return [
    `🌸 *${SHOP.name.toUpperCase()}* 🌸`,
    `📍 *Address:* ${SHOP.address}`,
    `📞 *Helpline / WhatsApp:* ${SHOP.phoneIntl}`,
    `✨ *OFFICIAL BOUTIQUE HOME VISIT INVOICE* ✨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Booking Ref:* #${ref}`,
    `👤 *Customer Name:* ${data.customer_name || "Valued Customer"}`,
    data.customer_phone ? `📱 *Phone:* ${data.customer_phone}` : null,
    `👗 *Selected Outfits:* ${outfits}`,
    `📅 *Measurement Date:* ${data.preferred_date || "As scheduled"}`,
    `⏰ *Preferred Slot:* ${data.preferred_slot || "10:00 AM - 1:00 PM"}`,
    data.address ? `🏠 *Home Visit Address:* ${data.address}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *ESTIMATED BILL:*`,
    `• Outfits Subtotal: ${inr(subtotal)}`,
    `• Home Measurement Visit: ${deliveryFee === 0 ? "FREE (Within 5 km)" : inr(deliveryFee)}`,
    discount > 0 ? `• Welcome Discount: -${inr(discount)}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *ESTIMATED TOTAL: ${inr(total)}*`,
    `💳 *Payment Mode:* Pay after fitting & delivery / UPI`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💖 *THANK YOU FOR CHOOSING SHIVI PARLOUR & BOUTIQUE!* 💖`,
    `"Our master tailor will visit your home with fabric swatches & measurement tapes for a flawless custom fit in Lucknow."`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateCosmeticsOrderWhatsAppText(data: CosmeticsOrderReceiptData): string {
  const ref = data.id.slice(0, 8).toUpperCase();
  const payMode =
    data.payment_method === "upi" ? `Online UPI (${SHOP.upiId})` : "Pay on Delivery / Collection";

  let itemsList = "Genuine Beauty & Cosmetics Products";
  if (Array.isArray(data.items) && data.items.length > 0) {
    itemsList = data.items
      .map(
        (it: { name: string; price: number; quantity: number }) =>
          `• ${it.name} (Qty: ${it.quantity}) - ${inr(it.price * it.quantity)}`,
      )
      .join("\n");
  }

  return [
    `🌸 *${SHOP.name.toUpperCase()}* 🌸`,
    `📍 *Address:* ${SHOP.address}`,
    `📞 *Helpline / WhatsApp:* ${SHOP.phoneIntl}`,
    `✨ *OFFICIAL COSMETICS ORDER BILL & RECEIPT* ✨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order Ref:* #${ref}`,
    `👤 *Customer Name:* ${data.customer_name || "Valued Customer"}`,
    data.customer_phone ? `📱 *Phone:* ${data.customer_phone}` : null,
    data.address
      ? `🏠 *Delivery Address:* ${data.address}`
      : `🛍️ *Mode:* Store Pickup / Local Delivery`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ *ORDERED ITEMS:*`,
    itemsList,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *FINAL TOTAL AMOUNT: ${inr(data.total_amount)}*`,
    `💳 *Payment Mode:* ${payMode}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💖 *THANK YOU FOR CHOOSING SHIVI PARLOUR & BOUTIQUE!* 💖`,
    `"100% Genuine beauty & skincare products. We appreciate your trust in Shivi Parlour & Boutique!"`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function openWhatsAppBill(customerPhone: string | undefined, messageText: string) {
  let cleanNumber = (customerPhone || "").replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber;
  } else if (cleanNumber.length === 12 && cleanNumber.startsWith("91")) {
    // valid
  } else {
    cleanNumber = "91" + SHOP.phone;
  }
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
