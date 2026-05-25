import { normalizeMediaFields } from '../utils/mediaUrls';

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

export type ProjectAttachment = {
  id: number;
  projectId: number;
  kind: 'FILE' | 'LINK';
  label: string | null;
  url: string;
  fileKey: string | null;
  fileSize: number | null;
  contentType: string | null;
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
  attachmentsEnabled: boolean;
  createdAt: string;
  photos: ProjectPhoto[];
  attachments: ProjectAttachment[];
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
  attachmentsEnabled?: boolean;
};

export type AttachmentData = {
  kind: 'FILE' | 'LINK';
  label?: string;
  url: string;
  fileKey?: string | null;
  fileSize?: number | null;
  contentType?: string | null;
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
  const data = await res.json() as T;
  return normalizeMediaFields(data);
}

export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  const res = await fetch(`${API}/portfolio-projects`);
  if (!res.ok) return [];
  const data = await res.json() as PortfolioProject[];
  return normalizeMediaFields(data);
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

export async function addProjectAttachment(projectId: number, data: AttachmentData): Promise<ProjectAttachment> {
  return adminRequest<ProjectAttachment>(`/admin/portfolio-projects/${projectId}/attachments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteProjectAttachment(attachmentId: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/attachments/${attachmentId}`, { method: 'DELETE' });
}

export async function reorderProjectAttachment(attachmentId: number, sortOrder: number): Promise<void> {
  return adminRequest<void>(`/admin/portfolio-projects/attachments/${attachmentId}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder }),
  });
}
