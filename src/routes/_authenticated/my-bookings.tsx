import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Armchair,
  Calendar,
  Clock,
  MessageCircle,
  Printer,
  Sparkles,
  Scissors,
  ShoppingBag,
  CheckCircle2,
  FileText,
  Building2,
  PhoneCall,
  MapPin,
  X,
} from "lucide-react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  inr,
  calculateEndTime,
  SHOP,
  openWhatsAppBill,
  generateAppointmentWhatsAppText,
  generateTailorVisitWhatsAppText,
  generateCosmeticsOrderWhatsAppText,
  type AppointmentReceiptData,
  type TailorVisitReceiptData,
  type CosmeticsOrderReceiptData,
} from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings & Bills — Shivi Parlour & Boutique" },
      {
        name: "description",
        content:
          "View your parlour appointments, cosmetics orders and home tailor visit requests with Shivi Parlour & Boutique, Lucknow.",
      },
      { property: "og:title", content: "My Bookings & Bills — Shivi Parlour & Boutique" },
      {
        property: "og:description",
        content: "Track your appointments, orders and tailor visits.",
      },
    ],
  }),
  component: MyBookings,
});

type ActiveReceipt =
  | { type: "appointment"; data: AppointmentReceiptData }
  | { type: "visit"; data: TailorVisitReceiptData }
  | { type: "order"; data: CosmeticsOrderReceiptData }
  | null;

