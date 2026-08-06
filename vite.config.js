import { defineConfig } from "vite"

export default defineConfig({
  server: {
    proxy: {
      "/api/zzz/uid": {
        target: "https://enka.network/",
        changeOrigin: true,
      },
    },
  },
})