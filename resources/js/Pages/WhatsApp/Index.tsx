import React from 'react';
import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { MessageSquare, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface Props {
    gatewayStatus: string;
    provider: string;
    samples: any[];
}

export default function WhatsAppIndex({ gatewayStatus, provider, samples }: Props) {
    const handleSendTest = () => {
        router.post('/whatsapp/test');
    };

    return (
        <DashboardLayout>
            <Head title="WhatsApp Gateway Status" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Integrasi WhatsApp Gateway</h1>
                    <p className="text-xs text-slate-500 mt-1">Layanan pengiriman notifikasi otomatis absensi dan persetujuan jurnal.</p>
                </div>
                <button
                    onClick={handleSendTest}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                >
                    <Send className="w-4 h-4" />
                    <span>Uji Kirim Pesan WA (Simulasi)</span>
                </button>
            </div>

            {/* Gateway Status Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8 max-w-3xl">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Provider Integrasi</span>
                            <h3 className="font-extrabold text-slate-900 text-base">{provider}</h3>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Status: {gatewayStatus}</span>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm">Contoh Pesan Terkirim Rutin:</h4>
                    {samples.map((s, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-xs text-slate-900">{s.title}</span>
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    {s.status} ({s.time})
                                </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-700 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200/80">
                                {s.message}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
