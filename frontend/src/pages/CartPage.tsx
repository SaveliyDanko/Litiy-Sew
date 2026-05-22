import { useMemo, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import styles from './CartPage.module.css';

const MEDIA_BASE_URL = '';
const RUB = new Intl.NumberFormat('ru-RU');
const BONUS_RATE = 0.1;

type PaymentMethod = 'ru-card' | 'foreign-card';

function pluralPatterns(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'выкройка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'выкройки';
  return 'выкроек';
}

export default function CartPage() {
  const { items, setQuantity, remove, removeMany } = useCart();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ru-card');
  const [email, setEmail] = useState('');
  const [bonusToSpend, setBonusToSpend] = useState('');
  const [promo, setPromo] = useState('');

  const resolvedEmail = email || user?.email || '';

  const allSelected = items.length > 0 && selected.size === items.length;

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const bonusReward = Math.floor(subtotal * BONUS_RATE);

  const toggleOne = (lineId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId); else next.add(lineId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.lineId)));
  };

  const removeSelected = () => {
    if (selected.size === 0) return;
    removeMany([...selected]);
    setSelected(new Set());
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <h1 className={styles.title}>Корзина</h1>

        {items.length === 0 ? (
          <p className={styles.empty}>Корзина пуста.</p>
        ) : (
          <div className={styles.layout}>
            <section className={styles.items}>
              <div className={styles.itemsHeader}>
                <label className={styles.selectAll}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                  <span>Выбрать все</span>
                </label>
                <button
                  type="button"
                  className={styles.removeSelected}
                  onClick={removeSelected}
                  disabled={selected.size === 0}
                >
                  Удалить выбранные
                </button>
              </div>

              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.lineId} className={styles.row}>
                    <input
                      type="checkbox"
                      className={styles.check}
                      checked={selected.has(item.lineId)}
                      onChange={() => toggleOne(item.lineId)}
                      aria-label={`Выбрать ${item.title}`}
                    />
                    <img
                      src={`${MEDIA_BASE_URL}/${item.image}`}
                      alt={item.title}
                      className={styles.thumb}
                      loading="lazy"
                    />
                    <div className={styles.info}>
                      <div className={styles.name}>{item.title}</div>
                      <div className={styles.params}>
                        Рост: {item.height} · Размер: {item.size}
                      </div>
                    </div>
                    <div className={styles.qty}>
                      <button
                        type="button"
                        aria-label="Уменьшить"
                        onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Увеличить"
                        onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.price}>{RUB.format(item.price * item.quantity)} ₽</div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label="Удалить"
                      onClick={() => remove(item.lineId)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <aside className={styles.summary}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Способ оплаты</h2>
                <div className={styles.payGroup}>
                  <div className={styles.payGroupLabel}>Россия</div>
                  <label className={styles.payOption}>
                    <input
                      type="radio"
                      name="payment"
                      value="ru-card"
                      checked={paymentMethod === 'ru-card'}
                      onChange={() => setPaymentMethod('ru-card')}
                    />
                    <span>Оплата российской картой</span>
                  </label>
                </div>
                <div className={styles.payGroup}>
                  <div className={styles.payGroupLabel}>Карта другой страны</div>
                  <label className={styles.payOption}>
                    <input
                      type="radio"
                      name="payment"
                      value="foreign-card"
                      checked={paymentMethod === 'foreign-card'}
                      onChange={() => setPaymentMethod('foreign-card')}
                    />
                    <span>Visa, MasterCard</span>
                  </label>
                </div>
                <p className={styles.cardNote}>
                  Если оплата не пройдёт — заказ сохранится. Личный кабинет создадим автоматически по e-mail. Оплату можно повторить или выбрать другой способ.
                </p>
              </section>

              <section className={styles.card}>
                <label className={styles.fieldLabel} htmlFor="cart-email">E-mail</label>
                <input
                  id="cart-email"
                  type="email"
                  className={styles.fieldInput}
                  placeholder="you@example.com"
                  value={resolvedEmail}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Бонусная программа</h2>
                <dl className={styles.bonusRow}>
                  <dt>Всего бонусов:</dt>
                  <dd>{user?.id ? 0 : 0}</dd>
                </dl>
                <dl className={styles.bonusRow}>
                  <dt>Можно списать:</dt>
                  <dd>0</dd>
                </dl>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.fieldInput}
                  placeholder="Введите сумму"
                  value={bonusToSpend}
                  onChange={(e) => setBonusToSpend(e.target.value.replace(/\D/g, ''))}
                />
              </section>

              <section className={styles.card}>
                <label className={styles.fieldLabel} htmlFor="cart-promo">Промокод</label>
                <div className={styles.promoRow}>
                  <input
                    id="cart-promo"
                    type="text"
                    className={styles.fieldInput}
                    placeholder="Введите промокод"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                  />
                  <button type="button" className={styles.promoBtn} aria-label="Применить промокод">→</button>
                </div>
              </section>

              <section className={`${styles.card} ${styles.infoCard}`}>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon} aria-hidden="true">🔗</span>
                  <p>После оплаты вы сразу получите <em>ссылку</em> на скачивание по почте.</p>
                </div>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon} aria-hidden="true">↔</span>
                  <p>Размер можно заменить — если не скачивали, <em>это бесплатно</em>.</p>
                </div>
              </section>

              <section className={styles.totalCard}>
                <dl className={styles.totalRow}>
                  <dt>{totalCount} {pluralPatterns(totalCount)}</dt>
                  <dd>{RUB.format(subtotal)} ₽</dd>
                </dl>
                <dl className={styles.totalRow}>
                  <dt>Бонусов к начислению:</dt>
                  <dd>{bonusReward}</dd>
                </dl>
              </section>

              <p className={styles.terms}>
                Нажимая кнопку «Оформить заказ», я даю свое согласие на{' '}
                <a href="#privacy" className={styles.termsLink} onClick={(e) => e.preventDefault()}>
                  обработку моих персональных данных
                </a>
              </p>

              <button
                type="button"
                className={styles.checkout}
                disabled={items.length === 0}
                onClick={() => { window.location.href = '/checkout'; }}
              >
                Оплатить заказ
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
