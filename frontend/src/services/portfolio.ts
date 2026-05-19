export type PortfolioPhoto = {
  id: number;
  photoUrl: string;
  caption: string | null;
  sortOrder: number;
  positionX: number;
  positionY: number;
  scale: number;
};

export async function fetchPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  const res = await fetch('/api/portfolio');
  if (!res.ok) return [];
  return res.json() as Promise<PortfolioPhoto[]>;
}
