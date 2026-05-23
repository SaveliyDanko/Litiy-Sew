import { useEffect, useState } from 'react';
import { MEDIA_BASE_URL, PRODUCTS_BY_CATEGORY } from '../pages/patternsData';
import { getCollectionHref } from '../pages/collectionsData';
import { fetchCollections, type DynamicCollection } from '../services/collections';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { SHOP_ENABLED } from '../utils/featureFlags';
import { imgSrcSetProps } from '../utils/imgSrcSet';
import ProductCard from './ProductCard';
import styles from './HeroSection.module.css';

const NEW_ARRIVALS = PRODUCTS_BY_CATEGORY.all.slice(0, 4);

type HeroData = {
  imageUrl: string;
  imageSrcSet: string | null;
  imageUrlMobile: string | null;
  imageSrcSetMobile: string | null;
  imageUrlTablet: string | null;
  imageSrcSetTablet: string | null;
  positionX: number;
  positionY: number;
  positionXMobile: number;
  positionYMobile: number;
  positionXTablet: number;
  positionYTablet: number;
  scale: number;
  scaleMobile: number;
  scaleTablet: number;
} | null;

async function fetchHeroBanner(): Promise<HeroData> {
  const res = await fetch('/api/hero');
  if (res.status === 204 || !res.ok) return null;
  const data = await res.json() as {
    imageUrl: string;
    imageSrcSet?: string | null;
    imageUrlMobile?: string | null;
    imageSrcSetMobile?: string | null;
    imageUrlTablet?: string | null;
    imageSrcSetTablet?: string | null;
    positionX?: number;
    positionY?: number;
    positionXMobile?: number;
    positionYMobile?: number;
    positionXTablet?: number;
    positionYTablet?: number;
    scale?: number;
    scaleMobile?: number;
    scaleTablet?: number;
  };
  return {
    imageUrl: data.imageUrl,
    imageSrcSet: data.imageSrcSet ?? null,
    imageUrlMobile: data.imageUrlMobile ?? null,
    imageSrcSetMobile: data.imageSrcSetMobile ?? null,
    imageUrlTablet: data.imageUrlTablet ?? null,
    imageSrcSetTablet: data.imageSrcSetTablet ?? null,
    positionX: data.positionX ?? 50,
    positionY: data.positionY ?? 50,
    positionXMobile: data.positionXMobile ?? 50,
    positionYMobile: data.positionYMobile ?? 50,
    positionXTablet: data.positionXTablet ?? 50,
    positionYTablet: data.positionYTablet ?? 50,
    scale: data.scale ?? 100,
    scaleMobile: data.scaleMobile ?? 100,
    scaleTablet: data.scaleTablet ?? 100,
  };
}

