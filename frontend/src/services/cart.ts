import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';

const API_BASE_URL = '/api';

type CartItemResponse = {
  id: number;
  productId: string;
  title: string;
  price: number;
  image: string;
  height: string;
  size: string;
  quantity: number;
};

function makeLineId(productId: string, height: string, size: string): string {
  return `${productId}|${height}|${size}`;
}

function toCartItem(r: CartItemResponse): CartItem {
  return {
    id: r.productId,
    title: r.title,
    price: r.price,
    image: r.image,
    height: r.height,
    size: r.size,
    quantity: r.quantity,
    lineId: makeLineId(r.productId, r.height, r.size),
    itemId: r.id,
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Cart request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function listCart(): Promise<CartItem[]> {
  const data = await request<CartItemResponse[]>('/cart');
  return data.map(toCartItem);
}

export async function addCart(
  product: Product,
  params: { height: string; size: string },
  quantity = 1,
): Promise<CartItem> {
  const body = {
    productId: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    height: params.height,
    size: params.size,
    quantity,
  };
  const data = await request<CartItemResponse>('/cart', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return toCartItem(data);
}

export async function updateCartQuantity(itemId: number, quantity: number): Promise<CartItem> {
  const data = await request<CartItemResponse>(`/cart/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
  return toCartItem(data);
}

export async function removeCart(itemId: number): Promise<void> {
  await request<void>(`/cart/${itemId}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<void> {
  await request<void>('/cart', { method: 'DELETE' });
}
