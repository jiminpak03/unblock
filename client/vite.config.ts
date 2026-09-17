import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  // sockjs-client (used by useBoardSocket) references the Node.js `global`
  // global, which isn't defined in the browser.
  define: {
    global: 'globalThis',
  },
})
