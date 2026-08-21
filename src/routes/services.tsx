import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Armchair,
  Calendar as CalendarIcon,
  Sparkles,
  Scissors,
  Hand,
  Info,
  ExternalLink,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Layers,
  Check,
  Car,
  Navigation,
  Tag,
  MapPin,
  Receipt,
  BadgePercent,
  MessageCircle,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  SHOP,
  TIME_SLOTS,
  CHAIR_RESOURCES,
  HAIRCUT_SUB_OPTIONS,
  type HaircutStyle,
  WAXING_SUB_OPTIONS,
  type WaxingServiceOption,
  HANDS_FEET_SUB_OPTIONS,
  type HandsFeetServiceOption,
  DEFAULT_PARLOUR_SERVICES,
  DEFAULT_PARLOUR_CATEGORIES,
  inr,
  timeToMinutes,
  calculateSlotAvailability,
  type BookedSlotItem,
  calculateDeliveryFee,
  calculateDistanceKm,
  getGoogleMapsRouteUrl,
  LUCKNOW_POPULAR_AREAS,
  FREE_DELIVERY_RADIUS_KM,
  PER_KM_CHARGE,
  FIRST_ORDER_DISCOUNT_AMOUNT,
  generateAppointmentWhatsAppText,
  openWhatsAppBill,
} from "@/lib/shop";
import { GoogleMapsLocationPicker } from "@/components/GoogleMapsLocationPicker";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      {
        title: "Parlour Services, Haircuts, Waxing & Pickup Drop — Shivi Parlour, Lucknow",
      },
      {
        name: "description",
        content:
          "Hair, waxing, manicure, pedicure, skin, makeup, threading with automatic multi-service price calculation, pickup & drop within Lucknow, and ₹100 first-time discount.",
      },
      {
        property: "og:title",
        content: "Parlour Services & Pickup Drop — Shivi Parlour & Salon, Lucknow",
      },
      {
        property: "og:description",
        content:
          "Browse parlour treatments, calculate package price automatically, and book appointment online.",
      },
    ],
  }),
  component: ServicesPage,
});

type ServiceRow = {
  id: string;
  category: string;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
};

export type SelectedParlourService = {
  id: string;
  category: string;
  name: string;
  displayName: string;
  price: number;
  duration_minutes: number;
  description?: string;
  notes?: string;
};

type ConfirmedAppointment = {
  id: string;
  service_name: string;
  services_count: number;
  services_subtotal: number;
  has_pickup_drop: boolean;
  distance_km: number;
  pickup_fee: number;
  discount_amount: number;
  price: number;
  appointment_date: string;
  time_slot: string;
  end_time: string;
  duration_minutes: number;
  chair_id: string;
  customer_name: string;
  payment_method: string;
  pickup_address?: string;
  status: string;
};

