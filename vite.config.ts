import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,        // Permite conexiones externas
    port: 4200,        // Puerto fijo
    strictPort: true   // No cambiar el puerto automáticamente
  }
})