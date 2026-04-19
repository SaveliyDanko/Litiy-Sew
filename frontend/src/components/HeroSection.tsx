import {
  FEATURED_COLLECTION,
  getCollectionHref,
  getCollectionImageUrl,
} from '../pages/collectionsData';
import { MEDIA_BASE_URL, PRODUCTS_BY_CATEGORY } from '../pages/patternsData';
import ProductCard from './ProductCard';
import styles from './HeroSection.module.css';

const HERO_IMAGE_URL = 'http://localhost:9000/litiy-sew-media/hero/hero.jpg';
const COLLECTION_IMAGE_URL = 'http://localhost:9000/litiy-sew-media/hero/new_collection.jpg';

const NEW_ARRIVALS = PRODUCTS_BY_CATEGORY.all.slice(0, 4);

export default function HeroSection() {
  return (
    <>
      <section className={styles.hero}>
        <img
          className={styles.bg}
          src={HERO_IMAGE_URL}
          alt="Litiy Sew hero"
        />
        <div className={styles.overlay} />

        <div className={styles.content}>
          <h1 className={styles.title}>
            Litiy Sew
          </h1>

          <div className={styles.card}>
            <img
              className={styles.cardImage}
              src={COLLECTION_IMAGE_URL}
              alt="Новая коллекция"
            />
            <a
              href="/collections"
              className={styles.btn}
            >
              НОВАЯ КОЛЛЕКЦИЯ
            </a>
          </div>
        </div>
      </section>

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

      <section className={styles.tagline}>
        <p className={styles.taglineText}>
          Выкройки LitiySew легко распечатать, а наши инструкции подробно описывают каждый шаг с дополнительными фотографиями.
        </p>
        <p className={styles.taglineText}>
          Поэтому шить наши изделия можно даже без предварительного опыта пошива.
        </p>
      </section>

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
