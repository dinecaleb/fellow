/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webcrypto } from 'node:crypto'

// Polyfill crypto for Node.js
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = webcrypto as Crypto;
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // Listen on all network interfaces for live reload
        port: 5173,
        strictPort: true,
    },
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
    // @ts-expect-error - vitest types extend vite config
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setup.ts',
    },
})
