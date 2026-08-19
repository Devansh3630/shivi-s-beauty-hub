import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, ShoppingBag, Sparkles } from "lucide-react";
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
import { useCart } from "@/hooks/useCart";
import { SHOP } from "@/lib/shop";

const links = [
  { to: "/services", label: "Services" },
  { to: "/cosmetics", label: "Cosmetics" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, profile, isAdmin, openAuth, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full gradient-rose text-primary-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg">Shivi</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Parlour & Boutique
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-primary font-medium" }}
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <a href={`tel:${SHOP.phoneIntl}`} aria-label="Call the shop">
              <Phone className="size-4" aria-hidden />
            </a>
          </Button>

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cosmetics" aria-label="Cart">
              <ShoppingBag className="size-4" aria-hidden />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="max-w-[10rem] truncate">
                  {profile?.full_name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings">My bookings</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={openAuth}>Login / Sign Up</Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="font-display text-xl">Menu</SheetTitle>
              <nav className="mt-6 grid gap-4 text-sm">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="text-foreground/80 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link to="/my-bookings" onClick={() => setOpen(false)}>
                    My bookings
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    Admin dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
