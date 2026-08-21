import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Scissors,
  Sparkles,
  Ruler,
  Clock,
  Check,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Plus,
  X,
  Layers,
  Navigation,
  Tag,
  Receipt,
  Car,
  BadgePercent,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  BOUTIQUE_SERVICES,
  type BoutiqueServiceCategory,
  type BoutiqueServiceItem,
  OUTFIT_TYPES,
  TIME_SLOTS,
  SHOP,
  inr,
  getBoutiqueItemPrice,
  calculateDeliveryFee,
  calculateDistanceKm,
  LUCKNOW_POPULAR_AREAS,
  FREE_DELIVERY_RADIUS_KM,
  PER_KM_CHARGE,
  FIRST_ORDER_DISCOUNT_AMOUNT,
  generateTailorVisitWhatsAppText,
  openWhatsAppBill,
} from "@/lib/shop";

function BoutiqueInfoNote({
  icon: Icon,
  titleEn,
  titleHi,
  textEn,
  textHi,
  className,
}: {
  icon: React.ElementType;
  titleEn: string;
  titleHi: string;
  textEn: string;
  textHi: string;
  className?: string;
}) {
  const [lang, setLang] = useState<"both" | "en" | "hi">("both");

  return (
    <div
      className={`rounded-xl border border-border/80 bg-card/60 p-4 transition-all sm:p-5 shadow-2xs ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">
            {lang === "hi" ? titleHi : lang === "en" ? titleEn : `${titleEn} · ${titleHi}`}
          </h4>
        </div>

        <div className="inline-flex self-start sm:self-auto items-center rounded-lg border border-border/70 bg-background/90 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
              lang === "en"
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
              lang === "hi"
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setLang("both")}
            className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
              lang === "both"
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Both / दोनों
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {(lang === "both" || lang === "en") && (
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
            {lang === "both" && (
              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                EN
              </span>
            )}
            <p className="flex-1">{textEn}</p>
          </div>
        )}

        {(lang === "both" || lang === "hi") && (
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
            {lang === "both" && (
              <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                HI
              </span>
            )}
            <p className="flex-1">{textHi}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      {
        title:
          "Boutique Stitching, Designer Blouses, Suits & Home Tailor — Shivi Boutique, Lucknow",
      },
      {
        name: "description",
        content:
          "Suit, kurti, blouse, lehenga & dress stitching in Lucknow. Automatic price estimation, free doorstep visits within 5 km, and ₹100 first-time customer discount.",
      },
      {
        property: "og:title",
        content: "Boutique Stitching & Home Tailor Visit — Shivi Boutique, Lucknow",
      },
      {
        property: "og:description",
        content:
          "Custom stitching designs, bridal couture, express alterations plus home measurement and cloth pickup across Lucknow.",
      },
    ],
  }),
  component: BoutiquePage,
});

type ConfirmedVisitDetails = {
  id: string;
  customer_name: string;
  customer_phone: string;
  outfits: string[];
  items_subtotal: number;
  distance_km: number;
  delivery_fee: number;
  discount_amount: number;
  final_total: number;
  preferred_date: string;
  preferred_slot: string;
  address: string;
};

function BoutiquePage() {
  const { user, profile, openAuth } = useAuth();
  const [activeCategory, setActiveCategory] = useState<BoutiqueServiceCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedService, setHighlightedService] = useState<string | null>(null);

  // Multiple selected outfits for home visit (defaulting to popular combo)
  const [selectedOutfits, setSelectedOutfits] = useState<string[]>([
    "Kurti Stitching",
    "Blouse Stitching",
    "Suit Stitching",
  ]);
  const [customOutfitInput, setCustomOutfitInput] = useState("");

  // Location & Distance state (Free <= 5 km, ₹15/km beyond 5 km)
  const [selectedArea, setSelectedArea] = useState<string>("Kabir Pur / Sultanpur Road (Local)");
  const [distanceKm, setDistanceKm] = useState<number>(1);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [form, setForm] = useState({
    address: "",
    preferred_date: "",
    preferred_slot: TIME_SLOTS[0] as string,
    notes: "",
    name: "",
    phone: "",
  });

  const [confirmedVisit, setConfirmedVisit] = useState<ConfirmedVisitDetails | null>(null);

  // Check if user has past bookings/orders to determine first-time discount
  const { data: userHistoryCount } = useQuery({
    queryKey: ["user_history_count", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user) return 0;
      const [visits, appts, orders] = await Promise.all([
        supabase
          .from("tailor_visits")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return (visits.count || 0) + (appts.count || 0) + (orders.count || 0);
    },
  });

  // Treat guest or 0 past bookings as 1st time customer eligible for ₹100 discount!
  const isFirstTimeCustomer = !user || (userHistoryCount ?? 0) === 0;

  // Toggle selection
  const toggleOutfit = (type: string) => {
    setSelectedOutfits((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const removeOutfit = (type: string) => {
    setSelectedOutfits((prev) => prev.filter((t) => t !== type));
  };

  const addCustomOutfit = () => {
    const trimmed = customOutfitInput.trim();
    if (!trimmed) return;
    if (!selectedOutfits.includes(trimmed)) {
      setSelectedOutfits((prev) => [...prev, trimmed]);
      toast.success(`Added "${trimmed}" to your requirements list.`);
    }
    setCustomOutfitInput("");
  };

  // Handle area dropdown selection
  const handleAreaChange = (areaName: string) => {
    setSelectedArea(areaName);
    const found = LUCKNOW_POPULAR_AREAS.find((a) => a.name === areaName);
    if (found && found.name !== "Custom / Enter Distance Manually") {
      setDistanceKm(found.distanceKm);
      // If address is empty or only has short text, suggest the area
      if (!form.address || form.address.length < 10) {
        setForm((prev) => ({
          ...prev,
          address: `${found.name.split("/")[0]?.trim()}, Lucknow`,
        }));
      }
    }
  };

  // Handle GPS location detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const dist = calculateDistanceKm(
          SHOP.lat,
          SHOP.lng,
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setDistanceKm(dist);
        setSelectedArea("Custom / Enter Distance Manually");
        toast.success(`Detected distance: ~${dist} km from Shivi Boutique.`);
      },
      (err) => {
        setIsDetectingGps(false);
        toast.error("Could not fetch location. Please select your area manually.");
        console.error(err);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Calculate prices dynamically
  const itemizedList = useMemo(() => {
    return selectedOutfits.map((item) => ({
      name: item,
      price: getBoutiqueItemPrice(item),
    }));
  }, [selectedOutfits]);

  const itemsSubtotal = useMemo(() => {
    return itemizedList.reduce((acc, item) => acc + item.price, 0);
  }, [itemizedList]);

  const deliveryCalc = useMemo(() => {
    return calculateDeliveryFee(distanceKm);
  }, [distanceKm]);

  const discountAmount = useMemo(() => {
    if (!isFirstTimeCustomer || itemsSubtotal <= 0) return 0;
    return Math.min(FIRST_ORDER_DISCOUNT_AMOUNT, itemsSubtotal);
  }, [isFirstTimeCustomer, itemsSubtotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, itemsSubtotal + deliveryCalc.deliveryFee - discountAmount);
  }, [itemsSubtotal, deliveryCalc.deliveryFee, discountAmount]);

  const request = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first.");
      if (selectedOutfits.length === 0) {
        throw new Error(
          "Please select at least one outfit or stitching service (e.g. Kurti, Blouse).",
        );
      }
      const cleanName = (form.name || profile?.full_name || "").trim();
      const cleanPhone = (form.phone || profile?.phone || "").trim().replace(/\D/g, "");
      const cleanAddress = form.address.trim();
      const cleanNotes = form.notes.trim().slice(0, 500);

      if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
        throw new Error("Please enter your full name (2–100 characters).");
      }
      if (cleanPhone.length !== 10) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }
      if (!form.preferred_date) {
        throw new Error("Please select a preferred visit date.");
      }
      if (form.preferred_date < today) {
        throw new Error("Visit date cannot be in the past.");
      }
      if (!cleanAddress || cleanAddress.length < 5 || cleanAddress.length > 500) {
        throw new Error("Please enter a complete delivery address (at least 5 characters).");
      }

      const combinedOutfitType = selectedOutfits
        .map((name) => `${name} (${inr(getBoutiqueItemPrice(name))})`)
        .join(", ");

      const pricingSummaryNote = `[ESTIMATED TOTAL: ${inr(finalTotal)} | Items (${selectedOutfits.length}): ${inr(itemsSubtotal)} | Distance: ${distanceKm} km | Delivery: ${inr(deliveryCalc.deliveryFee)}${discountAmount > 0 ? ` | 1st-Time Discount: -${inr(discountAmount)}` : ""}] ${cleanNotes ? `\nNotes: ${cleanNotes}` : ""}`;

      const fullAddressWithDistance = `${cleanAddress} [Locality: ${selectedArea}, Distance: ~${distanceKm} km]`;

      const { data, error } = await supabase
        .from("tailor_visits")
        .insert({
          user_id: user.id,
          customer_name: cleanName,
          customer_phone: cleanPhone,
          outfit_type: combinedOutfitType,
          address: fullAddressWithDistance,
          preferred_date: form.preferred_date,
          preferred_slot: form.preferred_slot || TIME_SLOTS[0] || "",
          notes: pricingSummaryNote,
        })
        .select("id")
        .single();

      if (error) throw error;

      return {
        id: data.id,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        outfits: [...selectedOutfits],
        items_subtotal: itemsSubtotal,
        distance_km: distanceKm,
        delivery_fee: deliveryCalc.deliveryFee,
        discount_amount: discountAmount,
        final_total: finalTotal,
        preferred_date: form.preferred_date,
        preferred_slot: form.preferred_slot || TIME_SLOTS[0] || "",
        address: cleanAddress,
      };
    },
    onSuccess: (data) => {
      toast.success("Home tailor visit requested successfully!");
      setConfirmedVisit(data);
      setForm((prev) => ({ ...prev, address: "", preferred_date: "", notes: "" }));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Request failed"),
  });

  const today = new Date().toISOString().slice(0, 10);

  // Filter boutique services based on category and search query
  const filteredServices = useMemo(() => {
    return BOUTIQUE_SERVICES.filter((svc) => {
      const matchesCategory = activeCategory === "All" || svc.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.popularStyles?.some((s) => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleSelectServiceForVisit = (service: BoutiqueServiceItem) => {
    setSelectedOutfits((prev) => {
      if (prev.includes(service.name)) return prev;
      return [...prev, service.name];
    });
    setHighlightedService(service.id);

    // Scroll smoothly to home-visit section
    const el = document.getElementById("home-visit");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    toast.info(`Added "${service.name}" (${inr(service.price)}) to your Visit List.`);
  };

  const categories: BoutiqueServiceCategory[] = [
    "All",
    "Stitching Services",
    "Designing & Styling",
    "Bridal & Party Wear",
    "Alterations & Fitting",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Bespoke Tailoring & Designer Studio · Lucknow
          </div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
            Boutique & Home Tailor Service
          </h1>
          <p className="mt-2.5 max-w-2xl text-base text-muted-foreground">
            Select your outfits, get automatic real-time price estimation, enjoy free doorstep
            visits within 5 km, and claim an automatic ₹100 First-Time Customer discount.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="shadow-md">
            <a href="#home-visit">
              <Ruler className="mr-2 size-4" /> Book Home Visit
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={`tel:${SHOP.phoneIntl}`}>
              <Phone className="mr-2 size-4" /> Call {SHOP.phone}
            </a>
          </Button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: Ruler,
            title: "Doorstep Measurements",
            desc: "Free visit within 5 km radius",
          },
          {
            icon: BadgePercent,
            title: "₹100 First Order OFF",
            desc: "Auto-applied for new users",
          },
          {
            icon: Sparkles,
            title: "Designer Customization",
            desc: "Neck, sleeve & embroidery styles",
          },
          {
            icon: ShieldCheck,
            title: "Trial & Delivery",
            desc: "Prompt home drop in Lucknow",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-start rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-4" />
            </div>
            <h4 className="mt-2 font-semibold text-xs text-foreground">{f.title}</h4>
            <p className="text-[11px] text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Information Point 1: Custom Designs & Detailing Note */}
      <BoutiqueInfoNote
        className="mt-8"
        icon={Sparkles}
        titleEn="Custom Designs & Detailing"
        titleHi="कस्टम डिज़ाइन और अतिरिक्त शुल्क"
        textEn="Custom designs can be created according to your ideas, preferences, and requirements. Additional charges may apply depending on the design, detailing, and complexity."
        textHi="आपके विचार, पसंद और जरूरत के अनुसार कस्टम डिज़ाइन तैयार किए जा सकते हैं। डिज़ाइन, उसकी बारीकी और जटिलता के अनुसार अतिरिक्त शुल्क लागू हो सकता है।"
      />

      {/* Category Tabs & Search Bar */}
      <div className="mt-12 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-foreground">
              Explore Tailoring & Designing Options
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose from standard stitching, bespoke couture, or quick doorstep alterations.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search suit, blouse, kurti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(val) => setActiveCategory(val as BoutiqueServiceCategory)}
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 p-1 sm:grid-cols-5">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs py-1.5">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Services Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => {
          const isHighlighted = highlightedService === service.id;
          return (
            <Card
              key={service.id}
              className={`group flex flex-col justify-between overflow-hidden border transition-all duration-200 shadow-soft hover:border-primary/50 hover:shadow-md ${
                isHighlighted ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-card"
              }`}
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    loading="lazy"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white/95 drop-shadow-sm flex items-center gap-1">
                      <Scissors className="size-3 text-primary-foreground" />
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-medium text-white">
                      <Clock className="size-3 text-amber-300" />
                      {service.turnaround}
                    </span>
                  </div>

                  {service.badge && (
                    <div className="absolute right-3 top-3">
                      <Badge
                        variant={
                          service.badge === "Popular" || service.badge === "Signature"
                            ? "default"
                            : service.badge === "Free Visit"
                              ? "outline"
                              : "secondary"
                        }
                        className="text-[10px] font-semibold tracking-wide shadow-xs"
                      >
                        {service.badge}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <div className="text-right">
                      {service.isComplimentary ? (
                        <div>
                          <span className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                            FREE
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {service.priceNote || "Within 5 km"}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-muted-foreground">From </span>
                          <span className="font-display text-lg font-bold text-primary">
                            {inr(service.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-1 rounded-lg bg-accent/30 p-2.5 text-[11px]">
                    {service.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-1.5 text-foreground/85">
                        <CheckCircle2 className="size-3 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Popular Styles Chips */}
                  {service.popularStyles && service.popularStyles.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Popular Styles:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {service.popularStyles.slice(0, 3).map((st) => (
                          <span
                            key={st}
                            className="rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground/80"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Action Button */}
              <div className="border-t p-3 bg-muted/20">
                {(() => {
                  const isSelected = selectedOutfits.includes(service.name);
                  return (
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="w-full text-xs font-semibold"
                      onClick={() => handleSelectServiceForVisit(service)}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1">
                          <Check className="size-3.5" /> Added to Home Visit List
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Plus className="size-3.5" /> Select for Home Tailor Visit
                        </span>
                      )}
                    </Button>
                  );
                })()}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No boutique services matched your search &ldquo;{searchQuery}&rdquo;.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Booking Form Section */}
      <Card id="home-visit" className="mt-16 scroll-mt-6 border-primary/20 shadow-elegant">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <HeartHandshake className="size-4" /> Doorstep Boutique Experience
              </div>
              <h2 className="font-display text-3xl text-foreground">
                Book a Home Tailor Visit & Calculate Price
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your outfits and location — our system automatically computes items total,
                delivery charges (free within 5 km), and applies your ₹100 first-time customer
                discount.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-primary/40 text-primary bg-primary/5 py-1 px-3"
            >
              Lucknow City Wide Coverage
            </Badge>
          </div>

          {/* Information Point 2: Tailor Visit & Delivery Charges Note */}
          <BoutiqueInfoNote
            className="mt-6"
            icon={MapPin}
            titleEn="Tailor Visit & Delivery Charges"
            titleHi="टेलर विज़िट एवं डिलीवरी शुल्क"
            textEn="Tailor visits are free within 5 km of our location. For locations beyond 5 km, applicable visit or delivery charges will be added based on the distance (₹15/km)."
            textHi="हमारे स्थान से 5 किमी के दायरे में टेलर विज़िट बिल्कुल निःशुल्क है। 5 किमी से अधिक दूरी के लिए दूरी के अनुसार विज़िट या डिलीवरी शुल्क लागू होगा (₹15/किमी)।"
          />

          {/* First-Time Welcome Discount Alert */}
          {isFirstTimeCustomer && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
                <Tag className="size-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">🎉 1st Time Customer Welcome Offer Active!</p>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                  Flat ₹100 discount is automatically applied to your booking summary below.
                </p>
              </div>
            </div>
          )}

          <form
            className="mt-6 grid gap-6 md:grid-cols-12"
            onSubmit={(e) => {
              e.preventDefault();
              request.mutate();
            }}
          >
            {/* Left Column: Form Fields */}
            <div className="space-y-5 md:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visit-name">Full Name</Label>
                  <Input
                    id="visit-name"
                    placeholder="e.g. Priya Sharma"
                    value={form.name || profile?.full_name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit-phone">Phone Number (10 digits)</Label>
                  <Input
                    id="visit-phone"
                    type="tel"
                    placeholder="e.g. 7897179580"
                    value={form.phone || profile?.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Multi-Select Outfits */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="size-4 text-primary" /> Select Outfits (e.g. 3 Items)
                    </Label>
                    <Badge variant="secondary" className="font-semibold text-xs text-primary">
                      {selectedOutfits.length} Selected
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedOutfits([...OUTFIT_TYPES])}
                      className="font-medium text-primary hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedOutfits([])}
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Selected Items summary chips with individual prices */}
                {selectedOutfits.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/5 p-3">
                    <span className="text-xs font-semibold text-primary mr-1">Selected:</span>
                    {selectedOutfits.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-2xs"
                      >
                        <Check className="size-3" />
                        {type} ({inr(getBoutiqueItemPrice(type))})
                        <button
                          type="button"
                          onClick={() => removeOutfit(type)}
                          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary-foreground/20"
                          aria-label={`Remove ${type}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                    ⚠️ No outfit selected yet. Tap any options below (like Kurti, Blouse, Suit) to
                    add them to your visit.
                  </div>
                )}

                {/* Multi-select clickable options grid */}
                <div className="flex flex-wrap gap-2">
                  {OUTFIT_TYPES.map((type) => {
                    const isSelected = selectedOutfits.includes(type);
                    const price = getBoutiqueItemPrice(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleOutfit(type)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                            : "border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-accent/40"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="size-3.5 text-primary-foreground" />
                        ) : (
                          <Plus className="size-3.5 text-muted-foreground" />
                        )}
                        <span>{type}</span>
                        <span
                          className={`text-[10px] opacity-80 ${
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          ({inr(price)})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom outfit input */}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add another outfit / custom design (e.g. Anarkali Suit with Dupatta Work)..."
                    value={customOutfitInput}
                    onChange={(e) => setCustomOutfitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomOutfit();
                      }
                    }}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomOutfit}
                    disabled={!customOutfitInput.trim()}
                    className="shrink-0 text-xs"
                  >
                    <Plus className="size-3.5 mr-1" /> Add Custom
                  </Button>
                </div>
              </div>

              {/* Location & Distance Calculator */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Car className="size-4 text-primary" /> Location & Distance Calculator
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="h-7 text-[11px] px-2.5"
                  >
                    <Navigation className="size-3 mr-1 text-primary" />
                    {isDetectingGps ? "Detecting GPS…" : "Detect My Distance"}
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Select Lucknow Locality</Label>
                    <Select value={selectedArea} onValueChange={handleAreaChange}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LUCKNOW_POPULAR_AREAS.map((area) => (
                          <SelectItem key={area.name} value={area.name} className="text-xs">
                            {area.name} (~{area.distanceKm} km)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Label htmlFor="distance-input" className="text-muted-foreground">
                        Distance from Boutique
                      </Label>
                      <span className="font-semibold text-primary font-mono">{distanceKm} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="distance-input"
                        type="number"
                        min={0.5}
                        max={50}
                        step={0.5}
                        value={distanceKm}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          setDistanceKm(val);
                          setSelectedArea("Custom / Enter Distance Manually");
                        }}
                        className="text-xs h-9 font-mono"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">km</span>
                    </div>
                  </div>
                </div>

                {/* Distance calculation feedback */}
                <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span>
                      Shop: Kabir Pur, Sultanpur Rd → <strong>{distanceKm} km</strong>
                    </span>
                  </div>
                  <div>
                    {deliveryCalc.isFree ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        FREE Delivery (Within 5 km)
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        +{inr(deliveryCalc.deliveryFee)} ({deliveryCalc.extraKm} km extra @ ₹
                        {PER_KM_CHARGE}/km)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date and Time Slot */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visit-date">Preferred Visit Date</Label>
                  <Input
                    id="visit-date"
                    type="date"
                    min={today}
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit-slot">Preferred Time Slot</Label>
                  <Select
                    value={form.preferred_slot}
                    onValueChange={(value) => setForm({ ...form, preferred_slot: value })}
                  >
                    <SelectTrigger id="visit-slot">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="visit-address" className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" /> Complete Doorstep Address in Lucknow
                </Label>
                <Textarea
                  id="visit-address"
                  rows={2}
                  placeholder="House / flat number, building, street, landmark, area, pin code..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="visit-notes">Design Notes & Preferences (Optional)</Label>
                <Textarea
                  id="visit-notes"
                  rows={2}
                  placeholder="Neck pattern, sleeve style, fabric type, lining preference, urgent delivery..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Right Column: Live Price Calculation Card */}
            <div className="md:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-primary/30 bg-card p-5 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="size-4 text-primary" />
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      Price Calculation
                    </h3>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary text-[11px]">
                    Automatic Quote
                  </Badge>
                </div>

                {/* Itemized List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Selected Items ({selectedOutfits.length})</span>
                    <span>Price</span>
                  </div>

                  {itemizedList.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {itemizedList.map((item, idx) => (
                        <div
                          key={`${item.name}-${idx}`}
                          className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2 text-xs border border-border/50"
                        >
                          <span className="font-medium text-foreground truncate">{item.name}</span>
                          <span className="font-semibold text-primary font-mono shrink-0">
                            {inr(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-2">
                      Please select items above to calculate price.
                    </p>
                  )}
                </div>

                {/* Calculation breakdown */}
                <div className="border-t border-border/70 pt-3 space-y-2.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-foreground font-mono">
                      {inr(itemsSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <div className="space-y-0.5">
                      <span className="block">Tailor Visit / Delivery ({distanceKm} km)</span>
                      <span className="text-[10px] text-muted-foreground">
                        {distanceKm <= FREE_DELIVERY_RADIUS_KM
                          ? "Within 5 km radius (Free)"
                          : `${deliveryCalc.extraKm} km extra @ ₹${PER_KM_CHARGE}/km`}
                      </span>
                    </div>
                    <span
                      className={`font-medium font-mono ${
                        deliveryCalc.isFree
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      }`}
                    >
                      {deliveryCalc.isFree ? "FREE (₹0)" : `+${inr(deliveryCalc.deliveryFee)}`}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Tag className="size-3" /> 1st Order Welcome Discount
                      </span>
                      <span className="font-bold font-mono">-{inr(discountAmount)}</span>
                    </div>
                  )}

                  {/* Final Total Amount */}
                  <div className="border-t border-dashed border-border pt-3 flex items-baseline justify-between">
                    <div>
                      <span className="font-display font-bold text-base text-foreground block">
                        Final Total Amount
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        All inclusive (stitching + visit charges)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-2xl text-primary font-mono block">
                        {inr(finalTotal)}
                      </span>
                      {discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          You saved {inr(discountAmount)}!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  {user ? (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={request.isPending || selectedOutfits.length === 0}
                      className="w-full font-semibold shadow-md"
                    >
                      {request.isPending
                        ? "Submitting Request…"
                        : `Confirm & Book Visit • ${inr(finalTotal)}`}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      onClick={openAuth}
                      className="w-full font-semibold"
                    >
                      Sign in to Request Home Visit
                    </Button>
                  )}
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Master tailor will visit with swatches and measurement tape on your selected
                    date.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={Boolean(confirmedVisit)} onOpenChange={() => setConfirmedVisit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle className="size-6" />
            </div>
            <DialogTitle className="text-center font-display text-2xl">
              Home Tailor Visit Requested!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              We have received your home visit request. Our team will call you to confirm before the
              visit.
            </DialogDescription>
          </DialogHeader>

          {confirmedVisit && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border bg-card p-4 space-y-2 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Request Ref</span>
                  <span className="font-mono font-semibold">
                    #{confirmedVisit.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{confirmedVisit.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Items</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {confirmedVisit.outfits.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visit Date & Slot</span>
                  <span className="font-medium">
                    {confirmedVisit.preferred_date} ({confirmedVisit.preferred_slot})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address & Distance</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {confirmedVisit.address} (~{confirmedVisit.distance_km} km)
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Items Subtotal</span>
                  <span className="font-mono">{inr(confirmedVisit.items_subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery / Visit Fee</span>
                  <span className="font-mono">
                    {confirmedVisit.delivery_fee === 0
                      ? "FREE (Within 5 km)"
                      : inr(confirmedVisit.delivery_fee)}
                  </span>
                </div>
                {confirmedVisit.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>1st Order Welcome Discount</span>
                    <span className="font-mono">-{inr(confirmedVisit.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-primary">
                  <span>Final Estimated Total</span>
                  <span className="font-mono text-base">{inr(confirmedVisit.final_total)}</span>
                </div>
              </div>

              {/* Heartfelt Official Thank You Banner */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-center text-emerald-900 dark:text-emerald-200">
                <p className="font-bold text-xs flex items-center justify-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-600" />
                  Thank you for choosing Shivi Parlour & Boutique!
                </p>
                <p className="text-[11px] mt-1 text-emerald-800/80 dark:text-emerald-300/80">
                  Our master tailor will visit your home on {confirmedVisit.preferred_date}. Send
                  your official home visit invoice to your WhatsApp with one click!
                </p>
              </div>

              {/* Direct WhatsApp Bill Action */}
              <Button
                type="button"
                className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => {
                  const msg = generateTailorVisitWhatsAppText(confirmedVisit);
                  openWhatsAppBill(confirmedVisit.customer_phone, msg);
                  toast.success("Opening WhatsApp with tailor visit invoice...");
                }}
              >
                <MessageCircle className="size-4 mr-2 fill-white" />
                📲 Send Bill to WhatsApp
              </Button>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmedVisit(null)}
                >
                  Close
                </Button>
                <Button asChild variant="secondary" className="flex-1">
                  <Link to="/_authenticated/my-bookings">View in My Bookings</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
