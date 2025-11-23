import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/trip-blocks-deploy/",
  server: {
    port: 5174,       // ← 여기서 원하는 포트 번호로 변경
  }
})
