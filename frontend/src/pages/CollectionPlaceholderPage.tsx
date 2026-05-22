import { useEffect, useMemo, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchCollection, type DynamicCollection } from '../services/collections';
import styles from './CollectionPlaceholderPage.module.css';

export default function CollectionPlaceholderPage() {
  const slug = window.location.pathname.replace('/collections/', '').replace(/\/+$/, '');
  const [collection, setCollection] = useState<DynamicCollection | null | undefined>(undefined);
  const mosaicCols = useMemo(() => (window.innerWidth < 640 ? 2 : 3), []);

  useEffect(() => {
    if (!slug) { setCollection(null); return; }
    fetchCollection(slug)
      .then(setCollection)
      .catch(() => setCollection(null));
  }, [slug]);

  if (collection === undefined) {
    return (
      <>
        <Header />
        <main className={styles.page} />
        <Footer />
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <div className={styles.notFound}>
            <p className={styles.eyebrow}>Collection</p>
            <h1 className={styles.notFoundTitle}>Страница не найдена</h1>
            <a href="/collections" className={styles.backLink}>Вернуться к коллекциям</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const heroPhoto = collection.photos.find((p) => p.photoType === 'HERO');
  const cardPhoto = collection.photos.find((p) => p.photoType === 'CARD');
  const galleryPhotos = collection.photos
    .filter((p) => p.photoType === 'GALLERY')
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const heroDisplay = heroPhoto ?? cardPhoto ?? null;

  // First two gallery photos go into the detail strip; the rest into the mosaic
  const detailPhotos = galleryPhotos.slice(0, 2);
  const mosaicPhotos = galleryPhotos.slice(2);

  return (
    <>
      <Header transparent />

      <main className={styles.page}>
        {/* ── Full-screen hero ─────────────────────────────────────────── */}
        <section className={styles.hero}>
          {heroDisplay ? (
            <img
              className={styles.heroImage}
              src={heroDisplay.imageUrl}
              alt={collection.title}
              fetchPriority="high"
              style={{
                objectPosition: `${heroDisplay.positionX}% ${heroDisplay.positionY}%`,
                transform: `scale(${(heroDisplay.scale ?? 100) / 100})`,
              }}
            />
          ) : (
            <div className={styles.heroPlaceholder} />
          )}
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>{collection.eyebrow ?? 'Collection'}</p>
            <h1 className={styles.heroTitle}>{collection.title}</h1>
          </div>
        </section>

        {/* ── Detail strip: two photos + description ───────────────────── */}
        {(detailPhotos.length > 0 || collection.detailIntro || collection.detailFocus) && (
          <section className={styles.detail}>
            <div className={styles.detailInner}>
              {detailPhotos[0] && (
                <div className={styles.detailPhoto}>
                  <img
                    className={styles.detailImage}
                    src={detailPhotos[0].imageUrl}
                    alt={collection.title}
                    loading="lazy"
                    style={{
                      objectPosition: `${detailPhotos[0].positionX}% ${detailPhotos[0].positionY}%`,
                      transform: `scale(${(detailPhotos[0].scale ?? 100) / 100})`,
                    }}
                  />
                </div>
              )}

              <div className={styles.detailText}>
                {collection.detailIntro && <p className={styles.detailIntro}>{collection.detailIntro}</p>}
                {collection.detailFocus && <p className={styles.detailFocus}>{collection.detailFocus}</p>}
              </div>

              {detailPhotos[1] && (
                <div className={styles.detailPhoto}>
                  <img
                    className={styles.detailImage}
                    src={detailPhotos[1].imageUrl}
                    alt={collection.title}
                    loading="lazy"
                    style={{
                      objectPosition: `${detailPhotos[1].positionX}% ${detailPhotos[1].positionY}%`,
                      transform: `scale(${(detailPhotos[1].scale ?? 100) / 100})`,
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Mosaic gallery ───────────────────────────────────────────── */}
        {mosaicPhotos.length > 0 && (
          <section className={styles.mosaic}>
            <div className={styles.mosaicGrid}>
              {Array.from({ length: mosaicCols }, (_, colIdx) => (
                <div key={colIdx} className={styles.mosaicCol}>
                  {mosaicPhotos
                    .filter((_, i) => i % mosaicCols === colIdx)
                    .map((photo, index) => (
                      <div key={photo.id} className={styles.mosaicItem}>
                        <img
                          className={styles.mosaicImage}
                          src={photo.imageUrl}
                          alt={`${collection.title} — ${colIdx + index * mosaicCols + 1}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.backWrap}>
          <a href="/collections" className={styles.backLink}>← Все коллекции</a>
        </div>
      </main>

      <Footer />
    </>
  );
}
