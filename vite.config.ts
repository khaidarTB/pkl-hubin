import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],

    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },

    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('recharts')) return 'vendor-charts';
                        if (id.includes('lucide-react')) return 'vendor-icons';
                        if (id.includes('@inertiajs') || id.includes('react')) return 'vendor-core';
                    }
                },
            },
        },
    },

    server: {
        host: '0.0.0.0',
        port: 5173,
        cors: true,
        allowedHosts: true,

        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
