import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // sockjs-client (used for the notification WebSocket) expects Node's
  // `global` object, which doesn't exist in the browser. Vite doesn't
  // polyfill this automatically the way older bundlers did, so map it
  // to `globalThis` ourselves.
  define: {
    global: 'globalThis',
  },
})
