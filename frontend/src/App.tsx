import Toaster from './components/Toaster';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import OfferPage from './pages/OfferPage';
import TermsPage from './pages/TermsPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import CheckoutUnavailablePage from './pages/CheckoutUnavailablePage';
import CollectionPlaceholderPage from './pages/CollectionPlaceholderPage';
import CollectionsPage from './pages/CollectionsPage';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import PatternCategoryPage from './pages/PatternCategoryPage';
import PatternDetailPage from './pages/PatternDetailPage';
import PatternsPage from './pages/PatternsPage';

function renderPage() {
  const path = window.location.pathname;

  if (path.startsWith('/auth') || path.startsWith('/profile')) {
    return <AuthPage />;
  }

  if (path.startsWith('/checkout')) {
    return <CheckoutUnavailablePage />;
  }

  if (path.startsWith('/cart')) {
    return <CartPage />;
  }

  if (path.startsWith('/favorites')) {
    return <FavoritesPage />;
  }

  if (path.startsWith('/about')) {
    return <AboutPage />;
  }

  if (path === '/legal/privacy') {
    return <PrivacyPage />;
  }

  if (path === '/legal/terms') {
    return <TermsPage />;
  }

  if (path === '/legal/offer') {
    return <OfferPage />;
  }

  if (/^\/collections\/[^/]+/.test(path)) {
    return <CollectionPlaceholderPage />;
  }

  if (path.startsWith('/collections')) {
    return <CollectionsPage />;
  }

  if (/^\/patterns\/[^/]+\/[^/]+/.test(path)) {
    return <PatternDetailPage />;
  }

  if (/^\/patterns\/[^/]+/.test(path)) {
    return <PatternCategoryPage />;
  }

  if (path.startsWith('/patterns')) {
    return <PatternsPage />;
  }

  return <HomePage />;
}

export default function App() {
  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}
