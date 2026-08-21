import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CheckCircle2, MessageCircle, Minus, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import {
  SHOP,
  inr,
  generateCosmeticsOrderWhatsAppText,
  openWhatsAppBill,
  type CosmeticsOrderReceiptData,
} from "@/lib/shop";

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
  const [confirmedOrder, setConfirmedOrder] = useState<CosmeticsOrderReceiptData | null>(null);

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
      if (!cart.items.length) throw new Error("Your cart is empty.");
      if (cart.total <= 0) throw new Error("Invalid order total.");

      const sanitizedItems = cart.items.map((item) => ({
        id: item.id,
        name: String(item.name).slice(0, 100),
        price: Number(item.price),
        quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity)))),
      }));

      const validPayment = payment === "upi" ? "upi" : "shop";
      const sanitizedAddress = address.trim().slice(0, 500);
      const customerName = (profile?.full_name ?? "").trim().slice(0, 100) || "Valued Customer";
      const customerPhone = (profile?.phone ?? "").trim().slice(0, 20);

      const { data: insertedData, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: sanitizedItems,
          total_amount: cart.total,
          payment_method: validPayment,
          customer_name: customerName,
          customer_phone: customerPhone,
          address: sanitizedAddress,
        })
        .select("id")
        .single();

      if (error) throw error;

      const orderId = insertedData?.id || `ORD-${Date.now().toString().slice(-6)}`;

      return {
        id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: sanitizedItems,
        total_amount: cart.total,
        payment_method: validPayment,
        address: sanitizedAddress,
        status: "pending",
        created_at: new Date().toISOString(),
      } as CosmeticsOrderReceiptData;
    },
    onSuccess: (receipt) => {
      setConfirmedOrder(receipt);
      toast.success(
        payment === "upi"
          ? `Order placed! Pay ${inr(receipt.total_amount)} by UPI to ${SHOP.phone}.`
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

      {/* Order Confirmation Dialog */}
      <Dialog open={Boolean(confirmedOrder)} onOpenChange={() => setConfirmedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6 text-emerald-600" />
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription>
              Your cosmetics order has been recorded at Shivi Parlour & Boutique.
            </DialogDescription>
          </DialogHeader>

          {confirmedOrder && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border bg-card p-4 space-y-2 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Order Ref</span>
                  <span className="font-mono font-semibold">
                    #{confirmedOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{confirmedOrder.customer_name}</span>
                </div>
                {confirmedOrder.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Address</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {confirmedOrder.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {confirmedOrder.payment_method === "upi"
                      ? `UPI (${SHOP.upiId})`
                      : "Pay on Delivery / Collection"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-primary">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">{inr(confirmedOrder.total_amount)}</span>
                </div>
              </div>

              {confirmedOrder.payment_method === "upi" && (
                <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">UPI Payment Details:</p>
                  <p className="mt-0.5">
                    Please transfer {inr(confirmedOrder.total_amount)} to UPI ID{" "}
                    <strong>{SHOP.upiId}</strong> ({SHOP.phone}) referencing order ref #
                    {confirmedOrder.id.slice(0, 8).toUpperCase()}.
                  </p>
                </div>
              )}

              {/* Heartfelt Official Thank You Banner */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-center text-emerald-900 dark:text-emerald-200">
                <p className="font-bold text-xs flex items-center justify-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-600" />
                  Thank you for choosing Shivi Parlour & Boutique!
                </p>
                <p className="text-[11px] mt-1 text-emerald-800/80 dark:text-emerald-300/80">
                  We prepare 100% genuine products. Send your official bill directly to your
                  WhatsApp with one click below!
                </p>
              </div>

              {/* Direct WhatsApp Bill Action */}
              <Button
                type="button"
                className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => {
                  const msg = generateCosmeticsOrderWhatsAppText(confirmedOrder);
                  openWhatsAppBill(confirmedOrder.customer_phone, msg);
                  toast.success("Opening WhatsApp with your cosmetics bill...");
                }}
              >
                <MessageCircle className="size-4 mr-2 fill-white" />
                📲 Send Bill to WhatsApp
              </Button>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmedOrder(null)}
                >
                  Close
                </Button>
                <Button asChild variant="secondary" className="flex-1">
                  <Link to="/_authenticated/my-bookings">View in My Bookings</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
