import type { User } from '../types/user';

const API_BASE_URL = 'http://localhost:8080/api';

export type AuthErrorCode =
  | 'validation_failed'
  | 'bad_request'
  | 'invalid_credentials'
  | 'unauthorized'
  | 'network_error'
  | 'email_not_verified'
  | 'email_already_verified'
  | 'invalid_code'
  | 'code_expired'
  | 'challenge_not_found'
  | 'too_many_attempts'
  | 'resend_too_soon';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly fields?: Record<string, string>;
  readonly retryAfterSeconds?: number;

  constructor(
    code: AuthErrorCode,
    message: string,
    fields?: Record<string, string>,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.code = code;
    this.fields = fields;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type ErrorBody = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
};

export type RegisterResponse = {
  userId: number | null;
  email: string;
  status: string;
  expiresInSeconds: number;
};

export type LoginChallengeResponse = {
  challengeId: string;
  email: string;
  expiresInSeconds: number;
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
  throw new AuthError(code, message, body.fields, body.retryAfterSeconds);
}

function defaultMessage(code: AuthErrorCode): string {
  switch (code) {
    case 'validation_failed': return 'Проверьте введённые данные';
    case 'invalid_credentials': return 'Неверный email или пароль';
    case 'unauthorized': return 'Требуется авторизация';
    case 'network_error': return 'Нет связи с сервером';
    case 'email_not_verified': return 'Email не подтверждён';
    case 'email_already_verified': return 'Email уже подтверждён';
    case 'invalid_code': return 'Неверный код подтверждения';
    case 'code_expired': return 'Срок действия кода истёк';
    case 'challenge_not_found': return 'Сессия подтверждения не найдена';
    case 'too_many_attempts': return 'Слишком много попыток. Попробуйте позже';
    case 'resend_too_soon': return 'Повторная отправка кода пока недоступна';
    default: return 'Не удалось выполнить запрос';
  }
}

export function register(email: string, password: string): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function verifyEmail(email: string, code: string): Promise<User> {
  return request<User>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export function resendCode(email: string): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/resend-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function login(email: string, password: string): Promise<LoginChallengeResponse> {
  return request<LoginChallengeResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function loginVerify(challengeId: string, code: string): Promise<User> {
  return request<User>('/auth/login/verify', {
    method: 'POST',
    body: JSON.stringify({ challengeId, code }),
  });
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

export function me(): Promise<User> {
  return request<User>('/auth/me', { method: 'GET' });
}
