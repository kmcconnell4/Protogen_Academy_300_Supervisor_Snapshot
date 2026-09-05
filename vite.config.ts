import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/data/philly-neighborhoods.json')) return 'map-data'
          if (id.includes('/node_modules/vuetify/')) return 'vuetify'
          if (
            id.includes('/node_modules/chart.js/') ||
            id.includes('/node_modules/vue-chartjs/') ||
            id.includes('/node_modules/d3-geo/')
          ) return 'charts'
          if (id.includes('/node_modules/vue/')) return 'vendor'
        },
      },
    },
  },
})
