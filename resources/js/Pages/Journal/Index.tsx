import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { BookOpen, Plus, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Journal } from '@/Types';

interface Props {
    journals: Journal[];
}

export default function JournalIndex({ journals }: Props) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        activity: '',
        description: '',
        skill: '',
        obstacle: '',
        solution: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/jurnal', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="E-Jurnal Kegiatan PKL" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">E-Jurnal Kegiatan PKL Harian</h1>
                    <p className="text-xs text-slate-500 mt-1">Catat aktivitas pekerjaan, kompetensi skill, dan solusi kendala teknis.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
                >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Jurnal Hari Ini</span>
                </button>
            </div>

            {/* Modal Form Tambah Jurnal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <h3 className="font-extrabold text-slate-900 text-lg">Form Input Jurnal PKL</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Tanggal Kegiatan</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Judul Aktivitas Pekerjaan</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Developing RESTful API endpoint absensi digital"
                                    value={data.activity}
                                    onChange={(e) => setData('activity', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                                />
                                {errors.activity && <p className="text-rose-500 mt-1">{errors.activity}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Deskripsi Pekerjaan Rinci</label>
                                <textarea
                                    rows={3}
                                    placeholder="Jelaskan alur pekerjaan yang Anda lakukan..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Skill / Kompetensi Yang Dipelajari</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Laravel 12, Inertia.js, React, Tailwind CSS"
                                    value={data.skill}
                                    onChange={(e) => setData('skill', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Kendala Teknis (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="Kendala yang dihadapi..."
                                        value={data.obstacle}
                                        onChange={(e) => setData('obstacle', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Solusi / Penanganan (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="Solusi penyelesaian..."
                                        value={data.solution}
                                        onChange={(e) => setData('solution', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-bold shadow-md hover:bg-cyan-700"
                                >
                                    Simpan Jurnal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List Jurnal */}
            <div className="space-y-4">
                {journals.map((j) => (
                    <div key={j.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-[11px] font-mono text-slate-400 font-bold">{j.date}</span>
                                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{j.activity}</h3>
                            </div>
                            <StatusBadge status={j.status} />
                        </div>

                        <p className="text-xs text-slate-600 mt-4 leading-relaxed">{j.description}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
                            <span className="px-3 py-1 rounded-lg bg-cyan-50 text-cyan-700 font-semibold border border-cyan-100">
                                Skill: {j.skill}
                            </span>
                            {j.obstacle && (
                                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium border border-rose-100">
                                    Kendala: {j.obstacle}
                                </span>
                            )}
                            {j.solution && (
                                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                                    Solusi: {j.solution}
                                </span>
                            )}
                        </div>

                        {j.revision_note && (
                            <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                                <strong>Catatan Revisi Industri:</strong> {j.revision_note}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
