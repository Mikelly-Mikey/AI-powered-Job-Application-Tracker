import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/static/' : '/',
  
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  build: {
    outDir: '../backend/static',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@tanstack/react-query'],
        },
      },
    },
  },
  
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { 
            runtime: 'automatic',
            importSource: '@emotion/react' 
          }],
          '@emotion/babel-plugin',
        ],
      },
    }),
  ],
  
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@types', replacement: path.resolve(__dirname, 'src/types') },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
}));
