import Header from '../components/Header';
import styles from './CollectionsPage.module.css';

type CollectionCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tone: 'warm' | 'cool' | 'neutral';
};

const SOLO_COLLECTIONS: CollectionCard[] = [
  {
    id: 'queen-of-hearts',
    title: 'Queen of Hearts',
    subtitle: 'Театральный силуэт',
    description: 'Объёмная форма, декоративность и игра с образом как самостоятельным высказыванием.',
    tone: 'warm',
  },
  {
    id: 'blue-reverie',
    title: 'Blue Reverie',
    subtitle: 'Воздух и пластика',
    description: 'Лёгкая фактура, мягкий вертикальный ритм и деликатный акцент на линии плеч и шеи.',
    tone: 'cool',
  },
  {
    id: 'ivory-hush',
    title: 'Ivory Hush',
    subtitle: 'Тихая чувственность',
    description: 'Минималистичная композиция, в которой ткань, посадка и поза работают как единый образ.',
    tone: 'neutral',
  },
];

export default function CollectionsPage() {
  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.featured}>
          <div className={styles.featuredMedia} aria-hidden="true">
            <div className={styles.featuredGlow} />
          </div>

          <div className={styles.featuredCopy}>
            <p className={styles.featuredEyebrow}>Featured collection</p>
            <h1 className={styles.featuredTitle}>The glow of love</h1>
            <p className={styles.featuredSubtitle}>История о самом нежном дне</p>
            <p className={styles.featuredDescription}>
              Капсула о деликатности, свете и ощущении близости, где формы остаются мягкими,
              а настроение собирается из деталей, фактуры и воздуха между линиями.
            </p>
          </div>
        </section>

        <section className={styles.solo}>
          <div className={styles.soloHeading}>
            <p className={styles.soloEyebrow}>Подборка образов</p>
            <h2 className={styles.soloTitle}>Одиночные модели:</h2>
          </div>

          <div className={styles.soloGrid}>
            {SOLO_COLLECTIONS.map((collection, index) => (
              <article
                key={collection.id}
                className={styles.card}
                data-tone={collection.tone}
              >
                <div className={styles.cardMedia} aria-hidden="true">
                  <div className={styles.cardBadge}>Look {String(index + 1).padStart(2, '0')}</div>
                  <div className={styles.cardAura} />
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardSubtitle}>{collection.subtitle}</p>
                  <h3 className={styles.cardTitle}>{collection.title}</h3>
                  <p className={styles.cardDescription}>{collection.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
