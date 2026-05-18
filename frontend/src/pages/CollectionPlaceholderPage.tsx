import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchCollectionsMeta, type CollectionMeta } from '../services/admin';
import { fetchCollection, type DynamicCollection } from '../services/collections';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { getCollectionBySlug } from './collectionsData';
import styles from './CollectionPlaceholderPage.module.css';

export default function CollectionPlaceholderPage() {
  const slug = window.location.pathname.replace('/collections/', '').replace(/\/+$/, '');
  const staticCollection = getCollectionBySlug(slug);

  const [siteImages, setSiteImages] = useState<Map<string, SiteImage>>(new Map());
  const [meta, setMeta] = useState<CollectionMeta | null>(null);
  const [dynamic, setDynamic] = useState<DynamicCollection | null | undefined>(undefined);

  useEffect(() => {
    fetchAllSiteImages()
      .then((list) => setSiteImages(new Map(list.map((img) => [img.slotKey, img]))))
      .catch(() => {});
    if (slug) {
      fetchCollectionsMeta()
        .then((map) => setMeta(map[slug] ?? null))
        .catch(() => {});
      fetchCollection(slug)
        .then((c) => setDynamic(c))
        .catch(() => setDynamic(null));
    } else {
      setDynamic(null);
    }
  }, [slug]);

  // Still loading dynamic data
  if (dynamic === undefined) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.lookPage}>
            <p className={styles.intro}>Загрузка…</p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Not found in either system
  if (!dynamic && !staticCollection) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.lookPage}>
            <p className={styles.eyebrow}>Collection</p>
            <h1 className={styles.title}>Страница не найдена</h1>
            <p className={styles.intro}>
              Для этой коллекции пока нет отдельной страницы. Можно вернуться к общему списку коллекций.
            </p>
            <a href="/collections" className={styles.backLink}>Вернуться к коллекциям</a>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── Dynamic collection rendering ──────────────────────────────────────────
  if (dynamic) {
    const heroPhoto = dynamic.photos.find((p) => p.photoType === 'HERO');
    const galleryPhotos = dynamic.photos
      .filter((p) => p.photoType === 'GALLERY')
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const cardPhoto = dynamic.photos.find((p) => p.photoType === 'CARD');

    return (
      <>
        <Header />
        <main className={styles.page}>
          <section className={styles.lookPage}>
            <a href="/collections" className={styles.backLink}>Назад к коллекциям</a>
            <p className={styles.eyebrow}>{dynamic.eyebrow ?? 'Collection'}</p>
            <h1 className={styles.title}>{dynamic.title}</h1>

            <div className={styles.heroMedia}>
              {heroPhoto ? (
                <img
                  className={styles.heroImage}
                  src={heroPhoto.imageUrl}
                  alt={dynamic.title}
                  style={{ objectPosition: `${heroPhoto.positionX}% ${heroPhoto.positionY}%` }}
                />
              ) : cardPhoto ? (
                <img
                  className={styles.heroImage}
                  src={cardPhoto.imageUrl}
                  alt={dynamic.title}
                  style={{ objectPosition: `${cardPhoto.positionX}% ${cardPhoto.positionY}%` }}
                />
              ) : (
                <div className={styles.heroPlaceholder} />
              )}
              <div className={styles.heroOverlay} />
            </div>

            {dynamic.detailIntro && <p className={styles.intro}>{dynamic.detailIntro}</p>}
            {dynamic.detailFocus && <p className={styles.focus}>{dynamic.detailFocus}</p>}

            {galleryPhotos.length > 0 && (
              <div className={styles.galleryGrid}>
                {galleryPhotos.map((photo, index) => (
                  <div key={photo.id} className={styles.galleryItem}>
                    <img
                      className={styles.galleryImage}
                      src={photo.imageUrl}
                      alt={`${dynamic.title} — образ ${index + 1}`}
                      style={{ objectPosition: `${photo.positionX}% ${photo.positionY}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── Static collection rendering ───────────────────────────────────────────
  const collection = staticCollection!;

  function imgUrl(slotKey: string) {
    return siteImages.get(slotKey)?.imageUrl ?? null;
  }

  function imgStyle(slotKey: string): React.CSSProperties {
    const si = siteImages.get(slotKey);
    return si ? { objectPosition: `${si.positionX}% ${si.positionY}%` } : {};
  }

  const heroUrl = imgUrl(collection.detailHeroSlotKey);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.lookPage}>
          <a href="/collections" className={styles.backLink}>Назад к коллекциям</a>
          <p className={styles.eyebrow}>{collection.eyebrow}</p>
          <h1 className={styles.title}>{meta?.title ?? collection.title}</h1>

          <div className={styles.heroMedia}>
            {heroUrl ? (
              <img
                className={styles.heroImage}
                src={heroUrl}
                alt={collection.title}
                style={imgStyle(collection.detailHeroSlotKey)}
              />
            ) : (
              <div className={styles.heroPlaceholder} />
            )}
            <div className={styles.heroOverlay} />
          </div>

          <p className={styles.intro}>{collection.detailIntro}</p>

          <p className={styles.focus}>{collection.detailFocus}</p>

          <div className={styles.galleryGrid}>
            {collection.detailGallerySlotKeys.map((slotKey, index) => {
              const url = imgUrl(slotKey);
              return (
                <div key={slotKey} className={styles.galleryItem}>
                  {url ? (
                    <img
                      className={styles.galleryImage}
                      src={url}
                      alt={`${collection.title} — образ ${index + 1}`}
                      style={imgStyle(slotKey)}
                    />
                  ) : (
                    <div className={styles.galleryPlaceholder} />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