export default function HeroSection() {
  const [hero, setHero] = useState<HeroData>(null);
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());
  const [featured, setFeatured] = useState<DynamicCollection | null>(null);

  useEffect(() => {
    fetchHeroBanner().then(setHero);
    fetchAllSiteImages()
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
    fetchCollections()
      .then((list) => {
        const f = list.find((c) => c.featured) ?? list[0] ?? null;
        setFeatured(f);
      })
      .catch(() => {});
  }, []);

  function imgUrl(slotKey: string) {
    return siteImages.get(slotKey)?.imageUrl ?? null;
  }

  function imgStyle(slotKey: string): React.CSSProperties {
    const si = siteImages.get(slotKey);
    if (!si) return {};
    return {
      objectPosition: `${si.positionX}% ${si.positionY}%`,
      transform: `scale(${(si.scale ?? 100) / 100})`,
    };
  }

  const featuredCardPhoto = featured?.photos.find((p) => p.photoType === 'CARD') ?? featured?.photos[0] ?? null;

  return (
    <>
      <section
        className={styles.hero}
        style={hero ? ({
          '--hero-bg-offset-x': `${hero.positionX}%`,
          '--hero-bg-offset-y': `${hero.positionY}%`,
          '--hero-bg-offset-x-mobile': `${hero.positionXMobile}%`,
          '--hero-bg-offset-y-mobile': `${hero.positionYMobile}%`,
          '--hero-bg-offset-x-tablet': `${hero.positionXTablet}%`,
          '--hero-bg-offset-y-tablet': `${hero.positionYTablet}%`,
          '--hero-bg-scale': hero.scale / 100,
          '--hero-bg-scale-mobile': hero.scaleMobile / 100,
          '--hero-bg-scale-tablet': hero.scaleTablet / 100,
        } as React.CSSProperties) : undefined}
      >
        {hero && (
          <picture>
            {hero.imageUrlMobile && (
              <source
                media="(max-width: 639px)"
                srcSet={hero.imageSrcSetMobile ?? hero.imageUrlMobile}
                sizes="100vw"
              />
            )}
            {hero.imageUrlTablet && (
              <source
                media="(min-width: 640px) and (max-width: 1023px)"
                srcSet={hero.imageSrcSetTablet ?? hero.imageUrlTablet}
                sizes="100vw"
              />
            )}
            <img
              className={styles.bg}
              src={hero.imageUrl}
              {...imgSrcSetProps(hero.imageSrcSet, '100vw')}
              alt="Litiy Sew hero"
              fetchPriority="high"
            />
          </picture>
        )}
        <div className={styles.overlay} />

        <div className={styles.content}>
          <h1 className={styles.title}>
            <span className={styles.titleMobile} aria-hidden="true">
              <span className={styles.titleLine}>Litiy</span>
              <span className={styles.titleLine}>Sew</span>
            </span>
            <span className={styles.titleDesktop}>Litiy Sew</span>
            <span className={styles.srOnly}>Litiy Sew</span>
          </h1>

          <a href="/collections" className={styles.card}>
            {imgUrl('home-card-image') && (
              <div className={styles.cardImageWrap}>
                <img
                  className={styles.cardImage}
                  src={imgUrl('home-card-image')!}
                  alt="Новая коллекция"
                  style={imgStyle('home-card-image')}
                />
              </div>
            )}
            <span className={styles.btn}>НОВАЯ КОЛЛЕКЦИЯ</span>
          </a>
        </div>
      </section>

      {SHOP_ENABLED && (
        <section className={styles.arrivals}>
          <header className={styles.arrivalsHeader}>
            <h2 className={styles.arrivalsTitle}>Новинки:</h2>
            <a href="/patterns" className={styles.arrivalsLink}>
              все выкройки <span aria-hidden="true">→</span>
            </a>
          </header>

          <div className={styles.arrivalsGrid}>
            {NEW_ARRIVALS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageSrc={`${MEDIA_BASE_URL}/${product.image}`}
                href={`/patterns/all/${product.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {SHOP_ENABLED && (
        <section className={styles.tagline}>
          <p className={styles.taglineText}>
            Выкройки LitiySew легко распечатать, а наши инструкции подробно описывают каждый шаг с дополнительными фотографиями.
          </p>
          <p className={styles.taglineText}>
            Поэтому шить наши изделия можно даже без предварительного опыта пошива.
          </p>
        </section>
      )}

      {featured && (
        <section
          className={`${styles.featured} ${!SHOP_ENABLED && !siteImages.get('home-featured-media')?.containerHeight ? styles.featuredFullscreen : ''}`}
        >
          <a
            href={getCollectionHref(featured.slug)}
            className={styles.featuredMedia}
            aria-label={`Открыть коллекцию ${featured.title}`}
            style={(() => {
              const si = siteImages.get('home-featured-media');
              if (!si) return undefined;
              const s = {
                ...(si.containerHeight ? { '--featured-media-height-desktop': `${si.containerHeight}px` } : {}),
                ...(si.containerHeightMobile ? { '--featured-media-height-mobile': `${si.containerHeightMobile}px` } : {}),
              } as React.CSSProperties;
              return Object.keys(s).length ? s : undefined;
            })()}
          >
            {featuredCardPhoto ? (
              <img
                className={styles.featuredImage}
                src={featuredCardPhoto.imageUrl}
                {...imgSrcSetProps(featuredCardPhoto.imageSrcSet, '(min-width: 1024px) 50vw, 100vw')}
                alt={featured.title}
                loading="lazy"
                style={{ objectPosition: `${featuredCardPhoto.positionX}% ${featuredCardPhoto.positionY}%`, transform: `scale(${(featuredCardPhoto.scale ?? 100) / 100})` }}
              />
            ) : (
              <div className={styles.featuredGlow} />
            )}
            <div className={styles.featuredGlow} />
          </a>

          <div className={styles.featuredCopy}>
            <h2 className={styles.featuredTitle}>{featured.title}</h2>
            <p className={styles.featuredSubtitle}>{featured.subtitle ?? ''}</p>
          </div>
        </section>
      )}
    </>
  );
}
