const API_BASE_URL = '/api';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Types ---

export type AdminProduct = {
  id: number;
  title: string;
  price: number;
  description: string | null;
  imageUrl: string;
  imageKey: string;
  createdAt: string;
};

export type AdminPatternItem = {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string | null;
  previewUrl: string;
  previewKey: string;
  sizes: string;
  heights: string;
  createdAt: string;
};

export type AdminPortfolioPhoto = {
  id: number;
  photoUrl: string;
  photoKey: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
};

export type AdminHeroBanner = {
  id: number;
  imageUrl: string;
  imageKey: string;
  positionX: number;
  positionY: number;
  createdAt: string;
};

export type UploadResult = {
  publicUrl: string;
  key: string;
};

// --- Media ---

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<UploadResult>;
}

// --- Products ---

export async function listProducts(): Promise<AdminProduct[]> {
  return request<AdminProduct[]>('/admin/products');
}

export async function createProduct(data: {
  title: string;
  price: number;
  description?: string;
  imageUrl: string;
  imageKey: string;
}): Promise<AdminProduct> {
  return request<AdminProduct>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/admin/products/${id}`, { method: 'DELETE' });
}

// --- Patterns ---

export async function listPatterns(): Promise<AdminPatternItem[]> {
  return request<AdminPatternItem[]>('/admin/patterns');
}

export async function createPattern(data: {
  title: string;
  category: string;
  price: number;
  description?: string;
  previewUrl: string;
  previewKey: string;
  sizes: string;
  heights: string;
}): Promise<AdminPatternItem> {
  return request<AdminPatternItem>('/admin/patterns', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePattern(id: number): Promise<void> {
  return request<void>(`/admin/patterns/${id}`, { method: 'DELETE' });
}

// --- Portfolio ---

export async function listPortfolio(): Promise<AdminPortfolioPhoto[]> {
  return request<AdminPortfolioPhoto[]>('/admin/portfolio');
}

export async function createPortfolioPhoto(data: {
  photoUrl: string;
  photoKey: string;
  caption?: string;
  sortOrder?: number;
}): Promise<AdminPortfolioPhoto> {
  return request<AdminPortfolioPhoto>('/admin/portfolio', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePortfolioPhoto(id: number): Promise<void> {
  return request<void>(`/admin/portfolio/${id}`, { method: 'DELETE' });
}

export async function reorderPortfolioPhoto(id: number, sortOrder: number): Promise<void> {
  return request<void>(`/admin/portfolio/${id}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder }),
  });
}

// --- Hero Banner ---

export async function getHero(): Promise<AdminHeroBanner | null> {
  const res = await fetch(`${API_BASE_URL}/admin/hero`, { credentials: 'include' });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<AdminHeroBanner>;
}

export async function replaceHero(data: { imageUrl: string; imageKey: string; positionX?: number; positionY?: number }): Promise<AdminHeroBanner> {
  return request<AdminHeroBanner>('/admin/hero', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHeroPosition(positionX: number, positionY: number): Promise<AdminHeroBanner | null> {
  const res = await fetch('/api/admin/hero/position', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positionX, positionY }),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<AdminHeroBanner>;
}

export async function deleteHero(): Promise<void> {
  return request<void>('/admin/hero', { method: 'DELETE' });
}

// --- Credentials ---

export async function updateAdminCredentials(data: {
  email?: string;
  password?: string;
}): Promise<void> {
  return request<void>('/admin/credentials', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
