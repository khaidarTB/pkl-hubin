import React from 'react';
import { Head } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Award, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { Assessment } from '@/Types';

interface Props {
    assessment: Assessment | null;
}

export default function AssessmentSiswaView({ assessment }: Props) {
    return (
        <DashboardLayout>
            <Head title="Lembar Penilaian PKL Saya" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lembar Penilaian Akhir PKL</h1>
                <p className="text-xs text-slate-500 mt-1">Evaluasi resmi dari Pembimbing Industri dan Pembimbing Sekolah.</p>
            </div>

            {!assessment ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-700 text-base">Penilaian Belum Diterbitkan</h3>
                    <p className="text-xs text-slate-500 mt-2">
                        Pembimbing industri belum merilis nilai akhir kegiatan PKL Anda. Tetap tingkatkan kinerja dan kedisiplinan!
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                                <ShieldCheck className="w-4 h-4" /> Nilai Akhir Terverifikasi Industri
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900">Sertifikasi & Evaluasi PKL</h2>
                            <p className="text-xs text-slate-500 mt-1">Dinilai oleh: {assessment.supervisor?.name || 'Hendra Wijaya (Senior Tech Lead)'}</p>
                        </div>
                        <div className="text-center sm:text-right p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
                            <span className="text-xs font-bold text-cyan-700 uppercase block">Total Nilai Akhir</span>
                            <span className="text-4xl font-black text-cyan-600">{assessment.total_score}</span>
                            <span className="text-xs text-slate-500 block font-semibold mt-0.5">Predikat: SANGAT BAIK (A)</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3 text-xs">
                        {[
                            { name: 'Kedisiplinan & Presensi', val: assessment.discipline },
                            { name: 'Tanggung Jawab & Integritas', val: assessment.responsibility },
                            { name: 'Kerjasama Tim & Adaptasi', val: assessment.teamwork },
                            { name: 'Komunikasi & Etika', val: assessment.communication },
                            { name: 'Keahlian Teknis & Skill', val: assessment.technical_skill },
                            { name: 'Kreativitas & Inovasi', val: assessment.creativity },
                            { name: 'Pemecahan Masalah', val: assessment.problem_solving },
                        ].map((item, i) => (
                            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <span className="font-semibold text-slate-700">{item.name}</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= item.val ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                    <span className="ml-2 font-bold text-slate-900">({item.val}/5)</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {assessment.notes && (
                        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                            <h4 className="font-bold text-slate-900 mb-1">Catatan Pembimbing Industri:</h4>
                            <p className="text-slate-600 leading-relaxed italic">"{assessment.notes}"</p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
