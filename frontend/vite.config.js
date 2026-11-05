import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const verificationTag = env.VITE_GOOGLE_SITE_VERIFICATION
    ? `<meta name="google-site-verification" content="${env.VITE_GOOGLE_SITE_VERIFICATION.replace(/[&"<>]/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char])}" />`
    : '';
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'google-search-console-verification',
        transformIndexHtml(html) {
          return html.replace('<!-- GOOGLE_SEARCH_CONSOLE_VERIFICATION -->', verificationTag);
        },
      },
    ],
  };
})
