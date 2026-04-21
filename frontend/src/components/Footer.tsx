import { SHOP_ENABLED } from '../utils/featureFlags';
import styles from './Footer.module.css';

const helpLinks = [
  { href: '/about#how-to-buy', label: 'Как купить' },
  { href: '/about#exchange', label: 'Обмен и возврат' },
  { href: '/about#bonus', label: 'Бонусная программа' },
  { href: '/about#reviews', label: 'Публикация отзывов' },
];

const patternsLinks = [
  { href: '/patterns/women', label: 'Женские выкройки' },
  { href: '/patterns/men', label: 'Мужские выкройки' },
  { href: '/patterns/kids', label: 'Детские выкройки' },
];

const contactLinks = [
  { href: 'https://t.me', label: 'Telegram', external: true },
  { href: 'mailto:patterns@litiysew.com', label: 'patterns@litiysew.com' },
  { href: 'https://vk.com', label: 'VK', external: true },
  { href: 'https://boosty.to', label: 'Мы на Boosty', external: true },
];

const legalLinks = [
  { href: '/legal/privacy', label: 'Политика конфиденциальности' },
  { href: '/legal/terms', label: 'Пользовательское соглашение' },
  { href: '/legal/offer', label: 'Публичная оферта' },
];

export default function Footer() {
  if (!SHOP_ENABLED) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <a href="/" className={styles.brand} aria-label="На главную">
            <svg
              className={styles.brandMark}
              width="28"
              height="32"
              viewBox="0 0 28 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4 L10 2 L10 30 L4 28 Z" />
              <path d="M24 4 L18 2 L18 30 L24 28 Z" />
              <path d="M10 10 L18 10" />
              <path d="M10 22 L18 22" />
            </svg>
            <span className={styles.brandName}>Litiy Sew</span>
          </a>

          <nav className={styles.column} aria-labelledby="footer-help">
            <h2 id="footer-help" className={styles.columnTitle}>Помощь</h2>
            <ul className={styles.list}>
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.link}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-patterns">
            <h2 id="footer-patterns" className={styles.columnTitle}>Выкройки</h2>
            <ul className={styles.list}>
              {patternsLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.link}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-contacts">
            <h2 id="footer-contacts" className={styles.columnTitle}>Контакты</h2>
            <ul className={styles.list}>
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.link}
                    {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <ul className={styles.legal}>
            {legalLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.legalLink}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
