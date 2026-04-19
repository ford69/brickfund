'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

/** Legacy single key — migrated to per-session keys on load */
const LEGACY_STORAGE_KEY = 'brickfund_cart';

function storageKeyForUser(userId: string | null): string {
  return userId ? `brickfund_cart:${userId}` : 'brickfund_cart:guest';
}

function loadFromStorageKey(key: string): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorageKey(key: string, items: CartLine[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

function mergeCartLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const line of a) {
    map.set(line.itemId, { ...line });
  }
  for (const line of b) {
    const existing = map.get(line.itemId);
    if (existing) {
      map.set(line.itemId, {
        ...existing,
        quantity: existing.quantity + line.quantity,
      });
    } else {
      map.set(line.itemId, { ...line });
    }
  }
  return Array.from(map.values());
}

function migrateLegacyCart(targetKey: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    if (!Array.isArray(parsed) || parsed.length === 0) return;
    const existing = loadFromStorageKey(targetKey);
    if (existing.length === 0) {
      saveToStorageKey(targetKey, parsed);
    }
  } catch {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
  }
}

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  const userId = user?._id ?? null;

  // Load or switch cart when auth is known or the signed-in user changes
  useEffect(() => {
    if (isLoading) return;

    const key = storageKeyForUser(userId);
    migrateLegacyCart(key);

    let loaded = loadFromStorageKey(key);
    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (prev === undefined) {
      setItems(loaded);
      setHydrated(true);
      return;
    }

    if (prev === userId) {
      return;
    }

    if (userId !== null && prev === null) {
      const guestCart = loadFromStorageKey(storageKeyForUser(null));
      loaded = mergeCartLines(loaded, guestCart);
      saveToStorageKey(storageKeyForUser(null), []);
    } else {
      loaded = loadFromStorageKey(key);
    }

    setItems(loaded);
    setHydrated(true);
  }, [isLoading, userId]);

  useEffect(() => {
    if (!hydrated || isLoading) return;
    const key = storageKeyForUser(userId);
    saveToStorageKey(key, items);
  }, [hydrated, isLoading, userId, items]);

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
