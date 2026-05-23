const API = '/api';

export type ProjectPhoto = {
  id: number;
  projectId: number;
  imageUrl: string;
  imageKey: string;
  imageSrcSet: string | null;
  positionX: number;
  positionY: number;
  scale: number;
  sortOrder: number;
  createdAt: string;
};

export type PortfolioProject = {
  id: number;
  eyebrow: string | null;
  title: string;
  meta: string | null;
  lead: string | null;
  paragraph1: string | null;
  paragraph2: string | null;
  paragraph3: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  imageSrcSet: string | null;
  positionX: number;
  positionY: number;
  scale: number;
  sortOrder: number;
  createdAt: string;
  photos: ProjectPhoto[];
};

export type PortfolioProjectData = {
  eyebrow?: string;
  title: string;
  meta?: string;
  lead?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  imageUrl?: string;
  imageKey?: string;
  imageSrcSet?: string | null;
  positionX?: number;
  positionY?: number;
  scale?: number;
  sortOrder?: number;
};

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

export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  const res = await fetch(`${API}/portfolio-projects`);
  if (!res.ok) return [];
  return res.json() as Promise<PortfolioProject[]>;
}

export async function adminListPortfolioProjects(): Promise<PortfolioProject[]> {
  return adminRequest<PortfolioProject[]>('/admin/portfolio-projects');
}

export async function createPortfolioProject(data: PortfolioProjectData): Promise<PortfolioProject> {
  return adminRequest<PortfolioProject>('/admin/portfolio-projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePortfolioProject(id: number, data: PortfolioProjectData): Promise<PortfolioProject> {
  return adminRequest<PortfolioProject>(`/admin/portfolio-projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePortfolioProject(id: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/${id}`, { method: 'DELETE' });
}

export async function reorderPortfolioProject(id: number, sortOrder: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/${id}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder }),
  });
}

export async function updatePortfolioProjectPosition(id: number, positionX: number, positionY: number, scale: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/${id}/position`, {
    method: 'PATCH',
    body: JSON.stringify({ positionX, positionY, scale }),
  });
}

export async function addProjectPhoto(projectId: number, imageUrl: string, imageKey: string, imageSrcSet: string | null): Promise<ProjectPhoto> {
  return adminRequest<ProjectPhoto>(`/admin/portfolio-projects/${projectId}/photos`, {
    method: 'POST',
    body: JSON.stringify({ imageUrl, imageKey, imageSrcSet }),
  });
}

export async function deleteProjectPhoto(photoId: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/photos/${photoId}`, { method: 'DELETE' });
}

export async function reorderProjectPhoto(photoId: number, sortOrder: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/photos/${photoId}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder }),
  });
}

export async function updateProjectPhotoPosition(photoId: number, positionX: number, positionY: number, scale: number): Promise<ProjectPhoto> {
  return adminRequest<ProjectPhoto>(`/admin/portfolio-projects/photos/${photoId}/position`, {
    method: 'PATCH',
    body: JSON.stringify({ positionX, positionY, scale }),
  });
}