function ServicesPage() {
  const { user, profile, openAuth } = useAuth();
  const queryClient = useQueryClient();

  // Multi-service selection state
  const [selectedServices, setSelectedServices] = useState<SelectedParlourService[]>([]);
  const [customHaircutNotes, setCustomHaircutNotes] = useState<string>("");
  const [customWaxingNotes, setCustomWaxingNotes] = useState<string>("");
  const [customHandsFeetNotes, setCustomHandsFeetNotes] = useState<string>("");

  // Pickup & Drop Service state
  const [needPickupDrop, setNeedPickupDrop] = useState<boolean>(false);
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("Kabir Pur / Sultanpur Road (Local)");
  const [distanceKm, setDistanceKm] = useState<number>(1);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);

  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>("");
  const [payment, setPayment] = useState("shop");
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedAppointment | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  // Check past appointments/orders to determine first-time discount
  const { data: userHistoryCount } = useQuery({
    queryKey: ["user_history_count_services", user?.id],
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

  const isFirstTimeCustomer = !user || (userHistoryCount ?? 0) === 0;

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      let dbServices: ServiceRow[] = [];
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, category, name, price, duration_minutes")
          .eq("is_active", true)
          .order("category")
          .order("price");
        if (!error && data) {
          dbServices = data as ServiceRow[];
        }
      } catch (err) {
        console.warn("Could not fetch services from database", err);
      }

      // Merge all default services across categories (Hair, Threading, Facials, Skin, Makeup, Waxing, Hands & Feet)
      // to ensure all options are always present and visible
      for (const defSvc of DEFAULT_PARLOUR_SERVICES) {
        const exists = dbServices.some(
          (s) =>
            s.id === defSvc.id ||
            (s.name.toLowerCase().trim() === defSvc.name.toLowerCase().trim() &&
              s.category.toLowerCase().trim() === defSvc.category.toLowerCase().trim()),
        );
        if (!exists) {
          dbServices.push({
            id: defSvc.id,
            category: defSvc.category,
            name: defSvc.name,
            price: defSvc.price,
            duration_minutes: defSvc.duration_minutes,
            description: defSvc.description,
          });
        }
      }

      return dbServices;
    },
  });

  // Find the primary haircut service from the database (or fallback)
  const hairCutService = useMemo(() => {
    return (
      (services ?? []).find(
        (s) =>
          s.category === "Hair" &&
          (s.name.toLowerCase().includes("cut") || s.name.toLowerCase().includes("hair cut")),
      ) ?? null
    );
  }, [services]);

  // Multi-service helpers
  const isServiceSelected = (id: string) => selectedServices.some((s) => s.id === id);

  const toggleService = (item: SelectedParlourService) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) {
        return prev.filter((s) => s.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const removeService = (id: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAllServices = () => {
    setSelectedServices([]);
    setSlot("");
  };

  // Specific toggle handlers for custom sub-options
  const toggleHaircutOption = (style: HaircutStyle) => {
    const itemId = `haircut-${style.id}`;
    const exists = isServiceSelected(itemId);
    if (exists) {
      removeService(itemId);
      toast.info(`Removed ${style.name} from booking.`);
    } else {
      const haircutItem: SelectedParlourService = {
        id: itemId,
        category: "Hair",
        name: `Haircut - ${style.name}`,
        displayName: `${style.name} (${style.durationMinutes}m)`,
        price: hairCutService?.price ?? 350,
        duration_minutes: style.durationMinutes,
        description: style.description,
        notes:
          style.id === "custom" && customHaircutNotes.trim()
            ? customHaircutNotes.trim()
            : undefined,
      };
      setSelectedServices((prev) => [...prev, haircutItem]);
      toast.success(`Added ${style.name} to booking.`);
    }
  };

  const toggleWaxingOption = (option: WaxingServiceOption) => {
    const exists = isServiceSelected(option.id);
    if (exists) {
      removeService(option.id);
      toast.info(`Removed ${option.name} from booking.`);
    } else {
      const waxingItem: SelectedParlourService = {
        id: option.id,
        category: "Waxing",
        name: option.name,
        displayName: option.shortName || option.name,
        price: option.price,
        duration_minutes: option.durationMinutes,
        description: option.description,
        notes:
          (option.id === "wax-other-custom" || option.name.toLowerCase().includes("other")) &&
          customWaxingNotes.trim()
            ? customWaxingNotes.trim()
            : undefined,
      };
      setSelectedServices((prev) => [...prev, waxingItem]);
      toast.success(`Added ${option.shortName || option.name} to booking.`);
    }
  };

  const toggleHandsFeetOption = (option: HandsFeetServiceOption) => {
    const exists = isServiceSelected(option.id);
    if (exists) {
      removeService(option.id);
      toast.info(`Removed ${option.name} from booking.`);
    } else {
      const hfItem: SelectedParlourService = {
        id: option.id,
        category: "Hands & Feet",
        name: option.name,
        displayName: option.shortName || option.name,
        price: option.price,
        duration_minutes: option.durationMinutes,
        description: option.description,
        notes: customHandsFeetNotes.trim() || undefined,
      };
      setSelectedServices((prev) => [...prev, hfItem]);
      toast.success(`Added ${option.name} to booking.`);
    }
  };

  const toggleStandardService = (service: ServiceRow) => {
    const exists = isServiceSelected(service.id);
    if (exists) {
      removeService(service.id);
      toast.info(`Removed ${service.name} from booking.`);
    } else {
      const item: SelectedParlourService = {
        id: service.id,
        category: service.category,
        name: service.name,
        displayName: service.name,
        price: service.price,
        duration_minutes: service.duration_minutes || 30,
      };
      setSelectedServices((prev) => [...prev, item]);
      toast.success(`Added ${service.name} to booking.`);
    }
  };

  // Handle area change
  const handleAreaChange = (areaName: string) => {
    setSelectedArea(areaName);
    const found = LUCKNOW_POPULAR_AREAS.find((a) => a.name === areaName);
    if (found && found.name !== "Custom / Enter Distance Manually") {
      setDistanceKm(found.distanceKm);
      if (!pickupAddress || pickupAddress.length < 10) {
        setPickupAddress(`${found.name.split("/")[0]?.trim()}, Lucknow`);
      }
    }
  };

  // Optional GPS location detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        const dist = calculateDistanceKm(SHOP.lat, SHOP.lng, latitude, longitude);
        setDistanceKm(dist);
        setSelectedArea("Custom / Enter Distance Manually");

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          if (res.ok) {
            const data = await res.json();
            const fullReadable = data.display_name
              ? data.display_name.split(",").slice(0, 4).join(",").trim()
              : "";
            if (fullReadable) {
              setPickupAddress(fullReadable);
            }
          }
        } catch {
          // Ignore
        }

        const feeObj = calculateDeliveryFee(dist);
        if (feeObj.isFree) {
          toast.success(`Detected ~${dist} km from Salon. Within 5 km - 100% FREE!`);
        } else {
          toast.success(`Detected ~${dist} km: +₹${feeObj.deliveryFee} travel charge.`);
        }
      },
      () => {
        setIsDetectingGps(false);
        toast.info("Please select your area from the list or click 'Select on Google Map'.");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Toggle Pickup & Drop (no intrusive auto-prompt)
  const handleTogglePickupDrop = (enable: boolean) => {
    setNeedPickupDrop(enable);
  };

  // Calculated totals across all selected services
  const totalDuration = useMemo(() => {
    if (selectedServices.length === 0) return 30;
    return selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 30), 0);
  }, [selectedServices]);

  const servicesSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + Number(s.price || 0), 0);
  }, [selectedServices]);

  // Delivery / Pickup charges
  const pickupDropCalc = useMemo(() => {
    if (!needPickupDrop) {
      return { distanceKm: 0, isFree: true, extraKm: 0, deliveryFee: 0 };
    }
    return calculateDeliveryFee(distanceKm);
  }, [needPickupDrop, distanceKm]);

  // First-time Customer Discount (₹100)
  const discountAmount = useMemo(() => {
    if (!isFirstTimeCustomer || servicesSubtotal <= 0) return 0;
    return Math.min(FIRST_ORDER_DISCOUNT_AMOUNT, servicesSubtotal);
  }, [isFirstTimeCustomer, servicesSubtotal]);

  // Net payable total price
  const finalPayableTotal = useMemo(() => {
    return Math.max(0, servicesSubtotal + pickupDropCalc.deliveryFee - discountAmount);
  }, [servicesSubtotal, pickupDropCalc.deliveryFee, discountAmount]);

  const combinedServiceName = useMemo(() => {
    if (selectedServices.length === 0) return "";
    return selectedServices.map((s) => s.displayName || s.name).join(" + ");
  }, [selectedServices]);

  // Fetch booked slots for selected date to compute real-time capacity on both chairs
  const { data: dateBookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["date-bookings", date],
    enabled: Boolean(date),
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_booked_slots", { _target_date: date });
        if (!error && data) {
          return data as BookedSlotItem[];
        }
      } catch {
        // Fallback to direct select
      }
      const { data, error } = await supabase
        .from("appointments")
        .select("id, chair_id, time_slot, duration_minutes, end_time, status")
        .eq("appointment_date", date)
        .neq("status", "cancelled");
      if (error) throw error;
      return (data ?? []) as BookedSlotItem[];
    },
  });

  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set((services ?? []).map((s) => s.category)));
    const preferredOrder = [
      "Hair",
      "Threading",
      "Facials",
      "Skin",
      "Makeup",
      "Waxing",
      "Hands & Feet",
    ];
    const ordered: string[] = [];
    for (const cat of preferredOrder) {
      if (
        rawCategories.includes(cat) ||
        DEFAULT_PARLOUR_CATEGORIES.some((defaultCat) => defaultCat === cat)
      ) {
        ordered.push(cat);
      }
    }
    for (const cat of rawCategories) {
      if (!ordered.includes(cat)) {
        ordered.push(cat);
      }
    }
    return ordered.length > 0 ? ordered : (DEFAULT_PARLOUR_CATEGORIES as unknown as string[]);
  }, [services]);

  // Calculate slot capacities based on combined duration & 2-chair availability
  const slotAvailabilities = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateSlotAvailability>>();
    for (const time of TIME_SLOTS) {
      const avail = calculateSlotAvailability(time, totalDuration, dateBookings ?? []);
      map.set(time, avail);
    }
    return map;
  }, [totalDuration, dateBookings]);

  const selectedSlotAvailability = slot ? slotAvailabilities.get(slot) : null;
  const isSelectedSlotAvailable = Boolean(
    selectedSlotAvailability &&
    selectedSlotAvailability.isAvailable &&
    !selectedSlotAvailability.exceedsClosingTime,
  );

  const booking = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first.");
      if (selectedServices.length === 0) {
        throw new Error(
          "Please select at least one parlour service (e.g. Haircut, Waxing, Facial).",
        );
      }
      if (!date) throw new Error("Please select an appointment date.");
      if (!slot) throw new Error("Please select a time slot.");
      if (date < today) throw new Error("Appointment date cannot be in the past.");
      if (needPickupDrop && (!pickupAddress || pickupAddress.trim().length < 5)) {
        throw new Error("Please enter your complete address for pickup and drop service.");
      }

      const validPayment = payment === "upi" ? "upi" : "shop";
      const customerName = (profile?.full_name ?? user.email?.split("@")[0] ?? "Customer")
        .trim()
        .slice(0, 100);
      const customerPhone = (profile?.phone ?? "").trim().slice(0, 20);

      // 1. Re-check real-time chair availability to protect against race conditions
      let latestBookings: BookedSlotItem[] = [];
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc("get_booked_slots", {
          _target_date: date,
        });
        if (!rpcErr && rpcData) {
          latestBookings = rpcData as BookedSlotItem[];
        } else {
          throw new Error("RPC fallback");
        }
      } catch {
        const { data: fallbackData } = await supabase
          .from("appointments")
          .select("id, chair_id, time_slot, duration_minutes, end_time, status")
          .eq("appointment_date", date)
          .neq("status", "cancelled");
        latestBookings = (fallbackData ?? []) as BookedSlotItem[];
      }

      const verifiedAvail = calculateSlotAvailability(slot, totalDuration, latestBookings);

      if (!verifiedAvail.isAvailable || !verifiedAvail.suggestedChair) {
        throw new Error(
          "That slot was just booked by another customer. Please choose another available time.",
        );
      }

      const assignedChair = verifiedAvail.suggestedChair;
      const calculatedEndTime = verifiedAvail.endTime;

      // 2. Format description with pickup/drop and pricing summary
      const detailedServiceDescription = `${combinedServiceName}${
        needPickupDrop
          ? ` [Pickup & Drop: ${selectedArea}, ~${distanceKm}km, Fee: ${inr(pickupDropCalc.deliveryFee)} | Address: ${pickupAddress.trim()}]`
          : " [Walk-in]"
      }${discountAmount > 0 ? ` [1st-Time Discount: -${inr(discountAmount)}]` : ""}`;

      const primaryServiceId =
        selectedServices.length === 1 &&
        !selectedServices[0].id.startsWith("wax-") &&
        !selectedServices[0].id.startsWith("hf-") &&
        !selectedServices[0].id.startsWith("haircut-")
          ? selectedServices[0].id
          : null;

      const { data: inserted, error: insertError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          service_id: primaryServiceId,
          service_name: detailedServiceDescription,
          price: finalPayableTotal,
          appointment_date: date,
          time_slot: slot,
          duration_minutes: totalDuration,
          end_time: calculatedEndTime,
          chair_id: assignedChair,
          payment_method: validPayment,
          customer_name: customerName,
          customer_phone: customerPhone,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        id: inserted?.id ?? "APT-" + Date.now().toString().slice(-6),
        service_name: combinedServiceName,
        services_count: selectedServices.length,
        services_subtotal: servicesSubtotal,
        has_pickup_drop: needPickupDrop,
        distance_km: distanceKm,
        pickup_fee: pickupDropCalc.deliveryFee,
        discount_amount: discountAmount,
        price: finalPayableTotal,
        appointment_date: date,
        time_slot: slot,
        end_time: calculatedEndTime,
        duration_minutes: totalDuration,
        chair_id: assignedChair,
        customer_name: customerName,
        payment_method: validPayment,
        pickup_address: needPickupDrop ? pickupAddress : undefined,
        status: "pending",
      } as ConfirmedAppointment;
    },
    onSuccess: (confirmed) => {
      setConfirmedBooking(confirmed);
      toast.success(
        payment === "upi"
          ? `Slot reserved on ${confirmed.chair_id}! Pay via UPI to confirm.`
          : `Slot reserved on ${confirmed.chair_id}! Pay at shop.`,
      );
      queryClient.invalidateQueries({ queryKey: ["date-bookings", date] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Booking failed"),
  });

  const canBook =
    selectedServices.length > 0 &&
    Boolean(date) &&
    Boolean(slot) &&
    isSelectedSlotAvailable &&
    (!needPickupDrop || (Boolean(pickupAddress) && pickupAddress.trim().length >= 5));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />2 Premium Workstations · Kabir Pur, Lucknow
          </div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
            Parlour Services & Salon Booking
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Select multiple parlour services to book together. System calculates combined duration,
            auto-allocates workstations, provides Lucknow pickup & drop service (free within 5 km),
            and applies ₹100 first-time customer discount.
          </p>
        </div>

        {/* Feature Highlights Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="border-primary/40 bg-primary/5 py-1 px-3">
            <Car className="mr-1.5 size-3.5 text-primary" /> Pickup & Drop (5 km Free)
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 py-1 px-3"
          >
            <Tag className="mr-1.5 size-3.5" /> ₹100 1st-Time Discount
          </Badge>
        </div>
      </div>

      {/* Main Grid: Left Catalog, Right Sticky Booking Card */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Categorized Services Catalog */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Alert for 1st Time Customer */}
          {isFirstTimeCustomer && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
                <BadgePercent className="size-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">🎉 1st Appointment Welcome Offer Active!</p>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                  Flat ₹100 discount is automatically deducted when you book your parlour service.
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading parlour services…
            </div>
          ) : (
            <Tabs defaultValue={categories[0] ?? "Hair"} className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 p-1 sm:grid-cols-4 lg:grid-cols-7">
                {categories.map((c) => (
                  <TabsTrigger key={c} value={c} className="text-xs py-2 font-medium">
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Hair Tab with Stylized Haircuts Sub-options */}
              <TabsContent value="Hair" className="mt-6 space-y-6">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scissors className="size-4 text-primary" />
                      <h3 className="font-display font-semibold text-base text-foreground">
                        Custom Haircut Styles & Options
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-background text-[11px]"
                    >
                      {inr(hairCutService?.price ?? 350)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select your preferred haircut type or styling. Tap multiple options or mix with
                    facials and waxing.
                  </p>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {HAIRCUT_SUB_OPTIONS.map((style) => {
                      const itemId = `haircut-${style.id}`;
                      const isSelected = isServiceSelected(itemId);
                      return (
                        <div
                          key={style.id}
                          onClick={() => toggleHaircutOption(style)}
                          className={`cursor-pointer rounded-lg border p-3 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                              : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {style.name}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                              {style.durationMinutes} mins
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                            {style.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-display font-bold text-xs text-primary">
                              {inr(hairCutService?.price ?? 350)}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              className="h-6 px-2 text-[10px] font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHaircutOption(style);
                              }}
                            >
                              {isSelected ? (
                                <span className="flex items-center gap-1">
                                  <Check className="size-3" /> Added
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Plus className="size-3" /> Add
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Haircut Note Input */}
                  <div className="pt-2">
                    <Label htmlFor="custom-haircut" className="text-xs text-muted-foreground">
                      Specific Haircut or Styling Instructions (Optional)
                    </Label>
                    <Input
                      id="custom-haircut"
                      placeholder="e.g. Feather layers with side bangs, short shoulder length..."
                      value={customHaircutNotes}
                      onChange={(e) => setCustomHaircutNotes(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* Other Hair Services in Catalog */}
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-sm text-foreground">
                    Hair Treatments, Spa & Coloring
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(services ?? [])
                      .filter(
                        (s) =>
                          s.category === "Hair" &&
                          !s.name.toLowerCase().includes("hair cut") &&
                          !s.name.toLowerCase().includes("haircut"),
                      )
                      .map((svc) => {
                        const isSelected = isServiceSelected(svc.id);
                        return (
                          <div
                            key={svc.id}
                            className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                : "border-border bg-card hover:border-primary/40"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-display font-semibold text-sm text-foreground">
                                  {svc.name}
                                </h5>
                                <span className="font-display font-bold text-sm text-primary shrink-0">
                                  {inr(svc.price)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="size-3 text-primary" />
                                <span>{svc.duration_minutes} mins</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t flex justify-end">
                              <Button
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className="h-7 text-xs"
                                onClick={() => toggleStandardService(svc)}
                              >
                                {isSelected ? (
                                  <span className="flex items-center gap-1">
                                    <Check className="size-3.5" /> Added
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Plus className="size-3.5" /> Add to Booking
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </TabsContent>

              {/* Waxing Tab with Body-parts Matrix */}
              <TabsContent value="Waxing" className="mt-6 space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <h3 className="font-display font-semibold text-base text-foreground">
                        Waxing Packages & Specific Body Parts
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-background text-[11px]"
                    >
                      Hygienic Strip & Rica Wax
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose from full body, arms, legs, underarms, or facial waxing. Multi-select
                    available.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {WAXING_SUB_OPTIONS.map((opt) => {
                    const isSelected = isServiceSelected(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-display font-semibold text-sm text-foreground">
                              {opt.name}
                            </h5>
                            <span className="font-display font-bold text-sm text-primary shrink-0">
                              {inr(opt.price)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {opt.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3 text-primary" />
                            <span>{opt.durationMinutes} mins</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className="h-7 text-xs"
                            onClick={() => toggleWaxingOption(opt)}
                          >
                            {isSelected ? (
                              <span className="flex items-center gap-1">
                                <Check className="size-3.5" /> Added
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Plus className="size-3.5" /> Add
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Hands & Feet Tab */}
              <TabsContent value="Hands & Feet" className="mt-6 space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hand className="size-4 text-primary" />
                      <h3 className="font-display font-semibold text-base text-foreground">
                        Manicure, Pedicure & Nail Care
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-background text-[11px]"
                    >
                      Aroma Spa Rituals
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Relaxing nail trimming, gentle scrub, cuticle nourishment, and reflexology
                    massage.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {HANDS_FEET_SUB_OPTIONS.map((opt) => {
                    const isSelected = isServiceSelected(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-display font-semibold text-sm text-foreground">
                              {opt.name}
                            </h5>
                            <span className="font-display font-bold text-sm text-primary shrink-0">
                              {inr(opt.price)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {opt.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3 text-primary" />
                            <span>{opt.durationMinutes} mins</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className="h-7 text-xs"
                            onClick={() => toggleHandsFeetOption(opt)}
                          >
                            {isSelected ? (
                              <span className="flex items-center gap-1">
                                <Check className="size-3.5" /> Added
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Plus className="size-3.5" /> Add
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Other Tabs (Threading, Facials, Skin, Makeup, etc.) */}
              {categories
                .filter((c) => c !== "Hair" && c !== "Waxing" && c !== "Hands & Feet")
                .map((cat) => {
                  const categoryMeta: Record<
                    string,
                    { title: string; badge: string; desc: string }
                  > = {
                    Threading: {
                      title: "Precision Threading & Facial Hair Clean Up",
                      badge: "Organic Thread & Soothing Gel",
                      desc: "Flawless eyebrow shaping, upper lip, forehead, and full face threading with cooling aloe.",
                    },
                    Facials: {
                      title: "Skin Radiance, Hydra & Bridal Glow Facials",
                      badge: "Herbal & Gold Rituals",
                      desc: "Deep cleansing, blackhead extraction, rejuvenating massage, and nourishing glow packs.",
                    },
                    Skin: {
                      title: "Skin Polishing, De-Tan & Bleach Therapy",
                      badge: "Dermatological Care",
                      desc: "Instant sun damage reversal, acne control, brightening bleach, and crystal skin polishing.",
                    },
                    Makeup: {
                      title: "Party, Engagement & Bridal HD Makeup",
                      badge: "Long-Lasting & Waterproof",
                      desc: "Professional makeup by expert artists with premium products, lashes, and saree draping.",
                    },
                  };
                  const meta = categoryMeta[cat] ?? {
                    title: `${cat} Services`,
                    badge: "Professional Care",
                    desc: `Explore our specialized ${cat.toLowerCase()} treatments and salon rituals.`,
                  };

                  return (
                    <TabsContent key={cat} value={cat} className="mt-6 space-y-4">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            <h3 className="font-display font-semibold text-base text-foreground">
                              {meta.title}
                            </h3>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-primary/40 bg-background text-[11px]"
                          >
                            {meta.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{meta.desc}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {(services ?? [])
                          .filter((s) => s.category === cat)
                          .map((svc) => {
                            const isSelected = isServiceSelected(svc.id);
                            return (
                              <div
                                key={svc.id}
                                className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                    : "border-border bg-card hover:border-primary/40"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <h5 className="font-display font-semibold text-sm text-foreground">
                                      {svc.name}
                                    </h5>
                                    <span className="font-display font-bold text-sm text-primary shrink-0">
                                      {inr(svc.price)}
                                    </span>
                                  </div>
                                  {svc.description && (
                                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                      {svc.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="size-3 text-primary" />
                                    <span>{svc.duration_minutes} mins</span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-2 border-t flex justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    className="h-7 text-xs"
                                    onClick={() => toggleStandardService(svc)}
                                  >
                                    {isSelected ? (
                                      <span className="flex items-center gap-1">
                                        <Check className="size-3.5" /> Added
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <Plus className="size-3.5" /> Add
                                      </span>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>
                  );
                })}
            </Tabs>
          )}
        </div>

        {/* Right Sidebar: Sticky Live Booking & Pricing Card */}
        <Card className="h-fit lg:sticky lg:top-24 border-primary/20 shadow-elegant">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-display text-2xl">Book Your Slot</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select services & calculate total price automatically
                </p>
              </div>
              <Badge variant="secondary" className="font-semibold text-xs text-primary">
                {selectedServices.length} {selectedServices.length === 1 ? "Service" : "Services"}
              </Badge>
            </div>

            {/* Selected Services Itemized List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" /> Selected Services
                </span>
                {selectedServices.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllServices}
                    className="flex items-center gap-1 text-muted-foreground hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-3" /> Clear all
                  </button>
                )}
              </div>

              {selectedServices.length > 0 ? (
                <div className="space-y-2 rounded-xl border bg-secondary/30 p-3">
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedServices.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-card p-2 text-xs shadow-2xs border border-border/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground truncate">
                            {item.displayName || item.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="text-primary font-medium">{item.category}</span>
                            <span>•</span>
                            <span className="font-mono">{item.duration_minutes}m</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold font-display text-primary">
                            {inr(item.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeService(item.id)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Duration Bar */}
                  <div className="border-t pt-2 flex items-center justify-between text-xs font-medium text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      <span>
                        Total Treatment Time: <strong>{totalDuration} mins</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground bg-muted/20 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-medium text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    <span>No services selected yet</span>
                  </div>
                  <p>
                    Browse tabs on the left to add haircuts, waxing, facials, or makeup to your
                    appointment.
                  </p>
                </div>
              )}
            </div>

            {/* Pickup & Drop Service Toggle & Distance Calculator */}
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="size-4 text-primary" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Need Salon Pickup & Drop?
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Auto-detects GPS distance & adds extra charges beyond 5 km
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePickupDrop(false)}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                      !needPickupDrop
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePickupDrop(true)}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                      needPickupDrop
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Navigation className="size-3" />
                    Pickup & Drop
                  </button>
                </div>
              </div>

              {needPickupDrop && (
                <div className="space-y-3 pt-1 border-t border-border/60">
                  {/* Google Maps Interactive Picker Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="w-full h-9 text-xs font-semibold border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <MapPin className="size-4 text-primary" />
                    <span>🗺️ Select / Search Location on Google Map</span>
                  </Button>

                  {/* Realtime Distance & Charge Banner with exact 9-5=4 km calculation */}
                  <div className="rounded-lg bg-muted/40 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between border border-border/60 gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span className="text-[11px] text-muted-foreground">
                        Distance from Salon:{" "}
                        <strong className="text-foreground font-mono">{distanceKm} km</strong>
                        {pickupDropCalc.isFree ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                            (Within 5 km Free Radius)
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium ml-1 font-mono">
                            ({distanceKm} - 5 = {pickupDropCalc.extraKm} km extra @ ₹{PER_KM_CHARGE}
                            /km)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pickupDropCalc.isFree ? (
                        <Badge
                          variant="outline"
                          className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-[10px]"
                        >
                          100% FREE
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-500/30 text-[10px] font-semibold"
                        >
                          +{inr(pickupDropCalc.deliveryFee)} ({pickupDropCalc.extraKm} km extra)
                        </Badge>
                      )}
                      <a
                        href={getGoogleMapsRouteUrl(
                          SHOP.lat,
                          SHOP.lng,
                          pickupAddress || selectedArea,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium shrink-0 bg-background px-2 py-0.5 rounded border shadow-2xs"
                        title="Check official driving route on Google Maps"
                      >
                        <span>Google Route</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Selected Locality</Label>
                      <Select value={selectedArea} onValueChange={handleAreaChange}>
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LUCKNOW_POPULAR_AREAS.map((a) => (
                            <SelectItem key={a.name} value={a.name} className="text-xs">
                              {a.name} ({a.distanceKm} km)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <Label className="text-[10px] flex items-center gap-1">
                          <Lock className="size-2.5 text-muted-foreground" /> Distance (Auto-Fixed)
                        </Label>
                        <span className="font-mono font-semibold text-primary">
                          {distanceKm} km
                        </span>
                      </div>
                      {/* Locked read-only distance tab based on location */}
                      <div className="flex items-center justify-between h-8 px-2.5 rounded-md border border-border/80 bg-muted/50 text-xs font-mono font-medium text-foreground select-none">
                        <span className="flex items-center gap-1.5">
                          <Lock className="size-3 text-muted-foreground/70" />
                          <span>{distanceKm} km</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-sans">
                          {pickupDropCalc.isFree
                            ? "Free (≤5km)"
                            : `+${pickupDropCalc.extraKm}km extra`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="pickup-addr"
                      className="text-[10px] text-muted-foreground flex items-center gap-1"
                    >
                      <MapPin className="size-2.5 text-primary" /> Pickup & Drop Address
                    </Label>
                    <Input
                      id="pickup-addr"
                      placeholder="House / flat number, landmark, area in Lucknow..."
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="text-xs h-8 mt-1"
                      required={needPickupDrop}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="booking-date"
                className="flex items-center justify-between text-xs font-semibold"
              >
                <span>1. Select Date</span>
                {isBookingsLoading && Boolean(date) && (
                  <span className="text-[11px] text-muted-foreground">Checking live slots…</span>
                )}
              </Label>
              <Input
                id="booking-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlot("");
                }}
              />
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <Label>2. Select Time Slot</Label>
                {date && (
                  <span className="text-[11px] text-muted-foreground">2 Workstations Active</span>
                )}
              </div>

              {!date ? (
                <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                  Select a date above to view workstation availability for {totalDuration} min total
                  service.
                </p>
              ) : (
                <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((time) => {
                    const avail = slotAvailabilities.get(time);
                    const isAvail = avail?.isAvailable && !avail?.exceedsClosingTime;
                    const isSelected = slot === time;

                    let badgeText = "2 Chairs Free";
                    let badgeClass =
                      "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60";

                    if (avail?.exceedsClosingTime) {
                      badgeText = "Past 9 PM";
                      badgeClass = "text-muted-foreground bg-muted";
                    } else if (avail?.availableCount === 1) {
                      badgeText = "1 Chair Left";
                      badgeClass =
                        "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60";
                    } else if (avail?.availableCount === 0) {
                      badgeText = "Fully Booked";
                      badgeClass =
                        "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60";
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!isAvail}
                        onClick={() => setSlot(time)}
                        className={`flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs ring-1 ring-primary"
                            : isAvail
                              ? "bg-card hover:border-primary/60 hover:bg-accent/40"
                              : "cursor-not-allowed border-muted bg-muted/40 opacity-50"
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-primary-foreground" : "text-foreground"
                          }`}
                        >
                          {time}
                        </span>
                        <span
                          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                            isSelected
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : badgeClass
                          }`}
                        >
                          {badgeText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedServices.length > 0 && slot && selectedSlotAvailability && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    {slot} – {selectedSlotAvailability.endTime}
                  </span>
                  <Badge variant="outline" className="border-primary/40 bg-background text-[11px]">
                    {totalDuration} mins Total
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Armchair className="size-3.5 text-primary shrink-0" />
                  <span>
                    Auto-assigned to{" "}
                    <strong className="text-foreground font-semibold">
                      {selectedSlotAvailability.suggestedChair}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Payment Mode Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">3. Payment Mode</Label>
              <RadioGroup value={payment} onValueChange={setPayment} className="gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="upi" id="pay-upi" />
                  <Label htmlFor="pay-upi" className="font-normal text-xs cursor-pointer">
                    Online UPI ({SHOP.phone})
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="shop" id="pay-shop" />
                  <Label htmlFor="pay-shop" className="font-normal text-xs cursor-pointer">
                    Pay at shop after service
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Final Price Breakdown Box */}
            <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Receipt className="size-3.5 text-primary" />
                  <span>Price Breakdown</span>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                  {selectedServices.length} Selected
                </Badge>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Services Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  {inr(servicesSubtotal)}
                </span>
              </div>

              {needPickupDrop && (
                <div className="flex justify-between text-muted-foreground">
                  <div>
                    <span>Pickup & Drop ({distanceKm} km)</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {distanceKm <= FREE_DELIVERY_RADIUS_KM
                        ? "Within 5 km radius (Free)"
                        : `${pickupDropCalc.extraKm} km extra @ ₹${PER_KM_CHARGE}/km`}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-medium ${
                      pickupDropCalc.isFree
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {pickupDropCalc.isFree ? "FREE (₹0)" : `+${inr(pickupDropCalc.deliveryFee)}`}
                  </span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="size-3" /> 1st Order Welcome Discount
                  </span>
                  <span className="font-mono font-bold">-{inr(discountAmount)}</span>
                </div>
              )}

              {/* Net Total */}
              <div className="border-t border-dashed pt-2.5 flex items-baseline justify-between">
                <div>
                  <span className="font-display font-bold text-sm text-foreground block">
                    Final Payable Total
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {needPickupDrop
                      ? "Treatments + Pickup & Drop"
                      : "All salon treatments included"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-xl text-primary font-mono block">
                    {inr(finalPayableTotal)}
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      You saved {inr(discountAmount)}!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user ? (
              <Button
                className="w-full font-semibold shadow-md"
                disabled={!canBook || booking.isPending}
                onClick={() => booking.mutate()}
              >
                {booking.isPending
                  ? "Reserving Chair…"
                  : selectedServices.length > 0
                    ? `Confirm Booking (${selectedServices.length} ${selectedServices.length === 1 ? "Service" : "Services"}) • ${inr(finalPayableTotal)}`
                    : "Select Services to Book"}
              </Button>
            ) : (
              <Button className="w-full font-semibold" onClick={openAuth}>
                Sign in to Book
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={Boolean(confirmedBooking)} onOpenChange={() => setConfirmedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="text-center font-display text-2xl">
              Appointment Reserved!
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Your workstation is locked in. We look forward to welcoming you!
            </DialogDescription>
          </DialogHeader>

          {confirmedBooking && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Booking Ref</span>
                  <span className="font-mono text-xs font-semibold">
                    #{confirmedBooking.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{confirmedBooking.customer_name}</span>
                </div>
                <div className="flex justify-between items-start gap-2 border-b pb-2">
                  <span className="text-muted-foreground">Services Booked</span>
                  <div className="text-right">
                    <span className="font-medium text-primary block max-w-[200px] truncate">
                      {confirmedBooking.service_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {confirmedBooking.services_count}{" "}
                      {confirmedBooking.services_count === 1 ? "service" : "services"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Slot</span>
                  <span className="font-medium">
                    {confirmedBooking.appointment_date} ({confirmedBooking.time_slot} –{" "}
                    {confirmedBooking.end_time})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assigned Workstation</span>
                  <Badge className="bg-primary text-primary-foreground">
                    <Armchair className="mr-1 size-3" /> {confirmedBooking.chair_id}
                  </Badge>
                </div>
                {confirmedBooking.has_pickup_drop && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup & Drop</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {confirmedBooking.pickup_address} (~{confirmedBooking.distance_km} km)
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Services Subtotal</span>
                  <span className="font-mono">{inr(confirmedBooking.services_subtotal)}</span>
                </div>
                {confirmedBooking.has_pickup_drop && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup & Drop Fee</span>
                    <span className="font-mono">
                      {confirmedBooking.pickup_fee === 0
                        ? "FREE (Within 5 km)"
                        : inr(confirmedBooking.pickup_fee)}
                    </span>
                  </div>
                )}
                {confirmedBooking.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>1st Order Welcome Discount</span>
                    <span className="font-mono">-{inr(confirmedBooking.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-primary text-base">
                  <span>Final Total Amount</span>
                  <span className="font-mono">{inr(confirmedBooking.price)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payment Mode</span>
                  <span className="font-medium">
                    {confirmedBooking.payment_method === "upi"
                      ? `UPI (${SHOP.phone})`
                      : "Pay at Shop"}
                  </span>
                </div>
              </div>

              {confirmedBooking.payment_method === "upi" && (
                <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">UPI Payment Details:</p>
                  <p className="mt-0.5">
                    Please transfer {inr(confirmedBooking.price)} to UPI ID{" "}
                    <strong>{SHOP.upiId}</strong> ({SHOP.phone}) referencing ref #
                    {confirmedBooking.id.slice(0, 8).toUpperCase()}.
                  </p>
                </div>
              )}

              {/* Heartfelt Official Thank You Banner */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-center text-emerald-900 dark:text-emerald-200">
                <p className="font-bold text-xs flex items-center justify-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-600" />
                  Thank you for choosing Shivi Parlour & Boutique!
                </p>
                <p className="text-[11px] mt-1 text-emerald-800/80 dark:text-emerald-300/80">
                  Your workstation ({confirmedBooking.chair_id}) has been reserved. You can send the
                  full branded bill directly to your WhatsApp with one click below!
                </p>
              </div>

              {/* Direct WhatsApp Bill Action */}
              <Button
                type="button"
                className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => {
                  const msg = generateAppointmentWhatsAppText(confirmedBooking);
                  openWhatsAppBill(confirmedBooking.customer_phone, msg);
                  toast.success("Opening WhatsApp with your official bill...");
                }}
              >
                <MessageCircle className="size-4 mr-2 fill-white" />
                📲 Send Bill to WhatsApp
              </Button>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmedBooking(null)}
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
      {/* Google Maps Location & Distance Modal */}
      <GoogleMapsLocationPicker
        open={isMapPickerOpen}
        onOpenChange={setIsMapPickerOpen}
        currentAddress={pickupAddress}
        currentDistanceKm={distanceKm}
        modeTitle="Salon Pickup & Drop"
        onConfirm={(res) => {
          setDistanceKm(res.distanceKm);
          setPickupAddress(res.address);
          setSelectedArea(res.areaName);
          if (res.isFree) {
            toast.success(
              `Location set: ~${res.distanceKm} km (Within 5 km - 100% FREE Pickup & Drop)`,
            );
          } else {
            toast.success(
              `Location set: ~${res.distanceKm} km (+${inr(res.extraFee)} travel charge)`,
            );
          }
        }}
      />
    </div>
  );
}
