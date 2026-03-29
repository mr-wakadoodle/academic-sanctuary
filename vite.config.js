import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/academic-sanctuary/',  // Change this to match your GitHub repo name
})
