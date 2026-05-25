/**
 * Module-scope SWR-like cache for GET requests that drive the public site (hero,
 * site images, collections list). Survives client-side navigation between pages
 * — the first visit to `/` fetches, subsequent visits show the cached payload
 * synchronously and revalidate in the background.
 *
 * Lives only in memory: a full page reload (F5) clears it. That's enough — the
 * real win is repeated SPA navigation, not first-paint of a hard refresh.
 */

type Subscriber<T> = (data: T) => void;

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();
const subscribers = new Map<string, Set<Subscriber<unknown>>>();

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

/**
 * Fetch with stale-while-revalidate semantics.
 *
 * @param key      cache key
 * @param loader   thunk that performs the actual network request
 * @param onUpdate optional callback fired when a fresh value arrives later
 * @returns        the cached value (sync, may be undefined) — caller should call
 *                 `useCachedFetch` or pass `onUpdate` to also receive the fresh one
 */
export async function cachedFetch<T>(key: string, loader: () => Promise<T>, onUpdate?: Subscriber<T>): Promise<T> {
  if (onUpdate) {
    let set = subscribers.get(key);
    if (!set) { set = new Set(); subscribers.set(key, set); }
    set.add(onUpdate as Subscriber<unknown>);
  }

  // /api/bootstrap pre-seeds public-content keys before React mounts. If a
  // cached value is already present AND no fetch is in flight for this key,
  // skip the loader entirely — this avoids the 5 redundant per-resource HTTP
  // requests that bootstrap is meant to replace.
  // (If you need explicit revalidation after a mutation, call invalidateCache.)
  const cached = cache.get(key) as T | undefined;
  if (cached !== undefined && !inflight.has(key)) {
    return cached;
  }

  // Deduplicate concurrent calls for the same key
  let p = inflight.get(key) as Promise<T> | undefined;
  if (!p) {
    p = loader().then((data) => {
      cache.set(key, data);
      const subs = subscribers.get(key);
      if (subs) for (const fn of subs) (fn as Subscriber<T>)(data);
      return data;
    }).finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, p as Promise<unknown>);
  }

  // If we already have a cached value, resolve fast with it but keep `p` going
  if (cached !== undefined) return cached;
  return p;
}

/**
 * Pre-fill a cache entry without making a network request. Used by the
 * /api/bootstrap path: one HTTP round-trip seeds hero / collections / siteImages
 * / siteTexts / portfolio at once, then per-page `cachedFetch` calls hit the
 * warm cache and skip the network entirely until invalidation.
 *
 * Also fires any subscribers registered for the key so already-mounted
 * components re-render with the fresh data.
 */
export function seedCache<T>(key: string, data: T): void {
  cache.set(key, data);
  const subs = subscribers.get(key);
  if (subs) for (const fn of subs) (fn as Subscriber<T>)(data);
}

/** Test helper / admin invalidation hook. */
export function invalidateCache(key?: string) {
  if (key === undefined) { cache.clear(); inflight.clear(); return; }
  cache.delete(key);
  inflight.delete(key);
}
