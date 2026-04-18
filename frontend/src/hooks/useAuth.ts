import { useCallback, useEffect, useState } from 'react';
import { me as fetchMe, logout as logoutRequest } from '../services/auth';
import type { User } from '../types/user';

const EVENT_NAME = 'litiy:auth-changed';

type Status = 'loading' | 'authenticated' | 'guest';

export function emitAuthChanged(): void {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

async function loadCurrentUser(): Promise<User | null> {
  try {
    return await fetchMe();
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const applyResult = useCallback((next: User | null) => {
    setUser(next);
    setStatus(next ? 'authenticated' : 'guest');
  }, []);

  const refresh = useCallback(async () => {
    const current = await loadCurrentUser();
    applyResult(current);
  }, [applyResult]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      loadCurrentUser().then((current) => {
        if (!cancelled) applyResult(current);
      });
    };
    run();
    window.addEventListener(EVENT_NAME, run);
    return () => {
      cancelled = true;
      window.removeEventListener(EVENT_NAME, run);
    };
  }, [applyResult]);

  const logout = useCallback(async () => {
    await logoutRequest();
    applyResult(null);
    emitAuthChanged();
  }, [applyResult]);

  return { user, status, refresh, logout };
}
