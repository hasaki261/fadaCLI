import { defineConfig } from "vite"

export default defineConfig({
  server: {
    proxy: {
      "/api/zzz/uid": {
        target: "https://enka.network/",
        changeOrigin: true,
      },
      "/ascii/api/convert": {
        target: "https://yourascii.vercel.app/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ascii/, '')
      }
    },
  },
})