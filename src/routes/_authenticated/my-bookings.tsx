import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Armchair, Calendar, Clock, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { inr, calculateEndTime } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Shivi Parlour & Boutique" },
      {
        name: "description",
        content:
          "View your parlour appointments, cosmetics orders and home tailor visit requests with Shivi Parlour & Boutique, Lucknow.",
      },
      { property: "og:title", content: "My Bookings — Shivi Parlour & Boutique" },
      {
        property: "og:description",
        content: "Track your appointments, orders and tailor visits.",
      },
    ],
  }),
  component: MyBookings,
});

function MyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [appointments, orders, visits] = await Promise.all([
        supabase
          .from("appointments")
          .select(
            "id, service_name, price, appointment_date, time_slot, duration_minutes, end_time, chair_id, status, payment_method",
          )
          .order("appointment_date", { ascending: false }),
        supabase
          .from("orders")
          .select("id, total_amount, status, payment_method, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("tailor_visits")
          .select("id, outfit_type, preferred_date, preferred_slot, status, address")
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl">My Bookings & Orders</h1>
      <p className="mt-2 text-muted-foreground">
        Track your active appointments, cosmetics deliveries, and bespoke tailoring requests.
      </p>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Parlour Appointments</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/services">Book New Service</Link>
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {(data?.appointments ?? []).map((row) => {
            const chair = row.chair_id || "Chair 1";
            const duration = row.duration_minutes || 30;
            const endTime = row.end_time || calculateEndTime(row.time_slot, duration);
            const isCancellable = row.status === "pending" || row.status === "confirmed";

            return (
              <Card key={row.id} className="transition-all hover:border-primary/40">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground text-base">{row.service_name}</p>
                      <Badge
                        variant="outline"
                        className="text-xs font-mono bg-primary/5 text-primary border-primary/30"
                      >
                        <Armchair className="mr-1 size-3" /> {chair}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Calendar className="size-3.5 text-primary" /> {row.appointment_date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-primary" /> {row.time_slot} – {endTime} (
                        {duration}m)
                      </span>
                      <span>·</span>
                      <span>{row.payment_method === "upi" ? "Online UPI" : "Pay at shop"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-primary">{inr(row.price)}</span>
                    <Badge
                      variant={
                        row.status === "confirmed"
                          ? "default"
                          : row.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {row.status}
                    </Badge>
                    {isCancellable && (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-xs text-destructive hover:bg-destructive/10"
                        disabled={cancelAppointment.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to cancel this appointment? Your chair will be freed up for others.",
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
          {data?.appointments.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">No appointments booked yet.</p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/services">Explore Price List & Book</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Cosmetics Orders</h2>
        <div className="mt-4 space-y-3">
          {(data?.orders ?? []).map((row) => (
            <Card key={row.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium text-foreground">
                    Order #{row.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(row.created_at).toLocaleDateString("en-IN")} ·{" "}
                    {row.payment_method === "upi" ? "UPI" : "Pay on Delivery"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-primary">{inr(row.total_amount)}</span>
                  <Badge variant="secondary" className="capitalize">
                    {row.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Home Tailor Visits</h2>
        <div className="mt-4 space-y-3">
          {(data?.visits ?? []).map((row) => (
            <Card key={row.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium text-foreground">{row.outfit_type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.preferred_date} · {row.preferred_slot} · {row.address}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {row.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
          {data?.visits.length === 0 && (
            <p className="text-sm text-muted-foreground">No tailor visits requested yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
