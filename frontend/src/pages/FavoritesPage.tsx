import Footer from '../components/Footer';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useFavorites } from '../hooks/useFavorites';
import styles from './FavoritesPage.module.css';

const MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';

export default function FavoritesPage() {
  const { items } = useFavorites();

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>Избранное <span className={styles.count}>({items.length})</span></h1>
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>В избранном пока ничего нет.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageSrc={`${MEDIA_BASE_URL}/${product.image}`}
                href={`/patterns/${product.id}`}
                variant="favorites"
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
