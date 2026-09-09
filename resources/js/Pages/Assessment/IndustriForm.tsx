import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { AssessmentAspect } from '@/Types';
import { GraduationCap, Award, CheckCircle2, AlertCircle, Target } from 'lucide-react';

interface AspectScoreItem {
    assessment_aspect_id: number;
    score: number;
    aspect?: AssessmentAspect;
}

interface StudentItem {
    id: number;
    name: string;
    class: string;
    major: string;
    assessment?: {
        total_score: number;
        status?: 'LULUS' | 'BELUM';
        notes?: string;
        aspect_scores?: AspectScoreItem[];
    } | null;
}

interface Props {
    students: StudentItem[];
    aspects: AssessmentAspect[];
}

type AspectScores = Record<string, number>;

function buildScores(aspects: AssessmentAspect[], existing?: AspectScoreItem[]): AspectScores {
    const scores: AspectScores = {};
    for (const a of aspects) {
        const found = existing?.find((s) => s.assessment_aspect_id === a.id);
        scores[String(a.id)] = found?.score ?? a.max_score;
    }
    return scores;
}

function computeResult(aspects: AssessmentAspect[], scores: AspectScores) {
    let sum = 0;
    let passed = true;
    for (const a of aspects) {
        const score = Number(scores[String(a.id)] ?? 0);
        sum += a.max_score > 0 ? (score / a.max_score) * 100 : 0;
        if (score < a.min_score) passed = false;
    }
    const totalScore = aspects.length ? Math.round(sum / aspects.length) : 0;
    return { totalScore, passed };
}

export default function AssessmentIndustriForm({ students, aspects }: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 0);

    const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

    const { data, setData, post, processing, errors } = useForm<{
        student_id: number;
        aspect_scores: AspectScores;
        notes: string;
    }>({
        student_id: activeStudent?.id || 0,
        aspect_scores: buildScores(aspects, activeStudent?.assessment?.aspect_scores),
        notes: activeStudent?.assessment?.notes || '',
    });

    const handleSelectStudent = (id: number) => {
        setSelectedStudentId(id);
        const st = students.find((s) => s.id === id);
        setData({
            student_id: id,
            aspect_scores: buildScores(aspects, st?.assessment?.aspect_scores),
            notes: st?.assessment?.notes || '',
        });
    };

    const live = computeResult(aspects, data.aspect_scores);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/penilaian');
    };

    return (
        <DashboardLayout>
            <Head title="Penilaian Standar Industri" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Form Penilaian Kompetensi Industri</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Evaluasi per aspek sesuai skor & nilai minimum (KKM) yang dikonfigurasi sekolah.
                </p>
            </div>

            {students.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-base">Belum Ada Siswa Ditempatkan</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Belum ada data siswa PKL aktif yang ditempatkan di bawah supervisi perusahaan Anda.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Student Selector List */}
                    <div className="lg:col-span-4 space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Pilih Siswa PKL</h3>
                        {students.map((st) => (
                            <button
                                key={st.id}
                                type="button"
                                onClick={() => handleSelectStudent(st.id)}
                                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                                    selectedStudentId === st.id
                                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20'
                                        : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                <div>
                                    <p className="font-bold text-sm">{st.name}</p>
                                    <p className={`text-xs ${selectedStudentId === st.id ? 'text-cyan-100' : 'text-slate-500'}`}>
                                        {st.class} — {st.major}
                                    </p>
                                </div>
                                {st.assessment ? (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        selectedStudentId === st.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                        {st.assessment.status === 'LULUS' ? 'LULUS' : st.assessment.status === 'BELUM' ? 'BELUM KKM' : `${st.assessment.total_score}/100`}
                                    </span>
                                ) : (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        selectedStudentId === st.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        Belum Dinilai
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right: Assessment Form */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">{activeStudent?.name}</h3>
                            <p className="text-xs text-slate-500">{activeStudent?.class} ({activeStudent?.major})</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase block">Kalkulasi Skor Akhir</span>
                            <span className="text-3xl font-black text-cyan-600">{live.totalScore} / 100</span>
                            <span className={`ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold border ${live.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {live.passed ? 'LULUS KKM' : 'BELUM KKM'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Aspek Penilaian (dinamis dari admin) */}
                        <div className="space-y-4">
                            {aspects.map((a) => {
                                const val = Number(data.aspect_scores[String(a.id)] ?? 0);
                                const met = val >= a.min_score;
                                return (
                                    <div
                                        key={a.id}
                                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                            met ? 'bg-slate-50 border-slate-200/80' : 'bg-rose-50/40 border-rose-200'
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-slate-800 block">{a.name}</span>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Target className="w-3 h-3 text-emerald-600" />
                                                Minimum: <span className="font-bold text-emerald-700">{a.min_score}</span> · Maks: {a.max_score}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <input
                                                type="number"
                                                min={0}
                                                max={a.max_score}
                                                step={a.max_score > 10 ? 1 : 0.5}
                                                value={Number.isNaN(val) ? '' : val}
                                                onChange={(e) => setData(`aspect_scores.${a.id}`, Number(e.target.value))}
                                                className="w-24 text-center font-extrabold text-slate-900 bg-white border border-slate-200 rounded-xl px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                            <span className={`text-[10px] font-bold ${met ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {met ? 'TUNTAS' : 'BELUM'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {aspects.length === 0 && (
                                <p className="text-center text-slate-400 text-xs py-3">
                                    Belum ada aspek penilaian aktif yang dikonfigurasi admin sekolah.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Catatan & Evaluasi Pembimbing Industri</label>
                            <textarea
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Berikan umpan balik dan rekomendasi untuk siswa..."
                                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                            >
                                <Award className="w-4 h-4" />
                                <span>Simpan & Terbitkan Nilai Akhir</span>
                            </button>
                        </div>
                        {errors.student_id && <p className="text-[11px] text-rose-500 text-right">{errors.student_id}</p>}
                    </form>
                </div>
            </div>
            )}
        </DashboardLayout>
    );
}