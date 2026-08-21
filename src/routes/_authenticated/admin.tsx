import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Armchair, Calendar, Clock, Phone, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { inr, calculateEndTime } from "@/lib/shop";

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
type StatusType = (typeof STATUS_FLOW)[number];

function isStatusType(status: string): status is StatusType {
  return (STATUS_FLOW as readonly string[]).includes(status);
}

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [newOffer, setNewOffer] = useState({ title: "", description: "" });
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(todayStr);

  const appointments = useQuery({
    queryKey: ["admin", "appointments"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, service_name, price, appointment_date, time_slot, duration_minutes, end_time, chair_id, status, payment_method, customer_name, customer_phone",
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
      if (!isStatusType(input.status)) {
        throw new Error("Invalid status provided.");
      }
      const { error } = await supabase
        .from(input.table)
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["date-bookings"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  const reassignChair = useMutation({
    mutationFn: async (input: { id: string; chair_id: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ chair_id: input.chair_id })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workstation chair reassigned");
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
      queryClient.invalidateQueries({ queryKey: ["date-bookings"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Chair reassignment failed"),
  });

  const updatePrice = useMutation({
    mutationFn: async (input: { id: string; price: number }) => {
      const price = Number(input.price);
      if (isNaN(price) || price < 0 || price > 1000000) {
        throw new Error("Please enter a valid price between ₹0 and ₹10,00,000.");
      }
      const { error } = await supabase.from("services").update({ price }).eq("id", input.id);
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
      const cleanTitle = newOffer.title.trim();
      const cleanDesc = newOffer.description.trim().slice(0, 500);
      if (!cleanTitle || cleanTitle.length < 3 || cleanTitle.length > 120) {
        throw new Error("Offer title must be between 3 and 120 characters.");
      }
      const { error } = await supabase.from("offers").insert({
        title: cleanTitle,
        description: cleanDesc,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offer published");
      setNewOffer({ title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save offer"),
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

  // Filter appointments for the 2-Chair Schedule Timeline
  const scheduleAppointments = useMemo(() => {
    const list = appointments.data ?? [];
    if (!selectedScheduleDate) return list;
    return list.filter((a) => a.appointment_date === selectedScheduleDate);
  }, [appointments.data, selectedScheduleDate]);

  const chair1Bookings = useMemo(
    () =>
      scheduleAppointments
        .filter((a) => (a.chair_id || "Chair 1") === "Chair 1")
        .sort((a, b) => a.time_slot.localeCompare(b.time_slot)),
    [scheduleAppointments],
  );

  const chair2Bookings = useMemo(
    () =>
      scheduleAppointments
        .filter((a) => a.chair_id === "Chair 2")
        .sort((a, b) => a.time_slot.localeCompare(b.time_slot)),
    [scheduleAppointments],
  );

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage two-chair salon appointments, boutique orders, tailor home visits, and pricing.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <Armchair className="size-4 text-primary" />
          <span>2 Service Workstations Active</span>
        </div>
      </div>

      <Tabs defaultValue="appointments" className="mt-8">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="appointments">Appointments & Chairs</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="visits">Home visits</TabsTrigger>
          <TabsTrigger value="prices">Price list</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6 space-y-8">
          {/* Visual Two-Chair Daily Workstation Schedule Board */}
          <Card className="border-primary/20 bg-linear-to-b from-card to-card/60">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Armchair className="size-5 text-primary" /> 2-Chair Daily Workstation Schedule
                </CardTitle>
                <CardDescription>
                  Side-by-side independent chair bookings for efficient parlour operation.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={selectedScheduleDate}
                  onChange={(e) => setSelectedScheduleDate(e.target.value)}
                  className="w-40 text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedScheduleDate(todayStr)}
                >
                  Today
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Chair 1 Column */}
                <div className="rounded-xl border bg-card/80 p-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-emerald-500" />
                      <h3 className="font-semibold text-foreground">Chair 1 (Workstation A)</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chair1Bookings.length} Booked
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-3">
                    {chair1Bookings.map((b) => {
                      const dur = b.duration_minutes || 30;
                      const end = b.end_time || calculateEndTime(b.time_slot, dur);
                      return (
                        <div
                          key={b.id}
                          className={`rounded-lg border p-3 text-xs transition-all ${
                            b.status === "cancelled"
                              ? "opacity-50 bg-muted/40 border-muted"
                              : "bg-card shadow-xs hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-primary text-sm">
                              {b.time_slot} – {end} ({dur}m)
                            </span>
                            <Badge
                              variant={
                                b.status === "confirmed"
                                  ? "default"
                                  : b.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-[10px] capitalize"
                            >
                              {b.status}
                            </Badge>
                          </div>

                          <p className="mt-1 font-medium text-foreground text-sm">
                            {b.service_name} · {inr(b.price)}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <User className="size-3.5 text-primary" />
                              <span>{b.customer_name || "Guest"}</span>
                              {b.customer_phone && (
                                <a
                                  href={`tel:${b.customer_phone}`}
                                  className="ml-1 text-primary hover:underline"
                                >
                                  ({b.customer_phone})
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusPicker
                                value={b.status}
                                onChange={(status) =>
                                  setStatus.mutate({ table: "appointments", id: b.id, status })
                                }
                              />
                              <Button
                                size="xs"
                                variant="ghost"
                                title="Switch to Chair 2"
                                onClick={() =>
                                  reassignChair.mutate({ id: b.id, chair_id: "Chair 2" })
                                }
                              >
                                Move to Chair 2
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {chair1Bookings.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No appointments on Chair 1 for {selectedScheduleDate}. Available all day!
                      </p>
                    )}
                  </div>
                </div>

                {/* Chair 2 Column */}
                <div className="rounded-xl border bg-card/80 p-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-sky-500" />
                      <h3 className="font-semibold text-foreground">Chair 2 (Workstation B)</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chair2Bookings.length} Booked
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-3">
                    {chair2Bookings.map((b) => {
                      const dur = b.duration_minutes || 30;
                      const end = b.end_time || calculateEndTime(b.time_slot, dur);
                      return (
                        <div
                          key={b.id}
                          className={`rounded-lg border p-3 text-xs transition-all ${
                            b.status === "cancelled"
                              ? "opacity-50 bg-muted/40 border-muted"
                              : "bg-card shadow-xs hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-primary text-sm">
                              {b.time_slot} – {end} ({dur}m)
                            </span>
                            <Badge
                              variant={
                                b.status === "confirmed"
                                  ? "default"
                                  : b.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-[10px] capitalize"
                            >
                              {b.status}
                            </Badge>
                          </div>

                          <p className="mt-1 font-medium text-foreground text-sm">
                            {b.service_name} · {inr(b.price)}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <User className="size-3.5 text-primary" />
                              <span>{b.customer_name || "Guest"}</span>
                              {b.customer_phone && (
                                <a
                                  href={`tel:${b.customer_phone}`}
                                  className="ml-1 text-primary hover:underline"
                                >
                                  ({b.customer_phone})
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusPicker
                                value={b.status}
                                onChange={(status) =>
                                  setStatus.mutate({ table: "appointments", id: b.id, status })
                                }
                              />
                              <Button
                                size="xs"
                                variant="ghost"
                                title="Switch to Chair 1"
                                onClick={() =>
                                  reassignChair.mutate({ id: b.id, chair_id: "Chair 1" })
                                }
                              >
                                Move to Chair 1
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {chair2Bookings.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No appointments on Chair 2 for {selectedScheduleDate}. Available all day!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Appointments Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Appointments History</CardTitle>
              <CardDescription>
                Comprehensive log of customer appointments with workstation assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service & Price</TableHead>
                    <TableHead>Workstation</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(appointments.data ?? []).map((row) => {
                    const dur = row.duration_minutes || 30;
                    const end = row.end_time || calculateEndTime(row.time_slot, dur);
                    const chair = row.chair_id || "Chair 1";

                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <span className="font-medium text-foreground">
                            {row.customer_name || "—"}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {row.customer_phone}
                          </span>
                        </TableCell>
                        <TableCell>
                          {row.service_name}
                          <span className="block text-xs text-primary font-medium">
                            {inr(row.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <select
                            className="rounded-md border bg-background px-2 py-1 text-xs"
                            value={chair}
                            onChange={(e) =>
                              reassignChair.mutate({ id: row.id, chair_id: e.target.value })
                            }
                          >
                            <option value="Chair 1">Chair 1</option>
                            <option value="Chair 2">Chair 2</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{row.appointment_date}</span>
                          <span className="block text-xs text-muted-foreground">
                            {row.time_slot} – {end} ({dur}m)
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs uppercase">
                            {row.payment_method === "upi" ? "UPI" : "Shop"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusPicker
                            value={row.status}
                            onChange={(status) =>
                              setStatus.mutate({ table: "appointments", id: row.id, status })
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
