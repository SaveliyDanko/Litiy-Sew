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
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
