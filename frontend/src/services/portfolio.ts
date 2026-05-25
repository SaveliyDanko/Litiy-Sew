import { normalizeMediaFields } from '../utils/mediaUrls';

export type PortfolioPhoto = {
  id: number;
  photoUrl: string;
  photoSrcSet: string | null;
  caption: string | null;
  sortOrder: number;
  positionX: number;
  positionY: number;
  scale: number;
};

export async function fetchPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  const res = await fetch('/api/portfolio');
  if (!res.ok) return [];
  const data = await res.json() as PortfolioPhoto[];
  return normalizeMediaFields(data);
}
