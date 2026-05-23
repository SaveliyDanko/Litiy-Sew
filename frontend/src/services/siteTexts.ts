export type SiteText = {
  id: number;
  slotKey: string;
  value: string;
};

export async function fetchAllSiteTexts(): Promise<SiteText[]> {
  const res = await fetch('/api/site-texts');
  if (!res.ok) return [];
  return res.json() as Promise<SiteText[]>;
}

export async function upsertSiteText(slotKey: string, value: string): Promise<SiteText> {
  const res = await fetch(`/api/admin/site-texts/${slotKey}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SiteText>;
}
