import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../types/product';

const STORAGE_KEY = 'litiy.favorites';
const EVENT_NAME = 'litiy:favorites-changed';

function readStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useFavorites() {
  const [items, setItems] = useState<Product[]>(() => readStorage());

  useEffect(() => {
    const sync = () => setItems(readStorage());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isFavorite = useCallback((id: string) => items.some((p) => p.id === id), [items]);

  const toggle = useCallback((product: Product) => {
    const current = readStorage();
    const exists = current.some((p) => p.id === product.id);
    const next = exists ? current.filter((p) => p.id !== product.id) : [...current, product];
    writeStorage(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = readStorage().filter((p) => p.id !== id);
    writeStorage(next);
  }, []);

  return { items, isFavorite, toggle, remove };
}
