import React from 'react';
import { Head } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Props {
    notifications: any[];
}

export default function NotificationIndex({ notifications }: Props) {
    return (
        <DashboardLayout>
            <Head title="Pusat Notifikasi PKLConnect" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pusat Notifikasi System</h1>
                <p className="text-xs text-slate-500 mt-1">Pemberitahuan aktivitas jurnal, presensi, dan penilaian secara real-time.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 max-w-3xl space-y-4">
                {notifications.map((n) => (
                    <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-600 shrink-0 mt-0.5">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
