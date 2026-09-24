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

    server: {
        host: '0.0.0.0',
        port: 5173,
        // cors: true,
        strictPort: true,
        hmr: {
            host: '434d6tr3-5173.asse.devtunnels.ms',
            protocol: 'wss',
            clientPort: 443
        },

        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});