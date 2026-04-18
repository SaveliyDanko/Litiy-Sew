import type { User } from '../types/user';

const API_BASE_URL = 'http://localhost:8080/api';

export type AuthErrorCode = 'validation_failed' | 'bad_request' | 'invalid_credentials' | 'unauthorized' | 'network_error';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly fields?: Record<string, string>;

  constructor(code: AuthErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

type ErrorBody = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new AuthError('network_error', 'Не удалось связаться с сервером');
  }

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // ignore
  }

  const code = (body.error as AuthErrorCode) ?? (response.status === 401 ? 'unauthorized' : 'bad_request');
  const message = body.message ?? defaultMessage(code);
  throw new AuthError(code, message, body.fields);
}

function defaultMessage(code: AuthErrorCode): string {
  switch (code) {
    case 'validation_failed': return 'Проверьте введённые данные';
    case 'invalid_credentials': return 'Неверный логин или пароль';
    case 'unauthorized': return 'Требуется авторизация';
    case 'network_error': return 'Нет связи с сервером';
    default: return 'Не удалось выполнить запрос';
  }
}

export function login(username: string, password: string): Promise<User> {
  return request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(username: string, password: string): Promise<User> {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

export function me(): Promise<User> {
  return request<User>('/auth/me', { method: 'GET' });
}
