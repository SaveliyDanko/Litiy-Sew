import Footer from '../components/Footer';
import Header from '../components/Header';
import {
  FEATURED_COLLECTION,
  SOLO_COLLECTIONS,
  getCollectionHref,
  getCollectionImageUrl,
} from './collectionsData';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
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
            <img
              className={styles.featuredImage}
              src={getCollectionImageUrl(FEATURED_COLLECTION.imagePath)}
              alt={FEATURED_COLLECTION.title}
            />
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
            {SOLO_COLLECTIONS.map((collection, index) => (
              <a
                key={collection.slug}
                href={getCollectionHref(collection.slug)}
                className={styles.cardLink}
                aria-label={`Открыть коллекцию ${collection.title}`}
              >
                <article
                  className={styles.card}
                  data-tone={collection.tone}
                >
                  <div className={styles.cardMedia}>
                    <div className={styles.cardBadge}>Look {String(index + 1).padStart(2, '0')}</div>
                    <img
                      className={styles.cardImage}
                      src={getCollectionImageUrl(collection.imagePath)}
                      alt={collection.title}
                    />
                    <div className={styles.cardOverlay} />
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.cardSubtitle}>{collection.subtitle}</p>
                    <h3 className={styles.cardTitle}>{collection.title}</h3>
                    <p className={styles.cardDescription}>{collection.description}</p>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
