import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'whiteboard/assets',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'whiteboard/app/main.tsx',
      output: {
        entryFileNames: 'whiteboard-app.js',
        chunkFileNames: 'whiteboard-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith('.css'))) return 'whiteboard-app.css'
          return 'whiteboard-[name][extname]'
        },
      },
    },
  },
})
