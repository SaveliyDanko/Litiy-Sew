import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchCollection, type DynamicCollection } from '../services/collections';
import styles from './CollectionPlaceholderPage.module.css';

export default function CollectionPlaceholderPage() {
  const slug = window.location.pathname.replace('/collections/', '').replace(/\/+$/, '');
  const [collection, setCollection] = useState<DynamicCollection | null | undefined>(undefined);

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
        <main className={styles.page}>
          <section className={styles.lookPage}>
            <p className={styles.intro}>Загрузка…</p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!collection) {
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

  const heroPhoto = collection.photos.find((p) => p.photoType === 'HERO');
  const cardPhoto = collection.photos.find((p) => p.photoType === 'CARD');
  const galleryPhotos = collection.photos
    .filter((p) => p.photoType === 'GALLERY')
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const heroDisplay = heroPhoto ?? cardPhoto ?? null;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.lookPage}>
          <a href="/collections" className={styles.backLink}>Назад к коллекциям</a>
          <p className={styles.eyebrow}>{collection.eyebrow ?? 'Collection'}</p>
          <h1 className={styles.title}>{collection.title}</h1>

          <div className={styles.heroMedia}>
            {heroDisplay ? (
              <img
                className={styles.heroImage}
                src={heroDisplay.imageUrl}
                alt={collection.title}
                style={{ objectPosition: `${heroDisplay.positionX}% ${heroDisplay.positionY}%` }}
              />
            ) : (
              <div className={styles.heroPlaceholder} />
            )}
            <div className={styles.heroOverlay} />
          </div>

          {collection.detailIntro && <p className={styles.intro}>{collection.detailIntro}</p>}
          {collection.detailFocus && <p className={styles.focus}>{collection.detailFocus}</p>}

          {galleryPhotos.length > 0 && (
            <div className={styles.galleryGrid}>
              {galleryPhotos.map((photo, index) => (
                <div key={photo.id} className={styles.galleryItem}>
                  <img
                    className={styles.galleryImage}
                    src={photo.imageUrl}
                    alt={`${collection.title} — образ ${index + 1}`}
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
