import React from 'react';
import { Head } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Award, CheckCircle2, Star, ShieldCheck, Target, AlertCircle } from 'lucide-react';
import { Assessment, AssessmentAspect } from '@/Types';

interface Props {
    assessment: Assessment | null;
    aspects: AssessmentAspect[];
}

const LEGACY_COLUMNS = ['discipline', 'responsibility', 'teamwork', 'communication', 'technical_skill', 'creativity', 'problem_solving'];

function getPredicate(score: number) {
    if (score >= 90) return 'SANGAT BAIK (A)';
    if (score >= 80) return 'BAIK (B)';
    if (score >= 70) return 'CUKUP (C)';
    return 'KURANG (D)';
}

export default function AssessmentSiswaView({ assessment, aspects }: Props) {
    const hasScores = !!assessment?.aspect_scores && assessment.aspect_scores.length > 0;

    const rows = hasScores
        ? (assessment!.aspect_scores || []).map((s) => ({
              id: s.id,
              name: s.aspect?.name ?? 'Aspek',
              score: s.score,
              max: s.aspect?.max_score ?? 100,
              min: s.aspect?.min_score ?? 85,
          }))
        : assessment
            ? aspectsEmptyFallback()
            : [];

    function aspectsEmptyFallback() {
        const a = assessment!;
        return LEGACY_COLUMNS.map((col, i) => {
            const aspect = aspects[i];
            return {
                id: i,
                name: aspect?.name ?? 'Aspek ' + (i + 1),
                score: Number((a as any)[col] ?? 0) * 20,
                max: aspect?.max_score ?? 100,
                min: aspect?.min_score ?? 85,
            };
        }).filter((r) => r.score > 0);
    }

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
                            <p className="text-xs text-slate-500 mt-1">Dinilai oleh: {assessment.supervisor?.name || 'Pembimbing Industri'}</p>
                        </div>
                        <div className="text-center sm:text-right p-4 rounded-2xl bg-cyan-50 border border-cyan-100 space-y-1">
                            <span className="text-xs font-bold text-cyan-700 uppercase block">Total Nilai Akhir</span>
                            <span className="text-4xl font-black text-cyan-600">{assessment.total_score}</span>
                            <span className="text-xs text-slate-500 block font-semibold">Predikat: {getPredicate(assessment.total_score)}</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                assessment.status === 'LULUS'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {assessment.status === 'LULUS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {assessment.status === 'LULUS' ? 'LULUS KKM' : 'BELUM MEMENUHI KKM'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3 text-xs">
                        {rows.map((item) => {
                            const met = item.score >= item.min;
                            return (
                                <div key={item.id} className={`p-3.5 rounded-2xl border flex items-center justify-between ${met ? 'bg-slate-50 border-slate-100' : 'bg-rose-50/40 border-rose-200'}`}>
                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5 min-w-0">
                                        <Target className={`w-3.5 h-3.5 shrink-0 ${met ? 'text-emerald-500' : 'text-rose-400'}`} />
                                        <span className="truncate">{item.name}</span>
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const pct = item.score / item.max;
                                                return (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= Math.ceil(pct * 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <span className={`font-bold ${met ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            {item.score}/{item.max}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                            met ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                                        }`}>
                                            {met ? 'TUNTAS' : `MIN ${item.min}`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
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