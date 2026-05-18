import { useEffect, useState } from 'react';
import {
  FEATURED_COLLECTION,
  getCollectionHref,
} from '../pages/collectionsData';
import { MEDIA_BASE_URL, PRODUCTS_BY_CATEGORY } from '../pages/patternsData';
import { fetchSiteImage } from '../services/siteImages';
import { SHOP_ENABLED } from '../utils/featureFlags';
import ProductCard from './ProductCard';
import styles from './HeroSection.module.css';

const NEW_ARRIVALS = PRODUCTS_BY_CATEGORY.all.slice(0, 4);

type HeroData = { imageUrl: string; positionX: number; positionY: number } | null;

async function fetchHeroBanner(): Promise<HeroData> {
  const res = await fetch('/api/hero');
  if (res.status === 204 || !res.ok) return null;
  const data = await res.json() as { imageUrl: string; positionX?: number; positionY?: number };
  return { imageUrl: data.imageUrl, positionX: data.positionX ?? 50, positionY: data.positionY ?? 50 };
}

export default function HeroSection() {
  const [hero, setHero] = useState<HeroData>(null);
  const [featuredImgUrl, setFeaturedImgUrl] = useState<string | null>(null);
  const [featuredImgStyle, setFeaturedImgStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    fetchHeroBanner().then(setHero);
    fetchSiteImage(FEATURED_COLLECTION.cardSlotKey).then((si) => {
      if (si) {
        setFeaturedImgUrl(si.imageUrl);
        setFeaturedImgStyle({ objectPosition: `${si.positionX}% ${si.positionY}%` });
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      <section
        className={styles.hero}
        style={hero ? ({
          '--hero-bg-offset-x': `${hero.positionX}%`,
          '--hero-bg-offset-y': `${hero.positionY}%`,
        } as React.CSSProperties) : undefined}
      >
        {hero && (
          <img
            className={styles.bg}
            src={hero.imageUrl}
            alt="Litiy Sew hero"
          />
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

      <section className={`${styles.featured} ${!SHOP_ENABLED ? styles.featuredFullscreen : ''}`}>
        <a
          href={getCollectionHref(FEATURED_COLLECTION.slug)}
          className={styles.featuredMedia}
          aria-label={`Открыть коллекцию ${FEATURED_COLLECTION.title}`}
        >
          {featuredImgUrl && (
            <img
              className={styles.featuredImage}
              src={featuredImgUrl}
              alt={FEATURED_COLLECTION.title}
              style={featuredImgStyle}
            />
          )}
          <div className={styles.featuredGlow} />
        </a>

        <div className={styles.featuredCopy}>
          <h2 className={styles.featuredTitle}>{FEATURED_COLLECTION.title}</h2>
          <p className={styles.featuredSubtitle}>{FEATURED_COLLECTION.subtitle}</p>
        </div>
      </section>
    </>
  );
}
