const MEDIA_PATH_RE = /^https?:\/\/[^/]+(\/media\/.*)$/i;

const MEDIA_URL_FIELDS = new Set([
  'imageUrl',
  'imageUrlMobile',
  'imageUrlTablet',
  'photoUrl',
  'previewUrl',
]);

const MEDIA_SRCSET_FIELDS = new Set([
  'imageSrcSet',
  'imageSrcSetMobile',
  'imageSrcSetTablet',
  'photoSrcSet',
  'previewSrcSet',
]);

export function normalizeMediaUrl<T extends string | null | undefined>(url: T): T {
  if (!url) return url;
  return url.replace(MEDIA_PATH_RE, '$1') as T;
}

export function normalizeMediaSrcSet<T extends string | null | undefined>(srcset: T): T {
  if (!srcset) return srcset;
  return srcset
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      const firstSpace = trimmed.search(/\s/);
      if (firstSpace === -1) return normalizeMediaUrl(trimmed);
      const url = trimmed.slice(0, firstSpace);
      const descriptor = trimmed.slice(firstSpace);
      return `${normalizeMediaUrl(url)}${descriptor}`;
    })
    .join(', ') as T;
}

export function normalizeMediaFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeMediaFields(item)) as T;
  }

  if (!value || typeof value !== 'object') return value;

  const normalized: Record<string, unknown> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue === 'string' && MEDIA_URL_FIELDS.has(key)) {
      normalized[key] = normalizeMediaUrl(fieldValue);
    } else if (typeof fieldValue === 'string' && MEDIA_SRCSET_FIELDS.has(key)) {
      normalized[key] = normalizeMediaSrcSet(fieldValue);
    } else {
      normalized[key] = normalizeMediaFields(fieldValue);
    }
  }
  return normalized as T;
}
