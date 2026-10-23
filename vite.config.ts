import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Host discovery for mobile devices and Tauri v2 development
const host = process.env.TAURI_DEV_HOST || '0.0.0.0';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Prevent Vite from obscuring Rust/Tauri errors in the terminal
    clearScreen: false,
    server: {
      // Fixed port 3000 required by Tauri, Capacitor live-reload, and AI Studio
      port: 3000,
      // Strict port: fail if 3000 is occupied instead of silently picking next port
      strictPort: true,
      // Listen on all addresses for Android emulator (10.0.2.2) and local Wi-Fi devices
      host: host,
      // AI Studio HMR configuration (preserved for agent environment stability)
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Output directory standard for web, Capacitor (`webDir: "dist"`), and Tauri
      outDir: 'dist',
      emptyOutDir: true,
      // Target modern WebViews:
      // - Tauri v2 Windows: Edge WebView2 (Chromium 105+)
      // - Capacitor Android: Android System WebView (Chromium 100+ / ES2021)
      target: process.env.TAURI_ENV_PLATFORM === 'windows' 
        ? 'chrome105' 
        : ['es2021', 'chrome100', 'safari13'],
      // Avoid aggressive minification that can break older Android WebViews or mangle audio workers
      minify: !process.env.TAURI_ENV_DEBUG ? ('esbuild' as const) : false,
      // Produce sourcemaps in debug mode for seamless remote debugging
      sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
      chunkSizeWarningLimit: 1500,
    },
  };
});
