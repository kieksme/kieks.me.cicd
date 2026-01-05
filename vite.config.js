import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: resolve(__dirname, 'app'),
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html'),
        'fundamentals/index': resolve(__dirname, 'app/fundamentals/index.html'),
        'fundamentals/logos': resolve(__dirname, 'app/fundamentals/logos.html'),
        'fundamentals/colors': resolve(__dirname, 'app/fundamentals/colors.html'),
        'fundamentals/fonts': resolve(__dirname, 'app/fundamentals/fonts.html'),
        'implementations/index': resolve(__dirname, 'app/implementations/index.html'),
        'implementations/business-cards': resolve(__dirname, 'app/implementations/business-cards.html'),
        impressum: resolve(__dirname, 'app/impressum.html'),
      },
    },
  },
  publicDir: resolve(__dirname, 'assets'),
})
