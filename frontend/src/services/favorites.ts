import type { Product } from '../types/product';

const API_BASE_URL = 'http://localhost:8080/api';

type FavoriteResponse = {
  productId: string;
  title: string;
  price: number;
  image: string;
};

function toProduct(r: FavoriteResponse): Product {
  return { id: r.productId, title: r.title, price: r.price, image: r.image };
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
    throw new Error(`Favorites request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function listFavorites(): Promise<Product[]> {
  const data = await request<FavoriteResponse[]>('/favorites');
  return data.map(toProduct);
}

export async function addFavorite(product: Product): Promise<Product> {
  const body = {
    productId: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
  };
  const data = await request<FavoriteResponse>('/favorites', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return toProduct(data);
}

export async function removeFavorite(productId: string): Promise<void> {
  await request<void>(`/favorites/${productId}`, { method: 'DELETE' });
}
