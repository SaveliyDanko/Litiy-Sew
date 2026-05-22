export type DynamicCollectionPhoto = {
  id: number;
  collectionId: number;
  photoType: 'CARD' | 'HERO' | 'GALLERY';
  imageUrl: string;
  imageKey: string;
  imageSrcSet: string | null;
  positionX: number;
  positionY: number;
  scale: number;
  sortOrder: number;
  createdAt: string;
};

export type CollectionCategory = 'COLLECTION' | 'SOLO' | 'SKETCH';

export type DynamicCollection = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  description: string | null;
  detailIntro: string | null;
  detailFocus: string | null;
  groupTitle: string | null;
  hideCardLabel: boolean;
  heroTitlePosition: 'bottom-left' | 'bottom-center' | 'center';
  tone: 'warm' | 'cool' | 'neutral';
  category: CollectionCategory;
  sortOrder: number;
  featured: boolean;
  createdAt: string;
  photos: DynamicCollectionPhoto[];
};

export type CreateCollectionData = {
  slug: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  detailIntro?: string;
  detailFocus?: string;
  groupTitle?: string;
  hideCardLabel?: boolean;
  heroTitlePosition?: 'bottom-left' | 'bottom-center' | 'center';
  tone?: 'warm' | 'cool' | 'neutral';
  category?: CollectionCategory;
  sortOrder?: number;
  featured?: boolean;
};

export type UpdateCollectionData = CreateCollectionData;

export type AddPhotoData = {
  imageUrl: string;
  imageKey: string;
  imageSrcSet?: string | null;
  photoType: 'CARD' | 'HERO' | 'GALLERY';
  positionX?: number;
  positionY?: number;
  sortOrder?: number;
};

const API = '/api';

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function fetchCollections(): Promise<DynamicCollection[]> {
  const res = await fetch(`${API}/collections`);
  if (!res.ok) return [];
  return res.json() as Promise<DynamicCollection[]>;
}

export async function fetchCollection(slug: string): Promise<DynamicCollection | null> {
  const res = await fetch(`${API}/collections/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<DynamicCollection>;
}

// ── Admin: collections ────────────────────────────────────────────────────────

export async function createCollection(data: CreateCollectionData): Promise<DynamicCollection> {
  return adminRequest<DynamicCollection>('/admin/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCollection(id: number, data: UpdateCollectionData): Promise<DynamicCollection> {
  return adminRequest<DynamicCollection>(`/admin/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function reorderCollection(id: number, sortOrder: number): Promise<void> {
  return adminRequest<void>(`/admin/collections/${id}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder }),
  });
}

export async function deleteCollection(id: number): Promise<void> {
  return adminRequest<void>(`/admin/collections/${id}`, { method: 'DELETE' });
}

// ── Admin: photos ─────────────────────────────────────────────────────────────

export async function addCollectionPhoto(collectionId: number, data: AddPhotoData): Promise<DynamicCollectionPhoto> {
  return adminRequest<DynamicCollectionPhoto>(`/admin/collections/${collectionId}/photos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCollectionPhotoPosition(photoId: number, positionX: number, positionY: number, scale: number): Promise<DynamicCollectionPhoto> {
  return adminRequest<DynamicCollectionPhoto>(`/admin/collections/photos/${photoId}/position`, {
    method: 'PATCH',
    body: JSON.stringify({ positionX, positionY, scale }),
  });
}

export async function deleteCollectionPhoto(photoId: number): Promise<void> {
  return adminRequest<void>(`/admin/collections/photos/${photoId}`, { method: 'DELETE' });
}

export async function reorderCollectionPhoto(photoId: number, sortOrder: number): Promise<void> {
  return adminRequest<void>(`/admin/collections/photos/${photoId}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder }),
  });
}
