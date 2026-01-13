import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，确保在非根目录或特定静态托管环境中也能正确加载资源
  define: {
    // 安全地将 API Key 注入到客户端代码中
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // 为其他 process.env 访问提供兜底，防止运行时崩溃
    'process.env': {}
  }
})