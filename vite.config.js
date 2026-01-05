import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'app',
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        'fundamentals/index': './fundamentals/index.html',
        'fundamentals/logos': './fundamentals/logos.html',
        'fundamentals/colors': './fundamentals/colors.html',
        'fundamentals/fonts': './fundamentals/fonts.html',
        'implementations/index': './implementations/index.html',
        'implementations/business-cards': './implementations/business-cards.html',
        impressum: './impressum.html',
      },
    },
  },
  publicDir: '../assets',
})
