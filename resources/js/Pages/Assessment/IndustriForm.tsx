import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { StatusBadge } from '@/Components/StatusBadge';
import { GraduationCap, Star, Award, CheckCircle2 } from 'lucide-react';

interface Props {
    students: any[];
}

export default function AssessmentIndustriForm({ students }: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 1);

    const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

    const { data, setData, post, processing, errors } = useForm({
        student_id: selectedStudentId,
        discipline: activeStudent?.assessment?.discipline || 5,
        responsibility: activeStudent?.assessment?.responsibility || 5,
        teamwork: activeStudent?.assessment?.teamwork || 4,
        communication: activeStudent?.assessment?.communication || 4,
        technical_skill: activeStudent?.assessment?.technical_skill || 5,
        creativity: activeStudent?.assessment?.creativity || 5,
        problem_solving: activeStudent?.assessment?.problem_solving || 4,
        notes: activeStudent?.assessment?.notes || 'Siswa menunjukkan performa dan profesionalisme yang sangat baik.',
    });

    const handleSelectStudent = (id: number) => {
        setSelectedStudentId(id);
        const st = students.find((s) => s.id === id);
        setData({
            student_id: id,
            discipline: st?.assessment?.discipline || 5,
            responsibility: st?.assessment?.responsibility || 5,
            teamwork: st?.assessment?.teamwork || 4,
            communication: st?.assessment?.communication || 4,
            technical_skill: st?.assessment?.technical_skill || 5,
            creativity: st?.assessment?.creativity || 5,
            problem_solving: st?.assessment?.problem_solving || 4,
            notes: st?.assessment?.notes || '',
        });
    };

    // Calculate total score dynamically out of 100
    const ratings = [
        data.discipline,
        data.responsibility,
        data.teamwork,
        data.communication,
        data.technical_skill,
        data.creativity,
        data.problem_solving,
    ];
    const avg = ratings.reduce((a, b) => Number(a) + Number(b), 0) / ratings.length;
    const computedTotalScore = Math.round((avg / 5) * 100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/penilaian');
    };

    return (
        <DashboardLayout>
            <Head title="Penilaian Standar Industri" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Form Penilaian Kompetensi Industri</h1>
                <p className="text-xs text-slate-500 mt-1">Evaluasi 7 Aspek Kinerja & Skala Kompetensi Siswa PKL (Skala 1-5 & Konversi 100).</p>
            </div>

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
                                    {st.assessment.total_score}/100
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
                            <span className="text-3xl font-black text-cyan-600">{computedTotalScore} / 100</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 7 Aspek Penilaian */}
                        <div className="space-y-4">
                            {[
                                { key: 'discipline', label: '1. Kedisiplinan & Ketepatan Waktu Presensi' },
                                { key: 'responsibility', label: '2. Tanggung Jawab & Integritas Tugas' },
                                { key: 'teamwork', label: '3. Kerjasama Tim & Adaptasi Lingkungan Kerja' },
                                { key: 'communication', label: '4. Komunikasi & Etika Profesional' },
                                { key: 'technical_skill', label: '5. Keahlian Teknis & Penguasaan Skill' },
                                { key: 'creativity', label: '6. Kreativitas & Inovasi Kerja' },
                                { key: 'problem_solving', label: '7. Pemecahan Masalah (Problem Solving)' },
                            ].map((aspect) => (
                                <div key={aspect.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <span className="text-xs font-bold text-slate-800">{aspect.label}</span>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setData(aspect.key as any, num)}
                                                className={`w-9 h-9 rounded-xl font-extrabold text-xs transition-all ${
                                                    (data as any)[aspect.key] === num
                                                        ? 'bg-cyan-600 text-white shadow-md scale-105'
                                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Award className="w-4 h-4" />
                                <span>Simpan & Terbitkan Nilai Akhir</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