function MyBookings() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "parlour" | "boutique" | "cosmetics">("all");
  const [activeReceipt, setActiveReceipt] = useState<ActiveReceipt>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [appointments, orders, visits] = await Promise.all([
        supabase
          .from("appointments")
          .select(
            "id, service_name, price, appointment_date, time_slot, duration_minutes, end_time, chair_id, status, payment_method, customer_name, customer_phone",
          )
          .order("appointment_date", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, items, total_amount, status, payment_method, customer_name, customer_phone, address, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("tailor_visits")
          .select(
            "id, outfit_type, preferred_date, preferred_slot, status, address, customer_name, customer_phone, notes",
          )
          .order("preferred_date", { ascending: false }),
      ]);
      return {
        appointments: appointments.data ?? [],
        orders: orders.data ?? [],
        visits: visits.data ?? [],
      };
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appointment cancelled and chair released.");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["date-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to cancel appointment");
    },
  });

  const appointments = data?.appointments ?? [];
  const orders = data?.orders ?? [];
  const visits = data?.visits ?? [];
  const totalCount = appointments.length + orders.length + visits.length;

  function handleSendWhatsApp(receipt: ActiveReceipt) {
    if (!receipt) return;
    const customerPhone =
      ("customer_phone" in receipt.data ? receipt.data.customer_phone : null) ||
      profile?.phone ||
      "";

    let msg = "";
    if (receipt.type === "appointment") {
      msg = generateAppointmentWhatsAppText(receipt.data);
    } else if (receipt.type === "visit") {
      msg = generateTailorVisitWhatsAppText(receipt.data);
    } else if (receipt.type === "order") {
      msg = generateCosmeticsOrderWhatsAppText(receipt.data);
    }

    openWhatsAppBill(customerPhone, msg);
    toast.success("Opening WhatsApp with your official bill...");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Sparkles className="size-3.5" /> Official Customer Dashboard · Lucknow
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">My Bookings & Bills</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all your parlour chair reservations, boutique visits, and cosmetics orders with
            instant WhatsApp bills.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="shadow-xs">
            <Link to="/services">Book Parlour Slot</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/boutique">Boutique Tailoring</Link>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Records ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("parlour")}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === "parlour"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3.5" />
          Parlour Appointments ({appointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("boutique")}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === "boutique"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scissors className="size-3.5" />
          Tailor Visits ({visits.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cosmetics")}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === "cosmetics"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="size-3.5" />
          Cosmetics Orders ({orders.length})
        </button>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading your bookings and bills...
        </div>
      )}

      {/* Parlour Appointments Section */}
      {(activeTab === "all" || activeTab === "parlour") && (
        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Parlour Appointments
            </h2>
            <Badge variant="outline" className="text-xs">
              {appointments.length} Booked
            </Badge>
          </div>

          <div className="space-y-3">
            {appointments.map((row) => {
              const chair = row.chair_id || "Chair 1";
              const duration = row.duration_minutes || 30;
              const endTime = row.end_time || calculateEndTime(row.time_slot, duration);
              const isCancellable = row.status === "pending" || row.status === "confirmed";

              const receiptData: AppointmentReceiptData = {
                id: row.id,
                customer_name: row.customer_name || profile?.full_name || "Valued Customer",
                customer_phone: row.customer_phone || profile?.phone || "",
                service_name: row.service_name,
                price: row.price,
                appointment_date: row.appointment_date,
                time_slot: row.time_slot,
                end_time: endTime,
                duration_minutes: duration,
                chair_id: chair,
                payment_method: row.payment_method,
                status: row.status,
              };

              return (
                <Card key={row.id} className="transition-all hover:border-primary/40 shadow-xs">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground text-base">
                          {row.service_name}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs font-mono bg-primary/5 text-primary border-primary/30"
                        >
                          <Armchair className="mr-1 size-3" /> {chair}
                        </Badge>
                        <Badge
                          variant={
                            row.status === "confirmed"
                              ? "default"
                              : row.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize text-xs"
                        >
                          {row.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Calendar className="size-3.5 text-primary" /> {row.appointment_date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-primary" /> {row.time_slot} – {endTime} (
                          {duration}m)
                        </span>
                        <span>•</span>
                        <span>Ref #{row.id.slice(0, 8).toUpperCase()}</span>
                        <span>•</span>
                        <span>{row.payment_method === "upi" ? "Online UPI" : "Pay at shop"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0">
                      <span className="font-display text-xl font-bold text-primary mr-2">
                        {inr(row.price)}
                      </span>

                      {/* WhatsApp Bill button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        onClick={() => {
                          const msg = generateAppointmentWhatsAppText(receiptData);
                          openWhatsAppBill(receiptData.customer_phone, msg);
                          toast.success("Opening WhatsApp with official bill...");
                        }}
                      >
                        <MessageCircle className="size-3.5 mr-1 text-emerald-600 fill-emerald-600" />
                        WhatsApp Bill
                      </Button>

                      {/* View & Print Receipt */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setActiveReceipt({ type: "appointment", data: receiptData })}
                      >
                        <FileText className="size-3.5 mr-1" />
                        Receipt
                      </Button>

                      {isCancellable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          disabled={cancelAppointment.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to cancel this appointment? Your chair slot will be released.",
                              )
                            ) {
                              cancelAppointment.mutate(row.id);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {appointments.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center bg-card/40">
                <p className="text-sm text-muted-foreground">No parlour appointments booked yet.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link to="/services">Book Parlour Chair & Services</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Boutique & Home Tailor Visits Section */}
      {(activeTab === "all" || activeTab === "boutique") && (
        <section className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl flex items-center gap-2">
              <Scissors className="size-5 text-primary" />
              Home Tailor Visits & Boutique Orders
            </h2>
            <Badge variant="outline" className="text-xs">
              {visits.length} Visits
            </Badge>
          </div>

          <div className="space-y-3">
            {visits.map((row) => {
              const receiptData: TailorVisitReceiptData = {
                id: row.id,
                customer_name: row.customer_name || profile?.full_name || "Valued Customer",
                customer_phone: row.customer_phone || profile?.phone || "",
                outfit_type: row.outfit_type,
                preferred_date: row.preferred_date,
                preferred_slot: row.preferred_slot,
                address: row.address,
                status: row.status,
              };

              return (
                <Card key={row.id} className="transition-all hover:border-primary/40 shadow-xs">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground text-base">{row.outfit_type}</p>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {row.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Date & Slot:</span>{" "}
                        {row.preferred_date} ({row.preferred_slot})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Address:</span> {row.address}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => {
                          const msg = generateTailorVisitWhatsAppText(receiptData);
                          openWhatsAppBill(receiptData.customer_phone, msg);
                          toast.success("Opening WhatsApp with tailor visit invoice...");
                        }}
                      >
                        <MessageCircle className="size-3.5 mr-1 text-emerald-600 fill-emerald-600" />
                        WhatsApp Bill
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setActiveReceipt({ type: "visit", data: receiptData })}
                      >
                        <FileText className="size-3.5 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {visits.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center bg-card/40">
                <p className="text-sm text-muted-foreground">
                  No home tailor visits requested yet.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link to="/boutique">Request Home Tailor Visit</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cosmetics Orders Section */}
      {(activeTab === "all" || activeTab === "cosmetics") && (
        <section className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              Cosmetics Store Orders
            </h2>
            <Badge variant="outline" className="text-xs">
              {orders.length} Orders
            </Badge>
          </div>

          <div className="space-y-3">
            {orders.map((row) => {
              const receiptData: CosmeticsOrderReceiptData = {
                id: row.id,
                customer_name: row.customer_name || profile?.full_name || "Valued Customer",
                customer_phone: row.customer_phone || profile?.phone || "",
                items: row.items,
                total_amount: row.total_amount,
                payment_method: row.payment_method,
                address: row.address,
                status: row.status,
                created_at: row.created_at,
              };

              return (
                <Card key={row.id} className="transition-all hover:border-primary/40 shadow-xs">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground text-base">
                          Order #{row.id.slice(0, 8).toUpperCase()}
                        </p>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {row.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString("en-IN")} ·{" "}
                        {row.payment_method === "upi" ? "UPI Payment" : "Cash on Delivery"}
                      </p>
                      {row.address && (
                        <p className="text-xs text-muted-foreground">Delivery: {row.address}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0">
                      <span className="font-display text-xl font-bold text-primary mr-2">
                        {inr(row.total_amount)}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => {
                          const msg = generateCosmeticsOrderWhatsAppText(receiptData);
                          openWhatsAppBill(receiptData.customer_phone, msg);
                          toast.success("Opening WhatsApp with cosmetics invoice...");
                        }}
                      >
                        <MessageCircle className="size-3.5 mr-1 text-emerald-600 fill-emerald-600" />
                        WhatsApp Bill
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setActiveReceipt({ type: "order", data: receiptData })}
                      >
                        <FileText className="size-3.5 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {orders.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center bg-card/40">
                <p className="text-sm text-muted-foreground">No cosmetics orders placed yet.</p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link to="/cosmetics">Shop Cosmetics</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Official Printable Bill & Invoice Dialog */}
      <Dialog open={Boolean(activeReceipt)} onOpenChange={() => setActiveReceipt(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden print:max-w-none print:shadow-none print:border-none">
          {activeReceipt && (
            <div className="bg-background">
              {/* Official Shop Header Banner */}
              <div className="bg-primary/10 border-b p-5 text-center relative">
                <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground mb-2 shadow-xs">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{SHOP.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-primary" /> {SHOP.address}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <PhoneCall className="size-3 text-primary" /> Helpline: {SHOP.phoneIntl} · Open 10
                  AM - 9 PM
                </p>
                <div className="mt-2 inline-block rounded-full bg-primary/20 px-3 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Official Tax / Booking Invoice
                </div>
              </div>

              {/* Bill Details */}
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b pb-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Invoice Ref
                    </span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      #{activeReceipt.data.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Customer
                    </span>
                    <span className="font-semibold text-foreground">
                      {("customer_name" in activeReceipt.data
                        ? activeReceipt.data.customer_name
                        : null) || "Valued Customer"}
                    </span>
                    {"customer_phone" in activeReceipt.data &&
                      activeReceipt.data.customer_phone && (
                        <span className="block text-muted-foreground font-mono">
                          {activeReceipt.data.customer_phone}
                        </span>
                      )}
                  </div>
                </div>

                {/* Specific details */}
                {activeReceipt.type === "appointment" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booked Services:</span>
                      <span className="font-semibold text-foreground text-right max-w-[240px]">
                        {activeReceipt.data.service_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Slot:</span>
                      <span className="font-medium text-foreground">
                        {activeReceipt.data.appointment_date} ({activeReceipt.data.time_slot} –{" "}
                        {activeReceipt.data.end_time})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned Chair:</span>
                      <span className="font-semibold text-primary">
                        {activeReceipt.data.chair_id || "Chair 1"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium capitalize">
                        {activeReceipt.data.payment_method === "upi"
                          ? `UPI (${SHOP.upiId})`
                          : "Pay at Salon"}
                      </span>
                    </div>
                  </div>
                )}

                {activeReceipt.type === "visit" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outfits / Requirements:</span>
                      <span className="font-semibold text-foreground text-right max-w-[240px]">
                        {activeReceipt.data.outfit_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred Date & Slot:</span>
                      <span className="font-medium text-foreground">
                        {activeReceipt.data.preferred_date} ({activeReceipt.data.preferred_slot})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Home Address:</span>
                      <span className="font-medium text-right max-w-[240px]">
                        {activeReceipt.data.address}
                      </span>
                    </div>
                  </div>
                )}

                {activeReceipt.type === "order" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="font-medium">
                        {new Date(activeReceipt.data.created_at || Date.now()).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                    {activeReceipt.data.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Address:</span>
                        <span className="font-medium text-right max-w-[240px]">
                          {activeReceipt.data.address}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Mode:</span>
                      <span className="font-medium capitalize">
                        {activeReceipt.data.payment_method === "upi"
                          ? `UPI (${SHOP.upiId})`
                          : "Cash on Delivery"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Total box */}
                <div className="rounded-lg bg-primary/5 p-3 flex items-center justify-between border border-primary/20">
                  <span className="font-bold text-foreground text-sm">Total Payable</span>
                  <span className="font-display font-bold text-xl text-primary font-mono">
                    {inr(
                      activeReceipt.type === "appointment"
                        ? activeReceipt.data.price
                        : activeReceipt.type === "order"
                          ? activeReceipt.data.total_amount
                          : activeReceipt.data.final_total || activeReceipt.data.price || 0,
                    )}
                  </span>
                </div>

                {/* Heartfelt message */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center text-emerald-800 dark:text-emerald-300">
                  <p className="font-bold text-xs flex items-center justify-center gap-1">
                    💖 Thank you for choosing Shivi Parlour & Boutique! 💖
                  </p>
                  <p className="text-[11px] mt-0.5 text-emerald-700/80 dark:text-emerald-400/80">
                    We look forward to serving you with the highest quality salon & boutique
                    experience in Lucknow.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 print:hidden">
                  <Button
                    type="button"
                    className="flex-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleSendWhatsApp(activeReceipt)}
                  >
                    <MessageCircle className="size-4 mr-1.5 fill-white" />
                    Send to WhatsApp
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={handlePrint}>
                    <Printer className="size-4 mr-1.5" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
