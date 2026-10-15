import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

export default function InstallPwa() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (isStandalone()) return;

        const onBeforeInstall = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
            setVisible(true);
        };

        const onInstalled = () => {
            setVisible(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onInstalled);

        const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
        if (isIos && isSafari) {
            setShowIosHint(true);
            setVisible(true);
        } else {
            const fallbackTimer = window.setTimeout(() => {
                setVisible(true);
            }, 2200);

            return () => {
                window.clearTimeout(fallbackTimer);
                window.removeEventListener('beforeinstallprompt', onBeforeInstall);
                window.removeEventListener('appinstalled', onInstalled);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const dismiss = () => {
        setVisible(false);
    };

    const install = async () => {
        if (!deferredPrompt) {
            setShowIosHint(true);
            setVisible(true);
            return;
        }

        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-x-3 bottom-3 z-[9999] mx-auto max-w-xs">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-lg backdrop-blur-md">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Download className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900">Install PKLConnect</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                        {showIosHint
                            ? 'Buka ikon Bagikan lalu pilih "Tambahkan ke Layar Utama".'
                            : 'Akses lebih cepat dari layar utama Anda.'}
                    </p>
                    {!showIosHint && (
                        <button
                            onClick={install}
                            className="mt-2 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Install
                        </button>
                    )}
                </div>
                <button
                    onClick={dismiss}
                    aria-label="Tutup"
                    className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
