import { useCallback, useEffect, useState } from 'react';
import {
  addCart,
  clearCart,
  listCart,
  removeCart,
  updateCartQuantity,
} from '../services/cart';
import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';

const EVENT_NAME = 'litiy:cart-changed';
const AUTH_EVENT = 'litiy:auth-changed';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const reload = useCallback(async () => {
    try {
      setItems(await listCart());
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      void reload();
    };
    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, [reload]);

  const emit = () => window.dispatchEvent(new CustomEvent(EVENT_NAME));

  const add = useCallback(
    async (product: Product, params: { height: string; size: string }, quantity = 1) => {
      await addCart(product, params, quantity);
      emit();
    },
    [],
  );

  const setQuantity = useCallback(async (lineId: string, quantity: number) => {
    const clamped = Math.max(1, Math.floor(quantity));
    const target = items.find((i) => i.lineId === lineId);
    if (!target) return;
    await updateCartQuantity(target.itemId, clamped);
    emit();
  }, [items]);

  const remove = useCallback(async (lineId: string) => {
    const target = items.find((i) => i.lineId === lineId);
    if (!target) return;
    await removeCart(target.itemId);
    emit();
  }, [items]);

  const removeMany = useCallback(async (lineIds: string[]) => {
    const ids = new Set(lineIds);
    const targets = items.filter((i) => ids.has(i.lineId));
    await Promise.all(targets.map((i) => removeCart(i.itemId)));
    emit();
  }, [items]);

  const clear = useCallback(async () => {
    await clearCart();
    emit();
  }, []);

  return { items, add, setQuantity, remove, removeMany, clear };
}
