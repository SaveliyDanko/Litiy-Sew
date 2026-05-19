export type SiteImage = {
  id: number;
  slotKey: string;
  imageUrl: string;
  imageKey: string;
  positionX: number;
  positionY: number;
  scale: number;
  containerHeight: number;
};

export async function fetchAllSiteImages(): Promise<SiteImage[]> {
  const res = await fetch('/api/site-images');
  if (!res.ok) return [];
  return res.json() as Promise<SiteImage[]>;
}

export async function fetchSiteImage(slotKey: string): Promise<SiteImage | null> {
  const res = await fetch(`/api/site-images/${slotKey}`);
  if (res.status === 204 || !res.ok) return null;
  return res.json() as Promise<SiteImage>;
}

export async function upsertSiteImage(data: {
  slotKey: string;
  imageUrl: string;
  imageKey: string;
  positionX?: number;
  positionY?: number;
  scale?: number;
  containerHeight?: number;
}): Promise<SiteImage> {
  const res = await fetch('/api/admin/site-images', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SiteImage>;
}

export async function updateSiteImagePosition(
  slotKey: string,
  positionX: number,
  positionY: number,
  scale: number,
  containerHeight: number,
): Promise<SiteImage | null> {
  const res = await fetch(`/api/admin/site-images/${slotKey}/position`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positionX, positionY, scale, containerHeight }),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SiteImage>;
}

export async function deleteSiteImage(slotKey: string): Promise<void> {
  await fetch(`/api/admin/site-images/${slotKey}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
