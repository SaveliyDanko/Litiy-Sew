import styles from './PatternCard.module.css';

type Props = {
  title: string;
  imageSrc: string;
  href: string;
};

export default function PatternCard({ title, imageSrc, href }: Props) {
  return (
    <a href={href} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={imageSrc} alt={title} loading="lazy" />
      </div>
      <span className={styles.title}>{title}</span>
    </a>
  );
}
