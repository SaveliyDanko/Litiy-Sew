import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/Litiy-Sew/",
  assetsInclude: ['**/*.woff2', '**/*.jpg', '**/*.png', '**/*.svg'],
})
