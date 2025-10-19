import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/site-preciosa-2/', // 👈 nome do seu repositório no GitHub
})
