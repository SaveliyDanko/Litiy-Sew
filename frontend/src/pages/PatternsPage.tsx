import Header from '../components/Header';
import PatternCard from '../components/PatternCard';
import styles from './PatternsPage.module.css';

const MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';
const COLLECTION_IMAGE_URL = `${MEDIA_BASE_URL}/patterns/collection.png`;

type PatternCategory = {
  slug: string;
  title: string;
  image: string;
};

const CATEGORIES: PatternCategory[] = [
  { slug: 'all', title: 'Все выкройки', image: 'patterns/all.jpg' },
  { slug: 'beginner', title: 'Для начинающих', image: 'patterns/beginner.jpg' },
  { slug: 'skirts', title: 'Юбки', image: 'patterns/skirts.jpg' },
  { slug: 'dresses', title: 'Платья и сарафаны', image: 'patterns/dresses.jpg' },
  { slug: 'tops', title: 'Топы и блузы', image: 'patterns/tops.jpg' },
  { slug: 'trousers', title: 'Брюки и шорты', image: 'patterns/trousers.jpg' },
  { slug: 'outerwear', title: 'Верхняя одежда', image: 'patterns/outerwear.jpg' },
  { slug: 'accessories', title: 'Аксессуары', image: 'patterns/accessories.jpg' },
];

export default function PatternsPage() {
  return (
    <>
      <Header />
      <section className={styles.collection}>
        <img
          className={styles.collectionImage}
          src={COLLECTION_IMAGE_URL}
          alt="Коллекция выкроек"
        />
      </section>
      <main className={styles.page}>
        <div className={styles.grid}>
          {CATEGORIES.map((category) => (
            <PatternCard
              key={category.slug}
              title={category.title}
              imageSrc={`${MEDIA_BASE_URL}/${category.image}`}
              href={`/patterns/${category.slug}`}
            />
          ))}
        </div>
      </main>
    </>
  );
}
