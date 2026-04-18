import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';
import styles from './PatternCategoryPage.module.css';

const MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';

type CategoryMeta = {
  slug: string;
  title: string;
};

const CATEGORIES: Record<string, CategoryMeta> = {
  all: { slug: 'all', title: 'Все выкройки' },
  beginner: { slug: 'beginner', title: 'Для начинающих' },
  skirts: { slug: 'skirts', title: 'Юбки' },
  dresses: { slug: 'dresses', title: 'Платья и сарафаны' },
  tops: { slug: 'tops', title: 'Топы и блузы' },
  trousers: { slug: 'trousers', title: 'Брюки и шорты' },
  outerwear: { slug: 'outerwear', title: 'Верхняя одежда' },
  accessories: { slug: 'accessories', title: 'Аксессуары' },
};

const PRODUCTS_BY_CATEGORY: Record<string, Product[]> = {
  beginner: [
    { id: 'asana-shirt', title: 'Рубашка Asana', price: 550, image: 'products/beginner/shirt-1.jpg' },
    { id: 'akemi-shorts', title: 'Шорты Akemi', price: 510, image: 'products/beginner/shorts-1.jpg' },
    { id: 'letta-dress', title: 'Платье Letta', price: 610, image: 'products/beginner/dress-1.jpg' },
    { id: 'aneta-top', title: 'Топ Aneta', price: 470, image: 'products/beginner/top-1.jpg' },
    { id: 'steffi-jacket', title: 'Жакет Steffi', price: 720, image: 'products/beginner/jacket-1.jpg' },
    { id: 'moko-shorts', title: 'Шорты Moko', price: 510, image: 'products/beginner/shorts-2.jpg' },
    { id: 'elin-top', title: 'Топ Элин', price: 490, image: 'products/beginner/top-2.jpg' },
    { id: 'arden-skirt', title: 'Брюки Arden', price: 640, image: 'products/beginner/skirt-2.jpg' },
  ],
  skirts: [
    { id: 'mira-skirt', title: 'Юбка Mira', price: 520, image: 'products/skirts/skirt-1.jpg' },
    { id: 'nora-skirt', title: 'Юбка Nora', price: 540, image: 'products/skirts/skirt-2.jpg' },
    { id: 'luna-skirt', title: 'Юбка Luna', price: 560, image: 'products/skirts/skirt-3.jpg' },
    { id: 'sofi-skirt', title: 'Юбка Sofi', price: 580, image: 'products/skirts/skirt-4.jpg' },
    { id: 'elsa-skirt', title: 'Юбка Elsa', price: 590, image: 'products/skirts/skirt-5.jpg' },
    { id: 'vera-skirt', title: 'Юбка Vera', price: 610, image: 'products/skirts/skirt-6.jpg' },
    { id: 'kira-skirt', title: 'Юбка Kira', price: 620, image: 'products/skirts/skirt-7.jpg' },
    { id: 'alba-skirt', title: 'Юбка Alba', price: 640, image: 'products/skirts/skirt-8.jpg' },
  ],
  dresses: [
    { id: 'anna-dress', title: 'Платье Anna', price: 780, image: 'products/dresses/dress-1.jpg' },
    { id: 'ella-dress', title: 'Платье Ella', price: 820, image: 'products/dresses/dress-2.jpg' },
    { id: 'maya-dress', title: 'Платье Maya', price: 860, image: 'products/dresses/dress-3.jpg' },
    { id: 'inga-sundress', title: 'Сарафан Inga', price: 690, image: 'products/dresses/dress-4.jpg' },
    { id: 'dara-dress', title: 'Платье Dara', price: 900, image: 'products/dresses/dress-5.jpg' },
    { id: 'lia-sundress', title: 'Сарафан Lia', price: 720, image: 'products/dresses/dress-6.jpg' },
    { id: 'nika-dress', title: 'Платье Nika', price: 840, image: 'products/dresses/dress-7.jpg' },
    { id: 'zara-sundress', title: 'Сарафан Zara', price: 740, image: 'products/dresses/dress-8.jpg' },
  ],
  tops: [
    { id: 'mila-top', title: 'Топ Mila', price: 470, image: 'products/tops/top-1.jpg' },
    { id: 'rena-blouse', title: 'Блуза Rena', price: 560, image: 'products/tops/top-2.jpg' },
    { id: 'olia-top', title: 'Топ Olia', price: 450, image: 'products/tops/top-3.jpg' },
    { id: 'sana-blouse', title: 'Блуза Sana', price: 590, image: 'products/tops/top-4.jpg' },
    { id: 'tara-top', title: 'Топ Tara', price: 480, image: 'products/tops/top-5.jpg' },
    { id: 'vita-blouse', title: 'Блуза Vita', price: 610, image: 'products/tops/top-6.jpg' },
    { id: 'yana-top', title: 'Топ Yana', price: 490, image: 'products/tops/top-7.jpg' },
    { id: 'nela-blouse', title: 'Блуза Nela', price: 620, image: 'products/tops/top-8.jpg' },
  ],
  trousers: [
    { id: 'rio-trousers', title: 'Брюки Rio', price: 720, image: 'products/trousers/trousers-1.jpg' },
    { id: 'oslo-shorts', title: 'Шорты Oslo', price: 510, image: 'products/trousers/trousers-2.jpg' },
    { id: 'milan-trousers', title: 'Брюки Milan', price: 760, image: 'products/trousers/trousers-3.jpg' },
    { id: 'kyoto-shorts', title: 'Шорты Kyoto', price: 520, image: 'products/trousers/trousers-4.jpg' },
    { id: 'tokyo-trousers', title: 'Брюки Tokyo', price: 780, image: 'products/trousers/trousers-5.jpg' },
    { id: 'berlin-shorts', title: 'Шорты Berlin', price: 530, image: 'products/trousers/trousers-6.jpg' },
    { id: 'paris-trousers', title: 'Брюки Paris', price: 800, image: 'products/trousers/trousers-7.jpg' },
    { id: 'lima-shorts', title: 'Шорты Lima', price: 540, image: 'products/trousers/trousers-8.jpg' },
  ],
  outerwear: [
    { id: 'nord-coat', title: 'Пальто Nord', price: 1240, image: 'products/outerwear/coat-1.jpg' },
    { id: 'arno-jacket', title: 'Жакет Arno', price: 860, image: 'products/outerwear/coat-2.jpg' },
    { id: 'volga-coat', title: 'Пальто Volga', price: 1280, image: 'products/outerwear/coat-3.jpg' },
    { id: 'tess-trench', title: 'Тренч Tess', price: 1120, image: 'products/outerwear/coat-4.jpg' },
    { id: 'lago-jacket', title: 'Жакет Lago', price: 880, image: 'products/outerwear/coat-5.jpg' },
    { id: 'fiord-coat', title: 'Пальто Fiord', price: 1320, image: 'products/outerwear/coat-6.jpg' },
    { id: 'rhea-trench', title: 'Тренч Rhea', price: 1140, image: 'products/outerwear/coat-7.jpg' },
    { id: 'onyx-jacket', title: 'Жакет Onyx', price: 920, image: 'products/outerwear/coat-8.jpg' },
  ],
  accessories: [
    { id: 'linen-bag', title: 'Сумка Linen', price: 380, image: 'products/accessories/linen-bag.jpg' },
    { id: 'oslo-scarf', title: 'Шарф Oslo', price: 260, image: 'products/accessories/oslo-scarf.jpg' },
    { id: 'ella-hat', title: 'Панама Ella', price: 290, image: 'products/accessories/ella-hat.jpg' },
    { id: 'dune-bag', title: 'Сумка Dune', price: 420, image: 'products/accessories/dune-bag.jpg' },
    { id: 'kira-kerchief', title: 'Косынка Kira', price: 220, image: 'products/accessories/kira-kerchief.jpg' },
    { id: 'mila-belt', title: 'Пояс Mila', price: 310, image: 'products/accessories/mila-belt.jpg' },
    { id: 'nord-cap', title: 'Кепи Nord', price: 280, image: 'products/accessories/nord-cap.jpg' },
    { id: 'vera-pouch', title: 'Косметичка Vera', price: 260, image: 'products/accessories/vera-pouch.jpg' },
  ],
};

