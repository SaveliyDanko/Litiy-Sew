import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';

const STORAGE_KEY = 'litiy.cart';
const EVENT_NAME = 'litiy:cart-changed';

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function makeLineId(productId: string, height: string, size: string): string {
  return `${productId}|${height}|${size}`;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readStorage());

  useEffect(() => {
    const sync = () => setItems(readStorage());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const add = useCallback((product: Product, params: { height: string; size: string }, quantity = 1) => {
    const current = readStorage();
    const lineId = makeLineId(product.id, params.height, params.size);
    const existing = current.find((i) => i.lineId === lineId);
    const next: CartItem[] = existing
      ? current.map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { ...product, ...params, lineId, quantity }];
    writeStorage(next);
  }, []);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    const clamped = Math.max(1, Math.floor(quantity));
    const next = readStorage().map((i) => (i.lineId === lineId ? { ...i, quantity: clamped } : i));
    writeStorage(next);
  }, []);

  const remove = useCallback((lineId: string) => {
    const next = readStorage().filter((i) => i.lineId !== lineId);
    writeStorage(next);
  }, []);

  const removeMany = useCallback((lineIds: string[]) => {
    const ids = new Set(lineIds);
    const next = readStorage().filter((i) => !ids.has(i.lineId));
    writeStorage(next);
  }, []);

  const clear = useCallback(() => writeStorage([]), []);

  return { items, add, setQuantity, remove, removeMany, clear };
}
