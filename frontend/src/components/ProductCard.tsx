import { useState, type MouseEvent } from 'react';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import type { Product } from '../types/product';
import PatternParamsModal from './PatternParamsModal';
import styles from './ProductCard.module.css';

type Props = {
  product: Product;
  imageSrc: string;
  href: string;
  variant?: 'default' | 'favorites';
};

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU');

export default function ProductCard({ product, imageSrc, href, variant = 'default' }: Props) {
  const { isFavorite, toggle, remove } = useFavorites();
  const { add } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const favorite = isFavorite(product.id);

  const handleFavoriteClick = (e: MouseEvent) => {
    e.preventDefault();
    if (variant === 'favorites') {
      remove(product.id);
    } else {
      toggle(product);
    }
  };

  const handleCartClick = () => setModalOpen(true);

  const handleConfirm = (params: { height: string; size: string }) => {
    add(product, params);
    setModalOpen(false);
  };

  return (
    <article className={styles.card}>
      <a href={href} className={styles.imageLink}>
        <img className={styles.image} src={imageSrc} alt={product.title} loading="lazy" />
        <button
          type="button"
          className={`${styles.favorite} ${favorite ? styles.favoriteActive : ''}`}
          aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}
          aria-pressed={favorite}
          onClick={handleFavoriteClick}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </a>
      <div className={styles.info}>
        <a href={href} className={styles.title}>{product.title}</a>
        <div className={styles.price}>{RUB_FORMATTER.format(product.price)} ₽</div>
      </div>
      <button type="button" className={styles.cartBtn} onClick={handleCartClick}>В КОРЗИНУ</button>

      {modalOpen && (
        <PatternParamsModal
          title={product.title}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </article>
  );
}