PRODUCTS_BY_CATEGORY.all = [
  ...PRODUCTS_BY_CATEGORY.beginner,
  ...PRODUCTS_BY_CATEGORY.skirts,
  ...PRODUCTS_BY_CATEGORY.dresses,
  ...PRODUCTS_BY_CATEGORY.tops,
  ...PRODUCTS_BY_CATEGORY.trousers,
  ...PRODUCTS_BY_CATEGORY.outerwear,
  ...PRODUCTS_BY_CATEGORY.accessories,
];

function getCategorySlug(): string | null {
  const match = window.location.pathname.match(/^\/patterns\/([^/]+)/);
  return match?.[1] ?? null;
}

export default function PatternCategoryPage() {
  const slug = getCategorySlug();
  const category = slug ? CATEGORIES[slug] : null;

  if (!category) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <h1 className={styles.title}>Категория не найдена</h1>
          <a className={styles.backLink} href="/patterns">← К списку категорий</a>
        </main>
      </>
    );
  }

  const products = PRODUCTS_BY_CATEGORY[category.slug] ?? [];

  return (
    <>
      <Header />
      <main className={styles.page}>
        <nav className={styles.breadcrumbs}>
          <a href="/patterns">Все выкройки</a>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{category.title}</span>
        </nav>

        <h1 className={styles.title}>{category.title}</h1>

        {products.length === 0 ? (
          <p className={styles.empty}>Пока нет выкроек в этой категории.</p>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageSrc={`${MEDIA_BASE_URL}/${product.image}`}
                href={`/patterns/${category.slug}/${product.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
