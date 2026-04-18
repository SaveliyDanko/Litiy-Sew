import { useMemo, useState } from 'react';
import Header from '../components/Header';
import { useCart } from '../hooks/useCart';
import styles from './CartPage.module.css';

const MEDIA_BASE_URL = 'http://localhost:9000/litiy-sew-media';
const RUB = new Intl.NumberFormat('ru-RU');
const SHIPPING_COST = 500;

export default function CartPage() {
  const { items, setQuantity, remove, removeMany } = useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(i.lineId)),
    [items, selected],
  );

  const allSelected = items.length > 0 && selected.size === items.length;

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const total = subtotal + (items.length > 0 ? SHIPPING_COST : 0);

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
              <h2 className={styles.summaryTitle}>Сумма заказа</h2>
              <dl className={styles.summaryRow}>
                <dt>Товары ({items.length})</dt>
                <dd>{RUB.format(subtotal)} ₽</dd>
              </dl>
              <dl className={styles.summaryRow}>
                <dt>Доставка</dt>
                <dd>{RUB.format(SHIPPING_COST)} ₽</dd>
              </dl>
              <div className={styles.divider} />
              <dl className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <dt>Итого</dt>
                <dd>{RUB.format(total)} ₽</dd>
              </dl>
              <button
                type="button"
                className={styles.checkout}
                disabled={selectedItems.length === 0 && items.length === 0}
              >
                Оформить заказ
              </button>
              <p className={styles.note}>Нажимая «Оформить заказ», вы принимаете условия обработки данных.</p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
