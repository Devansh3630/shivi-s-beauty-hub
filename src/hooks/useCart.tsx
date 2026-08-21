import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartValue>(() => {
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
      add: (item) => {
        if (
          !item.id ||
          !item.name ||
          typeof item.price !== "number" ||
          isNaN(item.price) ||
          item.price < 0
        ) {
          return;
        }
        setItems((prev) => {
          const found = prev.find((p) => p.id === item.id);
          if (found) {
            const nextQty = Math.min(found.quantity + 1, 99);
            return prev.map((p) => (p.id === item.id ? { ...p, quantity: nextQty } : p));
          }
          return [...prev, { ...item, quantity: 1 }];
        });
      },
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQuantity: (id, rawQuantity) => {
        const quantity = Math.floor(rawQuantity);
        setItems((prev) => {
          if (isNaN(quantity) || quantity <= 0) {
            return prev.filter((p) => p.id !== id);
          }
          const clampedQty = Math.min(quantity, 99);
          return prev.map((p) => (p.id === id ? { ...p, quantity: clampedQty } : p));
        });
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
