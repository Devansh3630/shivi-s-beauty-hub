import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck2, Menu, Phone, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { SHOP } from "@/lib/shop";

const links = [
  { to: "/services", label: "Services" },
  { to: "/boutique", label: "Boutique" },
  { to: "/cosmetics", label: "Cosmetics" },
  { to: "/my-bookings", label: "My Bookings", isSpecial: true },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, profile, isAdmin, openAuth, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  function handleBookingNav(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      openAuth();
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid size-9 place-items-center rounded-full gradient-rose text-primary-foreground shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-tight">Shivi</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Parlour & Boutique
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-5 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={link.to === "/my-bookings" ? handleBookingNav : undefined}
              activeProps={{
                className: "text-primary font-semibold border-b-2 border-primary pb-0.5",
              }}
              className={`transition-colors flex items-center gap-1.5 ${
                link.isSpecial
                  ? "font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.isSpecial && <CalendarCheck2 className="size-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          {/* Quick prominent My Bookings button for mobile / tablet */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex md:hidden border-primary/30 text-primary font-medium hover:bg-primary/10"
          >
            <Link to="/my-bookings" onClick={handleBookingNav}>
              <CalendarCheck2 className="size-3.5 mr-1" />
              My Bookings
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <a href={`tel:${SHOP.phoneIntl}`} aria-label="Call the shop">
              <Phone className="size-4" aria-hidden />
            </a>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="max-w-[10rem] truncate">
                  {profile?.full_name || user.email?.split("@")[0] || "My Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings" className="flex items-center gap-2 font-medium">
                    <CalendarCheck2 className="size-4 text-primary" /> My Bookings & Bills
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={openAuth} size="sm">
              Login / Sign Up
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-xl flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Shivi Parlour & Boutique
              </SheetTitle>
              <nav className="mt-6 grid gap-3 text-sm">
                <Link
                  to="/my-bookings"
                  onClick={(e) => {
                    setOpen(false);
                    handleBookingNav(e);
                  }}
                  className="flex items-center gap-2.5 font-semibold text-primary bg-primary/10 px-3 py-2.5 rounded-lg"
                >
                  <CalendarCheck2 className="size-4" />
                  My Bookings & Bills
                </Link>

                <div className="h-px bg-border my-1" />

                {links
                  .filter((l) => l.to !== "/my-bookings")
                  .map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="px-3 py-2 rounded-md text-foreground/80 hover:text-primary hover:bg-accent"
                    >
                      {link.label}
                    </Link>
                  ))}

                {user && (
                  <>
                    <div className="h-px bg-border my-1" />
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="px-3 py-2 rounded-md font-medium text-amber-600 hover:bg-accent"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        handleSignOut();
                      }}
                      className="text-left px-3 py-2 rounded-md text-destructive hover:bg-destructive/10"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
