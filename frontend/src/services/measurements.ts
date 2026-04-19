const API_BASE_URL = 'http://localhost:8080/api';

export type Measurement = {
  id: number;
  name: string;
  comment: string | null;
  height: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  fullnessGroup: string | null;
};

export type MeasurementInput = {
  name: string;
  comment?: string | null;
  height?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  fullnessGroup?: string | null;
};

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
    throw new Error(`Measurements request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function listMeasurements(): Promise<Measurement[]> {
  return request<Measurement[]>('/measurements');
}

export function createMeasurement(payload: MeasurementInput): Promise<Measurement> {
  return request<Measurement>('/measurements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMeasurement(id: number, payload: MeasurementInput): Promise<Measurement> {
  return request<Measurement>(`/measurements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteMeasurement(id: number): Promise<void> {
  return request<void>(`/measurements/${id}`, { method: 'DELETE' });
}
