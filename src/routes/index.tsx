import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck2, MessageCircle, Scissors, Shirt, Sparkles, Star } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SHOP, inr, DEFAULT_PARLOUR_SERVICES } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shivi Parlour & Boutique — Beauty, Cosmetics & Tailoring in Lucknow" },
      {
        name: "description",
        content:
          "All-in-one beauty parlour, cosmetics store and boutique in Kabir Pur, Sultanpur Road, Lucknow. Book appointments or request a home tailor visit.",
      },
      { property: "og:title", content: "Shivi Parlour & Boutique — Lucknow" },
      {
        property: "og:description",
        content:
          "Parlour appointments, cosmetics delivery and home tailor visits across Lucknow. Open daily 10 AM – 9 PM.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: offers } = useQuery({
    queryKey: ["offers", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("id, title, description")
        .eq("is_active", true)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: featured } = useQuery({
    queryKey: ["services", "featured"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name, category, price")
          .order("price", { ascending: false })
          .limit(6);
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback to default services
      }
      return DEFAULT_PARLOUR_SERVICES.slice(0, 6).map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price,
      }));
    },
  });

  return (
    <>
      <section className="relative overflow-hidden gradient-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-accent-foreground">
              <Sparkles className="size-3.5" aria-hidden /> Lucknow · Open Daily
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
              All-in-One <span className="text-gradient-rose">Beauty Parlour</span>, Cosmetics &
              Boutique in Lucknow
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              Salon and bridal services, a full cosmetics shelf, and custom stitching with free home
              measurement visits — all from {SHOP.address}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/services">Book Parlour Appointment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/boutique">Request Home Tailor Visit</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Call or WhatsApp{" "}
              <a className="font-medium text-primary" href={`tel:${SHOP.phoneIntl}`}>
                {SHOP.phone}
              </a>{" "}
              · {SHOP.hours}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-elegant">
            <img
              src={heroImage}
              alt="Rose gold beauty parlour and boutique interior at Shivi Parlour & Boutique, Lucknow"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Scissors,
              title: "Parlour & Bridal",
              body: "Hair, skin, makeup, threading and facials with a transparent price list and slot booking.",
              to: "/services" as const,
              cta: "See services",
            },
            {
              icon: Star,
              title: "Cosmetics",
              body: "Trusted makeup, skincare, haircare and fragrance brands with in-shop pickup or delivery.",
              to: "/cosmetics" as const,
              cta: "Shop cosmetics",
            },
            {
              icon: Shirt,
              title: "Boutique Stitching",
              body: "Blouses, suits, gowns and lehengas stitched to measure, with a home tailor visit in Lucknow.",
              to: "/boutique" as const,
              cta: "View designs",
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/70 shadow-soft">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-2xl">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                <Button asChild variant="link" className="mt-3 px-0">
                  <Link to={item.to}>{item.cta} →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Bookings & WhatsApp Bill Notice Banner */}
        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <MessageCircle className="size-3.5 fill-emerald-600 text-emerald-600" /> Instant
              WhatsApp Bills & Receipts
            </div>
            <h3 className="font-display text-2xl text-foreground">
              Track Your Active Bookings Anytime
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Check all your parlour appointments, tailor measurements, and cosmetics orders in one
              place with official branded receipts sent straight to your WhatsApp.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 font-medium">
            <Link to="/_authenticated/my-bookings">
              <CalendarCheck2 className="size-4 mr-2" />
              Open My Bookings
            </Link>
          </Button>
        </div>
      </section>

      {offers && offers.length > 0 && (
        <section className="bg-secondary/50 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-3xl">Current Offers</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-2xl border bg-card p-6 shadow-soft">
                  <h3 className="font-display text-xl text-primary">{offer.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl">Popular at the parlour</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(featured ?? []).map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-xl border bg-card px-5 py-4"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {service.category}
                </p>
              </div>
              <span className="font-display text-lg text-primary">{inr(service.price)}</span>
            </div>
          ))}
        </div>
        <Button asChild className="mt-8">
          <Link to="/services">Book an appointment</Link>
        </Button>
      </section>
    </>
  );
}
