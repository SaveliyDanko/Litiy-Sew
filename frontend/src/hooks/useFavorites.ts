import { useCallback, useEffect, useState } from 'react';
import {
  addFavorite,
  listFavorites,
  removeFavorite,
} from '../services/favorites';
import type { Product } from '../types/product';

const EVENT_NAME = 'litiy:favorites-changed';
const AUTH_EVENT = 'litiy:auth-changed';

export function useFavorites() {
  const [items, setItems] = useState<Product[]>([]);

  const reload = useCallback(async () => {
    try {
      setItems(await listFavorites());
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

  const isFavorite = useCallback((id: string) => items.some((p) => p.id === id), [items]);

  const toggle = useCallback(async (product: Product) => {
    const exists = items.some((p) => p.id === product.id);
    if (exists) {
      await removeFavorite(product.id);
    } else {
      await addFavorite(product);
    }
    emit();
  }, [items]);

  const remove = useCallback(async (id: string) => {
    await removeFavorite(id);
    emit();
  }, []);

  return { items, isFavorite, toggle, remove };
}
