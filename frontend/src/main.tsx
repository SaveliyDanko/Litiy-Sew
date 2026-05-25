import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { fetchBootstrap } from './services/bootstrap'

// Kick off the one-shot public-content fetch BEFORE React mounts.
// By the time HeroSection / AboutPage run their useEffects, this request is
// either already done (cache populated, no extra fetches needed) or in flight
// (their cachedFetch calls dedupe onto the same promise).
// Skip on admin/auth routes — those don't render public content.
const path = window.location.pathname;
if (!path.startsWith('/admin') && !path.startsWith('/auth')) {
  fetchBootstrap();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
