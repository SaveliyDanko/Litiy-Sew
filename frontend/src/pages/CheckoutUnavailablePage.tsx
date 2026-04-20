import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './CheckoutUnavailablePage.module.css';

export default function CheckoutUnavailablePage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Оплата пока недоступна</h1>
          <p className={styles.text}>
            Мы ещё не подключили приём платежей. Скоро функция появится — следите за обновлениями.
          </p>
          <div className={styles.actions}>
            <a href="/cart" className={styles.backLink}>← Вернуться в корзину</a>
            <a href="/patterns" className={styles.primaryLink}>К выкройкам</a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
