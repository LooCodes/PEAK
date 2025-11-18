import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwind(), react()],
  // (Optional) Dev proxy to FastAPI on :8000
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})