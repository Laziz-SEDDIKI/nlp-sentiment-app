import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Toutes les requêtes qui commencent par /api sont redirigées
      '/api': {
        // Vers notre serveur Flask local
        target: 'http://127.0.0.1:5000',
        // Nécessaire pour que le proxy fonctionne correctement
        changeOrigin: true,
        // On retire le préfixe /api avant d'envoyer la requête
        // /api/predict -> /predict
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
