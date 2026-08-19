import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { SHOP, inr } from "@/lib/shop";

export const Route = createFileRoute("/cosmetics")({
  head: () => ({
    meta: [
      { title: "Cosmetics Store — Shivi Parlour & Boutique, Lucknow" },
      {
        name: "description",
        content:
          "Shop makeup, skincare, haircare, fragrance and beauty tools in Lucknow. Add to cart and pay by UPI or at the shop.",
      },
      { property: "og:title", content: "Cosmetics Store — Shivi Parlour & Boutique" },
      {
        property: "og:description",
        content: "Browse and order cosmetics from Kabir Pur, Sultanpur Road, Lucknow.",
      },
    ],
  }),
  component: CosmeticsPage,
});

function CosmeticsPage() {
  const { user, profile, openAuth } = useAuth();
  const cart = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [payment, setPayment] = useState("shop");
  const [address, setAddress] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, category, price, image_url, in_stock")
        .order("category");
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((products ?? []).map((p) => p.category)))],
    [products],
  );

  const visible = (products ?? []).filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const checkout = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first.");
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        items: cart.items,
        total_amount: cart.total,
        payment_method: payment,
        customer_name: profile?.full_name ?? "",
        customer_phone: profile?.phone ?? "",
        address,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        payment === "upi"
          ? `Order placed! Pay ${inr(cart.total)} by UPI to ${SHOP.phone}.`
          : "Order placed! Pay when you collect or receive it.",
      );
      cart.clear();
      setAddress("");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Checkout failed"),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Cosmetics Store</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Genuine beauty products, hand-picked by our parlour team. Collect from the shop or get them
        delivered anywhere in Lucknow.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              className="pl-9"
              placeholder="Search products or brands"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cosmetics"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="mt-8 text-muted-foreground">Loading products…</p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <Card key={product.id} className="overflow-hidden py-0 shadow-soft">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    width={600}
                    height={400}
                    className="h-44 w-full object-cover"
                  />
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {product.brand} · {product.category}
                    </p>
                    <h2 className="mt-1 font-medium leading-snug">{product.name}</h2>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-lg text-primary">
                        {inr(product.price)}
                      </span>
                      <Button
                        size="sm"
                        disabled={!product.in_stock}
                        onClick={() =>
                          cart.add({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                          })
                        }
                      >
                        {product.in_stock ? "Add to Cart" : "Out of stock"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {visible.length === 0 && (
                <p className="text-muted-foreground">No products match your search.</p>
              )}
            </div>
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-2xl">Your cart</h2>

            {cart.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            ) : (
              <ul className="space-y-3">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                        aria-label={`Reduce ${item.name}`}
                      >
                        <Minus className="size-3" aria-hidden />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                        aria-label={`Add ${item.name}`}
                      >
                        <Plus className="size-3" aria-hidden />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => cart.remove(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-3" aria-hidden />
                      </Button>
                    </div>
                    <span className="w-16 text-right">{inr(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between border-t pt-4 font-medium">
              <span>Total</span>
              <span className="font-display text-xl text-primary">{inr(cart.total)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-address">Delivery address (optional)</Label>
              <Textarea
                id="order-address"
                rows={3}
                placeholder="Leave blank to collect from the shop"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment</Label>
              <RadioGroup value={payment} onValueChange={setPayment} className="gap-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="upi" id="order-upi" />
                  <Label htmlFor="order-upi" className="font-normal">
                    Online UPI
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="shop" id="order-shop" />
                  <Label htmlFor="order-shop" className="font-normal">
                    Pay at shop / on delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {user ? (
              <Button
                className="w-full"
                disabled={cart.items.length === 0 || checkout.isPending}
                onClick={() => checkout.mutate()}
              >
                {checkout.isPending ? "Placing order…" : "Place order"}
              </Button>
            ) : (
              <Button className="w-full" onClick={openAuth}>
                Sign in to checkout
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
