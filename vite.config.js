import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use different base paths for different environments
  base: process.env.NETLIFY ? '/' : '/GenFree/',
})
