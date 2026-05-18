import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import {
  FEATURED_COLLECTION,
  SOLO_COLLECTIONS,
  getCollectionHref,
} from './collectionsData';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());

  useEffect(() => {
    fetchAllSiteImages()
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
  }, []);

  function imgUrl(slotKey: string) {
    return siteImages.get(slotKey)?.imageUrl ?? null;
  }

  function imgStyle(slotKey: string): React.CSSProperties {
    const si = siteImages.get(slotKey);
    return si ? { objectPosition: `${si.positionX}% ${si.positionY}%` } : {};
  }

  const featuredUrl = imgUrl(FEATURED_COLLECTION.cardSlotKey);

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.featured}>
          <a
            href={getCollectionHref(FEATURED_COLLECTION.slug)}
            className={styles.featuredMedia}
            aria-label={`Открыть коллекцию ${FEATURED_COLLECTION.title}`}
          >
            {featuredUrl ? (
              <img
                className={styles.featuredImage}
                src={featuredUrl}
                alt={FEATURED_COLLECTION.title}
                style={imgStyle(FEATURED_COLLECTION.cardSlotKey)}
              />
            ) : (
              <div className={styles.featuredPlaceholder} />
            )}
          </a>

          <div className={styles.featuredCopy}>
            <p className={styles.featuredEyebrow}>{FEATURED_COLLECTION.eyebrow}</p>
            <h1 className={styles.featuredTitle}>{FEATURED_COLLECTION.title}</h1>
            <p className={styles.featuredSubtitle}>{FEATURED_COLLECTION.subtitle}</p>
            <p className={styles.featuredDescription}>{FEATURED_COLLECTION.description}</p>
          </div>
        </section>

        <section className={styles.solo}>
          <div className={styles.soloHeading}>
            <p className={styles.soloEyebrow}>Подборка образов</p>
            <h2 className={styles.soloTitle}>Одиночные модели:</h2>
          </div>

          <div className={styles.soloGrid}>
            {SOLO_COLLECTIONS.map((collection, index) => {
              const cardUrl = imgUrl(collection.cardSlotKey);
              return (
                <a
                  key={collection.slug}
                  href={getCollectionHref(collection.slug)}
                  className={styles.cardLink}
                  aria-label={`Открыть коллекцию ${collection.title}`}
                >
                  <article className={styles.card} data-tone={collection.tone}>
                    <div className={styles.cardMedia}>
                      <div className={styles.cardBadge}>Look {String(index + 1).padStart(2, '0')}</div>
                      {cardUrl ? (
                        <img
                          className={styles.cardImage}
                          src={cardUrl}
                          alt={collection.title}
                          style={imgStyle(collection.cardSlotKey)}
                        />
                      ) : (
                        <div className={styles.cardPlaceholder} />
                      )}
                      <div className={styles.cardOverlay} />
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.cardSubtitle}>{collection.subtitle}</p>
                      <h3 className={styles.cardTitle}>{collection.title}</h3>
                      <p className={styles.cardDescription}>{collection.description}</p>
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
