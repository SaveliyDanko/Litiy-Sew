import styles from './HeroSection.module.css';

const HERO_IMAGE_URL = 'http://localhost:9000/litiy-sew-media/hero/hero.jpg';
const COLLECTION_IMAGE_URL = 'http://localhost:9000/litiy-sew-media/hero/new_collection.jpg';

export default function HeroSection() {
  return (
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
  );
}
