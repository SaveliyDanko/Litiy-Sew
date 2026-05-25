import { normalizeMediaSrcSet } from './mediaUrls';

/**
 * Returns srcSet/sizes props for an <img> tag.
 * Pass the srcset string from the backend (e.g. "https://.../400.webp 400w, ...").
 * Falls back gracefully if srcset is null/empty.
 */
export function imgSrcSetProps(
  srcset: string | null | undefined,
  sizes = '100vw',
): { srcSet?: string; sizes?: string } {
  if (!srcset) return {};
  return { srcSet: normalizeMediaSrcSet(srcset), sizes };
}
