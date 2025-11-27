import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Use different base paths for different environments
    // For local dev (command === 'serve'), use root path
    // For production build (command === 'build'), use /GenFree/ unless on Netlify
    base: command === 'serve' || process.env.NETLIFY ? '/' : '/GenFree/',
  }
})
