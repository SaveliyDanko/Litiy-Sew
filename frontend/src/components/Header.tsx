import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <a
        href="/"
        className={styles.logo}
      >
        Litiy
      </a>

      <nav className={styles.nav}>
        <a href="/about">ОБО МНЕ</a>
        <a href="/patterns">ВЫКРОЙКИ</a>
        <a href="/collections">КОЛЛЕКЦИИ</a>
      </nav>

      <div className={styles.actions}>
        <a href="/favorites" aria-label="Избранное" className={styles.iconLink}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </a>
        <button aria-label="Корзина">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
        <button aria-label="Профиль">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
