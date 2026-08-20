import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Clock, MessageCircle, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SHOP, whatsappLink } from "@/lib/shop";

export function SiteFooter() {
  return (
    <footer id="contact" className="mt-24 border-t bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Visit Us</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Parlour services, cosmetics and boutique stitching under one roof in Lucknow.
          </p>

          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>{SHOP.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <a className="hover:text-primary" href={`tel:${SHOP.phoneIntl}`}>
                {SHOP.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>{SHOP.hours}</span>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={`tel:${SHOP.phoneIntl}`}>Call the shop</a>
            </Button>
            <Button asChild variant="outline">
              <a
                href={whatsappLink(`Hello ${SHOP.name}, I would like to know more.`)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            </Button>
          </div>

          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/services" className="hover:text-primary">
              Services
            </Link>
            <Link to="/cosmetics" className="hover:text-primary">
              Cosmetics
            </Link>
            <Link to="/boutique" className="hover:text-primary">
              Boutique
            </Link>
            <Link to="/contact" className="hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>

        <div className="overflow-hidden rounded-2xl border shadow-soft">
          <iframe
            title={`Map to ${SHOP.name}`}
            src={SHOP.mapsEmbed}
            className="h-full min-h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SHOP.name}, Lucknow. All rights reserved.
      </div>
    </footer>
  );
}
