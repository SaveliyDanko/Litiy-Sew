import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchCollections, type DynamicCollection } from '../services/collections';
import { getCollectionHref } from './collectionsData';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<DynamicCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function cardPhoto(c: DynamicCollection) {
    return c.photos.find((p) => p.photoType === 'CARD') ?? c.photos[0] ?? null;
  }

  const featured = collections.find((c) => c.featured) ?? collections[0] ?? null;
  const soloList = collections.filter((c) => c !== featured);

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.page} />
        <Footer />
      </>
    );
  }

  if (!featured) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.featured}>
            <div className={styles.featuredCopy}>
              <h1 className={styles.featuredTitle}>Коллекции</h1>
              <p className={styles.featuredSubtitle}>Коллекции пока не добавлены</p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const featuredCard = cardPhoto(featured);

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.featured}>
          <a
            href={getCollectionHref(featured.slug)}
            className={styles.featuredMedia}
            aria-label={`Открыть коллекцию ${featured.title}`}
          >
            {featuredCard ? (
              <img
                className={styles.featuredImage}
                src={featuredCard.imageUrl}
                alt={featured.title}
                style={{ objectPosition: `${featuredCard.positionX}% ${featuredCard.positionY}%` }}
              />
            ) : (
              <div className={styles.featuredPlaceholder} />
            )}
          </a>

          <div className={styles.featuredCopy}>
            <p className={styles.featuredEyebrow}>{featured.eyebrow ?? ''}</p>
            <h1 className={styles.featuredTitle}>{featured.title}</h1>
            <p className={styles.featuredSubtitle}>{featured.subtitle ?? ''}</p>
            <p className={styles.featuredDescription}>{featured.description ?? ''}</p>
          </div>
        </section>

        {soloList.length > 0 && (
          <section className={styles.solo}>
            <div className={styles.soloHeading}>
              <p className={styles.soloEyebrow}>Подборка образов</p>
              <h2 className={styles.soloTitle}>Одиночные модели:</h2>
            </div>

            <div className={styles.soloGrid}>
              {soloList.map((collection, index) => {
                const photo = cardPhoto(collection);
                return (
                  <a
                    key={collection.slug}
                    href={getCollectionHref(collection.slug)}
                    className={styles.cardLink}
                    aria-label={`Открыть коллекцию ${collection.title}`}
                  >
                    <article className={styles.card} data-tone={collection.tone}>
                      <div className={styles.cardMedia}>
                        <div className={styles.cardBadge}>
                          Look {String(index + 1).padStart(2, '0')}
                        </div>
                        {photo ? (
                          <img
                            className={styles.cardImage}
                            src={photo.imageUrl}
                            alt={collection.title}
                            style={{ objectPosition: `${photo.positionX}% ${photo.positionY}%` }}
                          />
                        ) : (
                          <div className={styles.cardPlaceholder} />
                        )}
                        <div className={styles.cardOverlay} />
                      </div>

                      <div className={styles.cardBody}>
                        <p className={styles.cardSubtitle}>{collection.subtitle ?? ''}</p>
                        <h3 className={styles.cardTitle}>{collection.title}</h3>
                        <p className={styles.cardDescription}>{collection.description ?? ''}</p>
                      </div>
                    </article>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
