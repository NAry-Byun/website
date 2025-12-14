import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: 'C:/temp/.vite',
  server: {
    fs: {
      strict: false
    },
    hmr: {
      overlay: true
    }
  }
})
