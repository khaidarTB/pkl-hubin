import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'PKLConnect';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')) as any,
    setup({ el, App, props }) {
        if (el) {
            const root = createRoot(el);
            root.render(
                <>
                    <App {...props} />
                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        duration={3000}
                        toastOptions={{
                            style: {
                                fontSize: '13px',
                                borderRadius: '12px',
                                padding: '12px 16px',
                            },
                        }}
                    />
                </>
            );
        }
    },
    progress: {
        color: '#4F46E5',
        showSpinner: false,
    },
});
