import Footer from '../components/Footer';
import Header from '../components/Header';

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main style={{ padding: '120px 24px', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Страница не найдена.</p>
        <a href="/" style={{ textDecoration: 'underline' }}>Вернуться на главную</a>
      </main>
      <Footer />
    </>
  );
}
