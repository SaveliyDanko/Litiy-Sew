import { normalizeMediaFields } from '../utils/mediaUrls';
import { seedCache } from '../utils/cachedFetch';
import type { DynamicCollection } from './collections';
import type { PortfolioPhoto } from './portfolio';
import type { PortfolioProject } from './portfolioProjects';
import type { SiteImage } from './siteImages';
import type { SiteText } from './siteTexts';

type HeroData = {
  imageUrl: string;
  imageUrlMobile?: string | null;
  imageUrlTablet?: string | null;
  imageSrcSet?: string | null;
  imageSrcSetMobile?: string | null;
  imageSrcSetTablet?: string | null;
  positionX: number; positionY: number;
  positionXMobile: number; positionYMobile: number;
  positionXTablet: number; positionYTablet: number;
  scale: number; scaleMobile: number; scaleTablet: number;
} | null;

export type BootstrapResponse = {
  hero: HeroData;
  collections: DynamicCollection[];
  siteImages: SiteImage[];
  siteTexts: SiteText[];
  portfolioPhotos: PortfolioPhoto[];
  portfolioProjects: PortfolioProject[];
};

/**
 * One HTTP round-trip → all public content needed by home + about pages.
 * Replaces 5 parallel requests (hero, collections, siteImages, siteTexts,
 * portfolio, portfolio-projects). Seeds the shared cachedFetch store so
 * per-page useEffect calls hit a warm cache and skip the network.
 */
export async function fetchBootstrap(): Promise<BootstrapResponse | null> {
  try {
    const res = await fetch('/api/bootstrap');
    if (!res.ok) return null;
    const raw = await res.json() as BootstrapResponse;
    const data = normalizeMediaFields(raw);

    seedCache('hero', data.hero);
    seedCache('collections', data.collections);
    seedCache('siteImages', data.siteImages);
    seedCache('siteTexts', data.siteTexts);
    seedCache('portfolioPhotos', data.portfolioPhotos);
    seedCache('portfolioProjects', data.portfolioProjects);

    return data;
  } catch {
    return null;
  }
}
