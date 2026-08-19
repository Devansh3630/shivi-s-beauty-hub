import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OUTFIT_TYPES, TIME_SLOTS, inr } from "@/lib/shop";

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique Stitching & Home Tailor Visit — Shivi Boutique, Lucknow" },
      {
        name: "description",
        content:
          "Blouse, suit and dress stitching in Lucknow with free home measurement and cloth pickup. Book a home tailor visit online.",
      },
      { property: "og:title", content: "Boutique Stitching & Home Tailor Visit — Lucknow" },
      {
        property: "og:description",
        content: "Custom stitching designs plus home measurement and cloth pickup across Lucknow.",
      },
    ],
  }),
  component: BoutiquePage,
});

function BoutiquePage() {
  const { user, profile, openAuth } = useAuth();
  const [form, setForm] = useState({
    outfit_type: "Blouses",
    address: "",
    preferred_date: "",
    preferred_slot: TIME_SLOTS[0] as string,
    notes: "",
    name: "",
    phone: "",
  });

  const { data: designs } = useQuery({
    queryKey: ["boutique_designs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_designs")
        .select("id, outfit_type, name, stitching_price, image_url")
        .order("outfit_type");
      if (error) throw error;
      return data;
    },
  });

  const request = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first.");
      const { error } = await supabase.from("tailor_visits").insert({
        user_id: user.id,
        customer_name: form.name || profile?.full_name || "",
        customer_phone: form.phone || profile?.phone || "",
        outfit_type: form.outfit_type,
        address: form.address,
        preferred_date: form.preferred_date,
        preferred_slot: form.preferred_slot,
        notes: form.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Home tailor visit requested! We'll call you to confirm the timing.");
      setForm((prev) => ({ ...prev, address: "", preferred_date: "", notes: "" }));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Request failed"),
  });

  const groups = Array.from(new Set((designs ?? []).map((d) => d.outfit_type)));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Boutique & Home Tailor Service</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Popular stitching designs with fixed prices, plus a tailor who comes to your home anywhere in
        Lucknow for measurement and cloth pickup.
      </p>

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="font-display text-2xl">{group}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(designs ?? [])
                .filter((d) => d.outfit_type === group)
                .map((design) => (
                  <Card key={design.id} className="overflow-hidden py-0 shadow-soft">
                    <img
                      src={design.image_url}
                      alt={design.name}
                      loading="lazy"
                      width={600}
                      height={400}
                      className="h-52 w-full object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-medium">{design.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Stitching from{" "}
                        <span className="font-display text-base text-primary">
                          {inr(design.stitching_price)}
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>

      <Card id="home-visit" className="mt-14 shadow-elegant">
        <CardContent className="p-6 md:p-8">
          <h2 className="font-display text-3xl">Book a Home Tailor Visit</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We visit your address in Lucknow, take measurements and pick up your cloth — no extra
            charge on stitching orders above ₹1,500.
          </p>

          <form
            className="mt-6 grid gap-5 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              request.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="visit-name">Full name</Label>
              <Input
                id="visit-name"
                value={form.name || profile?.full_name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit-phone">Phone number</Label>
              <Input
                id="visit-phone"
                type="tel"
                value={form.phone || profile?.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit-outfit">Outfit type</Label>
              <Select
                value={form.outfit_type}
                onValueChange={(value) => setForm({ ...form, outfit_type: value })}
              >
                <SelectTrigger id="visit-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTFIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit-date">Preferred date</Label>
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
              <Label htmlFor="visit-slot">Preferred time</Label>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="visit-address">Delivery address in Lucknow</Label>
              <Textarea
                id="visit-address"
                rows={3}
                placeholder="House / flat, street, locality, landmark, pin code"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="visit-notes">Design notes (optional)</Label>
              <Textarea
                id="visit-notes"
                rows={2}
                placeholder="Sleeve style, neck design, occasion, deadline…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              {user ? (
                <Button type="submit" size="lg" disabled={request.isPending}>
                  {request.isPending ? "Sending request…" : "Request home visit"}
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={openAuth}>
                  Sign in to request a visit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
