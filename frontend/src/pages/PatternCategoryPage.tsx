import Footer from '../components/Footer';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, MEDIA_BASE_URL, PRODUCTS_BY_CATEGORY } from './patternsData';
import styles from './PatternCategoryPage.module.css';

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

        <Footer />
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

      <Footer />
    </>
  );
}
