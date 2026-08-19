import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/shop";

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

  const { data } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [appointments, orders, visits] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, service_name, price, appointment_date, time_slot, status, payment_method")
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl">My Bookings</h1>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Parlour appointments</h2>
        <div className="mt-4 space-y-3">
          {(data?.appointments ?? []).map((row) => (
            <Card key={row.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium">{row.service_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.appointment_date} · {row.time_slot} ·{" "}
                    {row.payment_method === "upi" ? "UPI" : "Pay at shop"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-primary">{inr(row.price)}</span>
                  <Badge variant="secondary">{row.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.appointments.length === 0 && (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Cosmetics orders</h2>
        <div className="mt-4 space-y-3">
          {(data?.orders ?? []).map((row) => (
            <Card key={row.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <p className="text-sm text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString("en-IN")} ·{" "}
                  {row.payment_method === "upi" ? "UPI" : "Pay at shop"}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-display text-primary">{inr(row.total_amount)}</span>
                  <Badge variant="secondary">{row.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Home tailor visits</h2>
        <div className="mt-4 space-y-3">
          {(data?.visits ?? []).map((row) => (
            <Card key={row.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium">{row.outfit_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.preferred_date} · {row.preferred_slot} · {row.address}
                  </p>
                </div>
                <Badge variant="secondary">{row.status}</Badge>
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
