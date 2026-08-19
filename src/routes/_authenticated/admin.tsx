import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Shivi Parlour & Boutique" },
      {
        name: "description",
        content:
          "Staff dashboard for Shivi Parlour & Boutique: manage appointments, orders, home tailor visits, prices and offers.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — Shivi Parlour & Boutique" },
      { property: "og:description", content: "Staff-only management dashboard." },
    ],
  }),
  component: AdminPage,
});

const STATUS_FLOW = ["pending", "confirmed", "completed", "cancelled"] as const;

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [newOffer, setNewOffer] = useState({ title: "", description: "" });

  const appointments = useQuery({
    queryKey: ["admin", "appointments"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, service_name, price, appointment_date, time_slot, status, payment_method, customer_name, customer_phone",
        )
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const orders = useQuery({
    queryKey: ["admin", "orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, items, total_amount, status, payment_method, customer_name, customer_phone, address, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const visits = useQuery({
    queryKey: ["admin", "visits"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tailor_visits")
        .select(
          "id, customer_name, customer_phone, outfit_type, address, preferred_date, preferred_slot, notes, status",
        )
        .order("preferred_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const services = useQuery({
    queryKey: ["admin", "services"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, category, name, price, is_active")
        .order("category");
      if (error) throw error;
      return data;
    },
  });

  const offers = useQuery({
    queryKey: ["admin", "offers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("id, title, description, is_active")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async (input: {
      table: "appointments" | "orders" | "tailor_visits";
      id: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from(input.table)
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  const updatePrice = useMutation({
    mutationFn: async (input: { id: string; price: number }) => {
      const { error } = await supabase
        .from("services")
        .update({ price: input.price })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Price updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  const saveOffer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("offers").insert(newOffer);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offer published");
      setNewOffer({ title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save offer"),
  });

  const toggleOffer = useMutation({
    mutationFn: async (input: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("offers")
        .update({ is_active: input.is_active })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });

  if (loading) {
    return <p className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">Checking access…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Staff access only</h1>
        <p className="mt-3 text-muted-foreground">
          This dashboard is limited to Shivi Parlour & Boutique staff accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Bookings, orders, home visits, prices and offers in one place.
      </p>

      <Tabs defaultValue="appointments" className="mt-8">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="visits">Home visits</TabsTrigger>
          <TabsTrigger value="prices">Price list</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(appointments.data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.customer_name || "—"}
                        <span className="block text-xs text-muted-foreground">
                          {row.customer_phone}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.service_name}
                        <span className="block text-xs text-muted-foreground">
                          {inr(row.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.appointment_date}
                        <span className="block text-xs text-muted-foreground">{row.time_slot}</span>
                      </TableCell>
                      <TableCell>{row.payment_method === "upi" ? "UPI" : "At shop"}</TableCell>
                      <TableCell>
                        <StatusPicker
                          value={row.status}
                          onChange={(status) =>
                            setStatus.mutate({ table: "appointments", id: row.id, status })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders.data ?? []).map((row) => {
                    const items = Array.isArray(row.items)
                      ? (row.items as Array<{ name?: string; quantity?: number }>)
                      : [];
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.customer_name || "—"}
                          <span className="block text-xs text-muted-foreground">
                            {row.customer_phone}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[16rem] text-xs">
                          {items
                            .map((item) => `${item.name ?? "Item"} ×${item.quantity ?? 1}`)
                            .join(", ")}
                        </TableCell>
                        <TableCell>{inr(row.total_amount)}</TableCell>
                        <TableCell className="max-w-[14rem] text-xs">
                          {row.address || "Shop pickup"}
                        </TableCell>
                        <TableCell>
                          <StatusPicker
                            value={row.status}
                            onChange={(status) =>
                              setStatus.mutate({ table: "orders", id: row.id, status })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Outfit</TableHead>
                    <TableHead>Preferred</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(visits.data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.customer_name || "—"}
                        <span className="block text-xs text-muted-foreground">
                          {row.customer_phone}
                        </span>
                      </TableCell>
                      <TableCell>{row.outfit_type}</TableCell>
                      <TableCell>
                        {row.preferred_date}
                        <span className="block text-xs text-muted-foreground">
                          {row.preferred_slot}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[16rem] text-xs">
                        {row.address}
                        {row.notes && (
                          <span className="block text-muted-foreground">{row.notes}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusPicker
                          value={row.status}
                          onChange={(status) =>
                            setStatus.mutate({ table: "tailor_visits", id: row.id, status })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices" className="mt-6 space-y-3">
          {(services.data ?? []).map((service) => (
            <PriceRow
              key={service.id}
              name={service.name}
              category={service.category}
              price={Number(service.price)}
              onSave={(price) => updatePrice.mutate({ id: service.id, price })}
            />
          ))}
        </TabsContent>

        <TabsContent value="offers" className="mt-6 space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-xl">Publish a new offer</h2>
              <div className="space-y-2">
                <Label htmlFor="offer-title">Title</Label>
                <Input
                  id="offer-title"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-desc">Description</Label>
                <Textarea
                  id="offer-desc"
                  rows={2}
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                />
              </div>
              <Button
                disabled={!newOffer.title || saveOffer.isPending}
                onClick={() => saveOffer.mutate()}
              >
                Publish offer
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {(offers.data ?? []).map((offer) => (
              <Card key={offer.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-medium">{offer.title}</p>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={offer.is_active ? "default" : "secondary"}>
                      {offer.is_active ? "Live" : "Hidden"}
                    </Badge>
                    <Switch
                      checked={offer.is_active}
                      onCheckedChange={(checked) =>
                        toggleOffer.mutate({ id: offer.id, is_active: checked })
                      }
                      aria-label={`Toggle ${offer.title}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusPicker({ value, onChange }: { value: string; onChange: (status: string) => void }) {
  return (
    <select
      className="rounded-md border bg-background px-2 py-1 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Change status"
    >
      {STATUS_FLOW.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

function PriceRow({
  name,
  category,
  price,
  onSave,
}: {
  name: string;
  category: string;
  price: number;
  onSave: (price: number) => void;
}) {
  const [value, setValue] = useState(String(price));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-3">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{category}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          className="w-28"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`Price for ${name}`}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={Number(value) === price}
          onClick={() => onSave(Number(value))}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
