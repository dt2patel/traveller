import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src/pwa',
    filename: 'service-worker.ts',
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true,
      type: 'module'
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    manifest: false
  })]
})