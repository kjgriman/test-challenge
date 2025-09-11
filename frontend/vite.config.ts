import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@services": resolve(__dirname, "./src/services"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@types": resolve(__dirname, "./src/types"),
      "@assets": resolve(__dirname, "./src/assets"),
      "@games": resolve(__dirname, "./src/games"),
      "@store": resolve(__dirname, "./src/store"),
    },
  },
  server: {
    port: 5173,
    host: true,
    https: {
      key: '../certs/key.pem',
      cert: '../certs/cert.pem',
    },
    // Usar HTTPS para desarrollo local (requerido para WebRTC)
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "https://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: process.env.VITE_API_URL || "https://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Deshabilitar sourcemaps en producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          phaser: ["phaser"],
          socket: ["socket.io-client"],
          ui: ["framer-motion", "lucide-react"],
          charts: ["recharts"],
          utils: ["date-fns", "clsx", "tailwind-merge"],
        },
      },
    },
    chunkSizeWarningLimit: 2000, // Aumentar límite para Phaser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "phaser",
      "socket.io-client",
      "axios",
      "react-hook-form",
      "react-query",
      "zustand",
      "framer-motion",
      "react-hot-toast",
      "lucide-react",
      "clsx",
      "tailwind-merge",
      "date-fns",
      "recharts",
      "react-webcam",
      "simple-peer",
    ],
  },
  define: {
    global: "globalThis",
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});


