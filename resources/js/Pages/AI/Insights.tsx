import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import {
    Sparkles,
    AlertTriangle,
    BookOpen,
    CalendarClock,
    MapPinOff,
    Lightbulb,
    ArrowRight,
    Activity,
} from 'lucide-react';

interface InsightItem {
    key: string;
    title: string;
    count: number;
    description: string;
    items: string[];
}

interface PriorityStudent {
    name: string;
    class: string;
    company: string;
    attendance_rate: number | null;
    days_since_last_visit: number | null;
    journal_gap_days: number | null;
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface InsightsData {
    scope: string;
    generated_at: string;
    stats: Record<string, number>;
    insights: InsightItem[];
    priority_students: PriorityStudent[];
    recommendation: string;
}

const insightIcon = (key: string) => {
    switch (key) {
        case 'attendance':
            return { icon: AlertTriangle, classes: 'bg-rose-100 text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
        case 'monitoring':
            return { icon: CalendarClock, classes: 'bg-amber-100 text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
        case 'journal':
            return { icon: BookOpen, classes: 'bg-blue-100 text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'placement':
            return { icon: MapPinOff, classes: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        default:
            return { icon: Activity, classes: 'bg-slate-100 text-slate-600', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
};

const levelBadge = (level: PriorityStudent['level']) =>
    ({
        CRITICAL: 'bg-red-50 text-red-700 border-red-200',
        HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
        MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
        LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }[level]);

export default function AIInsights({ insights }: { insights: InsightsData }) {
    const statEntries = Object.entries(insights.stats ?? {});

    return (
        <DashboardLayout>
            <Head title="NEXA AI Monitoring Insights" />

            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>NEXA Intelligent Analytics Engine</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">NEXA AI Monitoring Insights</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Analisis berbasis data nyata — lingkup: <span className="font-semibold text-slate-700">{insights.scope}</span>.
                    Dihitung pada {new Date(insights.generated_at).toLocaleString('id-ID')}.
                </p>
            </div>

            {/* Risk distribution */}
            {statEntries.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                    {statEntries.map(([label, value]) => (
                        <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {label.split('_').join(' ')}
                            </p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {(insights.insights ?? []).map((item) => {
                    const { icon: Icon, classes, badge } = insightIcon(item.key);
                    return (
                        <div key={item.key} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${classes}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 text-base">
                                        {item.title}
                                        {item.count > 0 && (
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                                                {item.count}
                                            </span>
                                        )}
                                    </h3>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                            {item.items.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {item.items.slice(0, 5).map((name) => (
                                        <li key={name} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Priority students */}
            {insights.priority_students?.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 overflow-hidden">
                    <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Prioritas Monitoring (Monitoring Score)
                    </h3>
                    <div className="overflow-x-auto -mx-2">
                        <table className="w-full min-w-[640px] text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                    <th className="px-2 pb-2 font-bold">Siswa</th>
                                    <th className="px-2 pb-2 font-bold">Perusahaan</th>
                                    <th className="px-2 pb-2 font-bold text-center">Kehadiran</th>
                                    <th className="px-2 pb-2 font-bold text-center">Kunjungan Terakhir</th>
                                    <th className="px-2 pb-2 font-bold text-center">Skor</th>
                                    <th className="px-2 pb-2 font-bold text-center">Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {insights.priority_students.map((s) => (
                                    <tr key={s.name} className="text-xs text-slate-700 hover:bg-slate-50/60">
                                        <td className="px-2 py-2.5 font-semibold">
                                            {s.name}
                                            <span className="block text-[10px] text-slate-400 font-normal">{s.class}</span>
                                        </td>
                                        <td className="px-2 py-2.5">{s.company}</td>
                                        <td className={`px-2 py-2.5 text-center font-bold ${s.attendance_rate !== null && s.attendance_rate < 80 ? 'text-rose-600' : ''}`}>
                                            {s.attendance_rate !== null ? `${s.attendance_rate}%` : '-'}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {s.days_since_last_visit === null ? 'Belum pernah' : `${s.days_since_last_visit} hari lalu`}
                                        </td>
                                        <td className="px-2 py-2.5 text-center font-black">{s.score}</td>
                                        <td className="px-2 py-2.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${levelBadge(s.level)}`}>
                                                {s.level}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recommendation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3 max-w-2xl">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-[14px] mb-1">Rekomendasi NEXA</h3>
                        <p className="text-[12px] text-slate-600 leading-relaxed">{insights.recommendation}</p>
                    </div>
                </div>
                <Link
                    href="/ai-assistant"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800 transition-colors"
                >
                    Tanya NEXA AI
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </DashboardLayout>
    );
}
