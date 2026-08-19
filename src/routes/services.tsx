import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SHOP, TIME_SLOTS, inr } from "@/lib/shop";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Parlour Services & Price List — Shivi Parlour, Lucknow" },
      {
        name: "description",
        content:
          "Hair, skin, makeup, threading and facial services with prices. Pick a date and time slot and pay online by UPI or at the shop.",
      },
      { property: "og:title", content: "Parlour Services & Booking — Shivi Parlour, Lucknow" },
      {
        property: "og:description",
        content: "Browse the parlour price list and book your appointment slot online.",
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
};

function ServicesPage() {
  const { user, profile, openAuth } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ServiceRow | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>("");
  const [payment, setPayment] = useState("shop");

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, category, name, price, duration_minutes")
        .eq("is_active", true)
        .order("category")
        .order("price");
      if (error) throw error;
      return data as ServiceRow[];
    },
  });

  const categories = Array.from(new Set((services ?? []).map((s) => s.category)));

  const booking = useMutation({
    mutationFn: async () => {
      if (!user || !selected) throw new Error("Please sign in and pick a service.");
      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        service_id: selected.id,
        service_name: selected.name,
        price: selected.price,
        appointment_date: date,
        time_slot: slot,
        payment_method: payment,
        customer_name: profile?.full_name ?? "",
        customer_phone: profile?.phone ?? "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        payment === "upi"
          ? `Slot requested! Pay by UPI to ${SHOP.phone} to confirm.`
          : "Slot requested! Pay at the shop after your service.",
      );
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setSelected(null);
      setDate("");
      setSlot("");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Booking failed"),
  });

  const today = new Date().toISOString().slice(0, 10);
  const canBook = Boolean(selected && date && slot);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Parlour Services</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Choose a service, pick your slot and we'll keep the chair ready. Open daily {SHOP.hours}.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading price list…</p>
          ) : (
            <Tabs defaultValue={categories[0]}>
              <TabsList className="flex h-auto flex-wrap justify-start">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="mt-6 space-y-3">
                  {(services ?? [])
                    .filter((s) => s.category === category)
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-4 ${
                          selected?.id === service.id ? "border-primary shadow-soft" : ""
                        }`}
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.duration_minutes} min
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-display text-lg text-primary">
                            {inr(service.price)}
                          </span>
                          <Button
                            size="sm"
                            variant={selected?.id === service.id ? "default" : "outline"}
                            onClick={() => setSelected(service)}
                          >
                            {selected?.id === service.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-2xl">Book your slot</h2>

            <div className="rounded-lg bg-secondary/60 px-4 py-3 text-sm">
              {selected ? (
                <>
                  <span className="font-medium">{selected.name}</span> · {inr(selected.price)}
                </>
              ) : (
                <span className="text-muted-foreground">Select a service from the price list.</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-date">Date</Label>
              <Input
                id="booking-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Time slot</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSlot(time)}
                    className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                      slot === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment</Label>
              <RadioGroup value={payment} onValueChange={setPayment} className="gap-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="upi" id="pay-upi" />
                  <Label htmlFor="pay-upi" className="font-normal">
                    Online UPI ({SHOP.phone})
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="shop" id="pay-shop" />
                  <Label htmlFor="pay-shop" className="font-normal">
                    Pay at shop
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {user ? (
              <Button
                className="w-full"
                disabled={!canBook || booking.isPending}
                onClick={() => booking.mutate()}
              >
                {booking.isPending ? "Booking…" : "Confirm appointment"}
              </Button>
            ) : (
              <Button className="w-full" onClick={openAuth}>
                Sign in to book
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
