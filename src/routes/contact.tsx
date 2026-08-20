import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SHOP, whatsappLink } from "@/lib/shop";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location — Shivi Parlour & Boutique, Lucknow" },
      {
        name: "description",
        content:
          "Visit Shivi Parlour & Boutique at Kabir Pur, Sultanpur Road, Lucknow 226501. Call or WhatsApp 7897179580, open daily 10 AM to 9 PM.",
      },
      { property: "og:title", content: "Contact Shivi Parlour & Boutique, Lucknow" },
      {
        property: "og:description",
        content: "Address, phone number, opening hours and map for our Lucknow shop.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Contact Us</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Walk in any day of the week, or call ahead to reserve your slot.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: MapPin, label: "Address", value: SHOP.address },
          { icon: Phone, label: "Phone / WhatsApp", value: SHOP.phone },
          { icon: Clock, label: "Opening hours", value: SHOP.hours },
        ].map((item) => (
          <Card key={item.label} className="shadow-soft">
            <CardContent className="p-6">
              <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
                <item.icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-xl">{item.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={`tel:${SHOP.phoneIntl}`}>Call {SHOP.phone}</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a
            href={whatsappLink(`Hello ${SHOP.name}, I'd like to book an appointment.`)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-4" aria-hidden /> Chat on WhatsApp
          </a>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <a href={SHOP.mapsLink} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        </Button>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border shadow-soft">
        <iframe
          title={`Google Map showing ${SHOP.name}`}
          src={SHOP.mapsEmbed}
          className="h-[420px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
