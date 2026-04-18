import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import CollectionPlaceholderPage from './pages/CollectionPlaceholderPage';
import CollectionsPage from './pages/CollectionsPage';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import PatternCategoryPage from './pages/PatternCategoryPage';
import PatternsPage from './pages/PatternsPage';

export default function App() {
  const path = window.location.pathname;

  if (path.startsWith('/auth') || path.startsWith('/profile')) {
    return <AuthPage />;
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

  if (/^\/collections\/[^/]+/.test(path)) {
    return <CollectionPlaceholderPage />;
  }

  if (path.startsWith('/collections')) {
    return <CollectionsPage />;
  }

  if (/^\/patterns\/[^/]+/.test(path)) {
    return <PatternCategoryPage />;
  }

  if (path.startsWith('/patterns')) {
    return <PatternsPage />;
  }

  return <HomePage />;
}
