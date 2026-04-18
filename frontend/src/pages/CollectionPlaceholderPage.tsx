import Header from '../components/Header';
import {
  getCollectionBySlug,
  getCollectionImageUrl,
} from './collectionsData';
import styles from './CollectionPlaceholderPage.module.css';

export default function CollectionPlaceholderPage() {
  const slug = window.location.pathname.replace('/collections/', '').replace(/\/+$/, '');
  const collection = getCollectionBySlug(slug);

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
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.lookPage}>
          <a href="/collections" className={styles.backLink}>Назад к коллекциям</a>
          <p className={styles.eyebrow}>{collection.eyebrow}</p>
          <h1 className={styles.title}>{collection.title}</h1>

          <div className={styles.heroMedia}>
            <img
              className={styles.heroImage}
              src={getCollectionImageUrl(collection.detailHeroImagePath)}
              alt={collection.title}
            />
            <div className={styles.heroOverlay} />
          </div>

          <p className={styles.intro}>{collection.detailIntro}</p>
          
          <p className={styles.focus}>{collection.detailFocus}</p>

          <div className={styles.galleryGrid}>
            {collection.detailGalleryImagePaths.map((imagePath, index) => (
              <div key={imagePath} className={styles.galleryItem}>
                <img
                  className={styles.galleryImage}
                  src={getCollectionImageUrl(imagePath)}
                  alt={`${collection.title} — образ ${index + 1}`}
                />
                {index === 1 && (
                  <div className={styles.galleryIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
