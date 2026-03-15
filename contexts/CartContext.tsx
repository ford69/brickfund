'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type FulfillmentTier = 'small' | 'medium' | 'large';

export interface CartLine {
  itemId: string;
  quantity: number;
  name: string;
  price: number;
  currency: string;
  image?: string | null;
  unitLabel?: string;
  /** Order size for delivery vehicle: small → motor bike, medium → mini truck, large → truck */
  fulfillmentTier?: FulfillmentTier;
}

interface CartContextValue {
  items: CartLine[];
  itemCount: number;
  addItem: (line: Omit<CartLine, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalByCurrency: Record<string, number>;
}

const STORAGE_KEY = 'brickfund_cart';

const defaultContext: CartContextValue = {
  items: [],
  itemCount: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalAmount: 0,
  totalByCurrency: {},
};

const CartContext = createContext<CartContextValue>(defaultContext);

function loadFromStorage(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartLine[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(items);
  }, [hydrated, items]);

  const addItem = useCallback(
    (line: Omit<CartLine, 'quantity'> & { quantity?: number }) => {
      const qty = Math.max(1, line.quantity ?? 1);
      setItems((prev) => {
        const existing = prev.find((i) => i.itemId === line.itemId);
        if (existing) {
          return prev.map((i) =>
            i.itemId === line.itemId ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [...prev, { ...line, quantity: qty } as CartLine];
      });
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const q = Math.max(0, quantity);
    if (q === 0) {
      setItems((prev) => prev.filter((i) => i.itemId !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantity: q } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);
  const totalByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      map[i.currency] = (map[i.currency] ?? 0) + i.price * i.quantity;
    });
    return map;
  }, [items]);
  const totalAmount = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalAmount,
      totalByCurrency,
    }),
    [items, itemCount, addItem, removeItem, updateQuantity, clearCart, totalAmount, totalByCurrency]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  return ctx ?? defaultContext;
}
