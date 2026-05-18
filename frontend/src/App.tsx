import Toaster from './components/Toaster';
import AdminPage from './pages/AdminPage';
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
import NotFoundPage from './pages/NotFoundPage';
import PatternCategoryPage from './pages/PatternCategoryPage';
import PatternDetailPage from './pages/PatternDetailPage';
import PatternsPage from './pages/PatternsPage';
import { SHOP_ENABLED } from './utils/featureFlags';

function renderPage() {
  const path = window.location.pathname;

  if (path.startsWith('/admin')) {
    return <AdminPage />;
  }

  if (path.startsWith('/auth') || path.startsWith('/profile')) {
    return <AuthPage />;
  }

  if (SHOP_ENABLED) {

    if (path.startsWith('/checkout')) {
      return <CheckoutUnavailablePage />;
    }

    if (path.startsWith('/cart')) {
      return <CartPage />;
    }

    if (path.startsWith('/favorites')) {
      return <FavoritesPage />;
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
  } else if (
    path.startsWith('/checkout') ||
    path.startsWith('/cart') ||
    path.startsWith('/favorites') ||
    path.startsWith('/patterns')
  ) {
    return <NotFoundPage />;
  }

  if (/^\/collections\/[^/]+/.test(path)) {
    return <CollectionPlaceholderPage />;
  }

  if (path.startsWith('/collections')) {
    return <CollectionsPage />;
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

  if (path === '/' || path === '') {
    return <HomePage />;
  }

  return <NotFoundPage />;
}

export default function App() {
  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}
