import { useEffect, useState } from 'react';
import { MEDIA_BASE_URL, PRODUCTS_BY_CATEGORY } from '../pages/patternsData';
import { getCollectionHref } from '../pages/collectionsData';
import { fetchCollections, type DynamicCollection } from '../services/collections';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { SHOP_ENABLED } from '../utils/featureFlags';
import ProductCard from './ProductCard';
import styles from './HeroSection.module.css';

const NEW_ARRIVALS = PRODUCTS_BY_CATEGORY.all.slice(0, 4);

type HeroData = {
  imageUrl: string;
  imageUrlMobile: string | null;
  positionX: number;
  positionY: number;
  positionXMobile: number;
  positionYMobile: number;
  scale: number;
  scaleMobile: number;
} | null;

async function fetchHeroBanner(): Promise<HeroData> {
  const res = await fetch('/api/hero');
  if (res.status === 204 || !res.ok) return null;
  const data = await res.json() as {
    imageUrl: string;
    imageUrlMobile?: string | null;
    positionX?: number;
    positionY?: number;
    positionXMobile?: number;
    positionYMobile?: number;
    scale?: number;
    scaleMobile?: number;
  };
  return {
    imageUrl: data.imageUrl,
    imageUrlMobile: data.imageUrlMobile ?? null,
    positionX: data.positionX ?? 50,
    positionY: data.positionY ?? 50,
    positionXMobile: data.positionXMobile ?? 50,
    positionYMobile: data.positionYMobile ?? 50,
    scale: data.scale ?? 100,
    scaleMobile: data.scaleMobile ?? 100,
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
          '--hero-bg-scale': hero.scale / 100,
          '--hero-bg-scale-mobile': hero.scaleMobile / 100,
        } as React.CSSProperties) : undefined}
      >
        {hero && (
          <picture>
            {hero.imageUrlMobile && (
              <source media="(max-width: 639px)" srcSet={hero.imageUrlMobile} />
            )}
            <img
              className={styles.bg}
              src={hero.imageUrl}
              alt="Litiy Sew hero"
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

          <div className={styles.card}>
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
            <a href="/collections" className={styles.btn}>
              НОВАЯ КОЛЛЕКЦИЯ
            </a>
          </div>
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
          className={`${styles.featured} ${!SHOP_ENABLED ? styles.featuredFullscreen : ''}`}
          style={(() => {
            const h = siteImages.get('home-featured-media')?.containerHeight;
            return h ? ({ '--featured-media-height': `${h}px` } as React.CSSProperties) : undefined;
          })()}
        >
          <a
            href={getCollectionHref(featured.slug)}
            className={styles.featuredMedia}
            aria-label={`Открыть коллекцию ${featured.title}`}
          >
            {featuredCardPhoto ? (
              <img
                className={styles.featuredImage}
                src={featuredCardPhoto.imageUrl}
                alt={featured.title}
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
