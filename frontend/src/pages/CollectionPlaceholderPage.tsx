import { useEffect, useState } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { fetchAllSiteImages, type SiteImage } from '../services/siteImages';
import { getCollectionBySlug } from './collectionsData';
import styles from './CollectionPlaceholderPage.module.css';

export default function CollectionPlaceholderPage() {
  const slug = window.location.pathname.replace('/collections/', '').replace(/\/+$/, '');
  const collection = getCollectionBySlug(slug);
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

  const heroUrl = imgUrl(collection.detailHeroSlotKey);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.lookPage}>
          <a href="/collections" className={styles.backLink}>Назад к коллекциям</a>
          <p className={styles.eyebrow}>{collection.eyebrow}</p>
          <h1 className={styles.title}>{collection.title}</h1>

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
