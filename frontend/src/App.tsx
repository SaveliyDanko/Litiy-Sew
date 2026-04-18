import HomePage from './pages/HomePage';
import PatternCategoryPage from './pages/PatternCategoryPage';
import PatternsPage from './pages/PatternsPage';

export default function App() {
  const path = window.location.pathname;

  if (/^\/patterns\/[^/]+/.test(path)) {
    return <PatternCategoryPage />;
  }

  if (path.startsWith('/patterns')) {
    return <PatternsPage />;
  }

  return <HomePage />;
}
