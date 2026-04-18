import styles from './ProductCard.module.css';

type Props = {
  title: string;
  price: number;
  imageSrc: string;
  href: string;
};

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU');

export default function ProductCard({ title, price, imageSrc, href }: Props) {
  return (
    <article className={styles.card}>
      <a href={href} className={styles.imageLink}>
        <img className={styles.image} src={imageSrc} alt={title} loading="lazy" />
        <button type="button" className={styles.favorite} aria-label="В избранное" onClick={(e) => e.preventDefault()}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </a>
      <div className={styles.info}>
        <a href={href} className={styles.title}>{title}</a>
        <div className={styles.price}>{RUB_FORMATTER.format(price)} ₽</div>
      </div>
      <button type="button" className={styles.cartBtn}>В КОРЗИНУ</button>
    </article>
  );
}
