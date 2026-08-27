import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Sidebar } from '@/Components/Sidebar';
import { Header } from '@/Components/Header';
import { NexaChat } from '@/Components/NexaChat';
import { PageProps } from '@/Types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export const DashboardLayout: React.FC<Props> = ({ children, title }) => {
    const { props } = usePage<PageProps>();
    const flash = props?.flash || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

    const dismissFlash = (key: string) => setDismissed(prev => ({ ...prev, [key]: true }));

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
                <Header onToggleSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto">
                    {/* Flash Messages */}
                    {flash.success && !dismissed.success && (
                        <div className="mb-5 p-3.5 pr-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[13px] font-medium flex items-center gap-2.5 relative">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{flash.success}</span>
                            <button onClick={() => dismissFlash('success')} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {flash.error && !dismissed.error && (
                        <div className="mb-5 p-3.5 pr-10 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-[13px] font-medium flex items-center gap-2.5 relative">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{flash.error}</span>
                            <button onClick={() => dismissFlash('error')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {flash.message && !dismissed.message && (
                        <div className="mb-5 p-3.5 pr-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-800 text-[13px] font-medium flex items-center gap-2.5 relative">
                            <Info className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{flash.message}</span>
                            <button onClick={() => dismissFlash('message')} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {children}
                </main>
            </div>

            <NexaChat />
        </div>
    );
};
