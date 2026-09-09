import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { AssessmentAspect } from '@/Types';
import { Award, Star, Search, Eye, Edit3, Trash2, CheckCircle2, AlertCircle, Plus, UserCheck, X, Target } from 'lucide-react';

interface AssessmentItem {
    id: number;
    student_id: number;
    total_score: number;
    status?: 'LULUS' | 'BELUM';
    notes?: string;
    created_at: string;
    aspect_scores?: {
        id: number;
        assessment_id: number;
        assessment_aspect_id: number;
        score: number;
        aspect?: AssessmentAspect;
    }[];
    student: {
        id: number;
        nis: string;
        class: string;
        major: string;
        user: {
            name: string;
            email: string;
        };
        placement?: {
            company?: { name: string };
            industry?: { name: string };
        };
    };
    supervisor?: {
        id: number;
        name: string;
        email: string;
    };
}

interface UnassessedStudent {
    id: number;
    name: string;
    nis: string;
    class: string;
    major: string;
    company: string;
    supervisor: string;
}

interface Props {
    assessments: AssessmentItem[];
    unassessedStudents: UnassessedStudent[];
    aspects: AssessmentAspect[];
    stats: {
        total_assessed: number;
        total_lulus: number;
        total_belum: number;
        total_unassessed: number;
        avg_score: number;
        highest_score: number;
    };
}

type AspectScores = Record<string, number>;

function buildDefaultScores(aspects: AssessmentAspect[], existing?: AssessmentItem['aspect_scores']): AspectScores {
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

export default function AssessmentAdminIndex({ assessments, unassessedStudents, aspects, stats }: Props) {
    const [activeTab, setActiveTab] = useState<'assessed' | 'unassessed'>('assessed');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem | null>(null);
    const [editingStudent, setEditingStudent] = useState<{ id: number; name: string } | null>(null);
    const [deletingAssessment, setDeletingAssessment] = useState<AssessmentItem | null>(null);

    const form = useForm<{ student_id: number; aspect_scores: AspectScores; notes: string }>({
        student_id: 0,
        aspect_scores: {},
        notes: '',
    });

    const openInputModalForStudent = (id: number, name: string, existing?: AssessmentItem['aspect_scores'], notes?: string) => {
        const scores = buildDefaultScores(aspects, existing);
        setEditingStudent({ id, name });
        form.setData({ student_id: id, aspect_scores: scores, notes: notes ?? '' });
    };

    const openInputModalForUnassessed = (st: UnassessedStudent) => {
        openInputModalForStudent(st.id, st.name, undefined, 'Siswa menunjukkan etos kerja dan kompetensi vokasi yang memuaskan.');
    };

    const openEditModal = (a: AssessmentItem) => {
        openInputModalForStudent(a.student_id, a.student.user.name, a.aspect_scores, a.notes);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/penilaian', {
            preserveScroll: true,
            onSuccess: () => {
                setEditingStudent(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingAssessment) return;
        router.delete(`/penilaian/${deletingAssessment.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingAssessment(null),
        });
    };

    const filteredAssessments = assessments.filter((a) => {
        const studentName = a.student?.user?.name?.toLowerCase() || '';
        const nis = a.student?.nis?.toLowerCase() || '';
        const company = a.student?.placement?.company?.name?.toLowerCase() || a.student?.placement?.industry?.name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return studentName.includes(search) || nis.includes(search) || company.includes(search);
    });

    const filteredUnassessed = unassessedStudents.filter((u) => {
        const search = searchTerm.toLowerCase();
        return (
            u.name.toLowerCase().includes(search) ||
            u.nis.toLowerCase().includes(search) ||
            u.company.toLowerCase().includes(search) ||
            u.class.toLowerCase().includes(search)
        );
    });

    const live = computeResult(aspects, form.data.aspect_scores);

    const getPredicate = (score: number) => {
        if (score >= 90) return { label: 'Sangat Baik (A)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
        if (score >= 80) return { label: 'Baik (B)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
        if (score >= 70) return { label: 'Cukup (C)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
        return { label: 'Kurang (D)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    };

    return (
        <DashboardLayout>
            <Head title="Penilaian Kompetensi Standar Industri" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Penilaian Standar Industri</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Evaluasi per aspek sesuai konfigurasi nilai minimum (KKM) yang ditetapkan admin.
                    </p>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Siswa Telah Dinilai</p>
                        <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.total_assessed} Siswa</h4>
                        <p className="text-[11px] text-cyan-600 font-semibold">Rata-rata: {stats.avg_score}/100</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Lulus KKM</p>
                        <h4 className="text-xl font-bold text-emerald-600 mt-0.5">{stats.total_lulus} Siswa</h4>
                        <p className="text-[11px] text-emerald-600 font-semibold">Seluruh aspek ≥ min</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Belum Penuhi KKM</p>
                        <h4 className="text-xl font-bold text-amber-600 mt-0.5">{stats.total_belum} Siswa</h4>
                        <p className="text-[11px] text-amber-600 font-semibold">Ada aspek di bawah min</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Belum Dinilai</p>
                        <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.total_unassessed} Siswa</h4>
                        <p className="text-[11px] text-slate-500 font-semibold">Menunggu evaluasi</p>
                    </div>
                </div>
            </div>

            {/* Tabs & Table Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 border-b md:border-b-0 pb-2 md:pb-0">
                        <button
                            onClick={() => setActiveTab('assessed')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                                activeTab === 'assessed'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Telah Dinilai ({assessments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('unassessed')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                                activeTab === 'unassessed'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Belum Dinilai ({unassessedStudents.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari siswa, NIS, atau industri..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* TAB 1: DAFTAR TELAH DINILAI */}
                {activeTab === 'assessed' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">NIS & Siswa</th>
                                    <th className="p-4">Kelas & Jurusan</th>
                                    <th className="p-4">Perusahaan PKL</th>
                                    <th className="p-4 text-center">Nilai Akhir</th>
                                    <th className="p-4 text-center">Status KKM</th>
                                    <th className="p-4 text-right">Aksi Table</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredAssessments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-slate-400">
                                            Tidak ada data penilaian yang cocok dengan kriteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssessments.map((a) => {
                                        const pred = getPredicate(a.total_score);
                                        const companyName =
                                            a.student.placement?.company?.name ||
                                            a.student.placement?.industry?.name ||
                                            'Perusahaan Mitra';
                                        return (
                                            <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-900">{a.student.user.name}</p>
                                                    <p className="text-[10px] text-slate-400">NIS: {a.student.nis}</p>
                                                </td>
                                                <td className="p-4">{a.student.class} ({a.student.major})</td>
                                                <td className="p-4 font-semibold text-slate-800">{companyName}</td>
                                                <td className="p-4 text-center">
                                                    <span className="text-base font-black text-cyan-600">{a.total_score}</span>
                                                    <span className="text-[10px] text-slate-400 font-semibold block">/ 100</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                                                        a.status === 'LULUS'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {a.status === 'LULUS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                        {a.status === 'LULUS' ? 'LULUS' : 'BELUM KKM'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* DETAIL */}
                                                        <button
                                                            onClick={() => setSelectedAssessment(a)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                                                            title="Lihat Rincian Aspek Nilai"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                            <span>Detail</span>
                                                        </button>
                                                        {/* EDIT */}
                                                        <button
                                                            onClick={() => openEditModal(a)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                            title="Edit Skor Penilaian"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                            <span>Edit</span>
                                                        </button>
                                                        {/* DELETE */}
                                                        <button
                                                            onClick={() => setDeletingAssessment(a)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1"
                                                            title="Hapus / Reset Nilai"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Hapus</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: DAFTAR BELUM DINILAI */}
                {activeTab === 'unassessed' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">NIS & Siswa</th>
                                    <th className="p-4">Kelas & Jurusan</th>
                                    <th className="p-4">Tempat PKL</th>
                                    <th className="p-4">Pembimbing Mitra</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Aksi Table</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredUnassessed.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-slate-400">
                                            Seluruh siswa aktif telah memiliki penilaian PKL! 🎉
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUnassessed.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900">{u.name}</p>
                                                <p className="text-[10px] text-slate-400">NIS: {u.nis}</p>
                                            </td>
                                            <td className="p-4">{u.class} ({u.major})</td>
                                            <td className="p-4 font-semibold text-slate-800">{u.company}</td>
                                            <td className="p-4 text-slate-600">{u.supervisor}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    Belum Dinilai
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => openInputModalForUnassessed(u)}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
                                                    title="Input Penilaian Siswa"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Input Nilai</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL DETAIL ASPEK PENILAIAN */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Lembar Rincian Penilaian
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAssessment.student.user.name}</h3>
                                <p className="text-xs text-slate-500">
                                    NIS: {selectedAssessment.student.nis} | {selectedAssessment.student.class} ({selectedAssessment.student.major})
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedAssessment(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 flex items-center justify-between mb-4">
                            <div>
                                <span className="text-xs text-cyan-800 font-bold uppercase">Total Skor Akhir</span>
                                <div className="text-3xl font-black text-cyan-600">{selectedAssessment.total_score} / 100</div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border block ${getPredicate(selectedAssessment.total_score).color}`}>
                                    {getPredicate(selectedAssessment.total_score).label}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border block ${
                                    selectedAssessment.status === 'LULUS'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {selectedAssessment.status === 'LULUS' ? 'LULUS KKM' : 'BELUM MEMENUHI KKM'}
                                </span>
                            </div>
                        </div>

                        {/* Aspek Nilai */}
                        <div className="space-y-2 text-xs mb-4">
                            <span className="font-bold text-slate-500 uppercase text-[10px] block">
                                Rincian Per Aspek (nilai vs minimum KKM):
                            </span>
                            {selectedAssessment.aspect_scores?.map((s) => {
                                const met = s.score >= (s.aspect?.min_score ?? 0);
                                return (
                                    <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Target className={`w-3.5 h-3.5 shrink-0 ${met ? 'text-emerald-500' : 'text-rose-400'}`} />
                                            <span className="font-medium text-slate-700 truncate">{s.aspect?.name ?? 'Aspek'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {[1, 2, 3, 4, 5].map((st) => {
                                                const pct = s.score / (s.aspect?.max_score ?? 100);
                                                return (
                                                    <Star
                                                        key={st}
                                                        className={`w-3.5 h-3.5 ${st <= Math.ceil(pct * 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                    />
                                                );
                                            })}
                                            <span className={`ml-1.5 font-bold ${met ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                {s.score}/{s.aspect?.max_score ?? 100}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                                met ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {met ? 'OK' : `< ${s.aspect?.min_score}`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {!selectedAssessment.aspect_scores?.length && (
                                <p className="text-center text-slate-400 py-3">Belum ada rincian aspek tersimpan.</p>
                            )}
                        </div>

                        {/* Catatan Evaluasi */}
                        {selectedAssessment.notes && (
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Catatan Evaluasi Industri:</span>
                                <p className="text-slate-600 leading-relaxed italic">"{selectedAssessment.notes}"</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    const a = selectedAssessment;
                                    setSelectedAssessment(null);
                                    openEditModal(a);
                                }}
                                className="px-3.5 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Nilai</span>
                            </button>
                            <button
                                onClick={() => setSelectedAssessment(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INPUT / EDIT PENILAIAN */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Form Penilaian Kompetensi</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Siswa: <span className="font-bold text-slate-800">{editingStudent.name}</span></p>
                            </div>
                            <button
                                onClick={() => setEditingStudent(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Live Score Display */}
                        <div className={`p-3.5 rounded-2xl border flex items-center justify-between mb-4 ${
                            live.passed ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                        }`}>
                            <div>
                                <span className="text-[11px] font-bold uppercase block text-slate-700">Kalkulasi Skor Otomatis</span>
                                <span className="text-2xl font-black text-slate-900">{live.totalScore} / 100</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                live.passed
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                                {live.passed ? '✓ LULUS KKM' : '✗ BELUM KKM'}
                            </span>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                            <div className="space-y-3">
                                {aspects.map((a) => {
                                    const val = Number(form.data.aspect_scores[String(a.id)] ?? 0);
                                    const met = val >= a.min_score;
                                    return (
                                        <div
                                            key={a.id}
                                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                                met ? 'bg-slate-50 border-slate-100' : 'bg-rose-50/50 border-rose-100'
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <span className="font-semibold text-slate-800 block truncate">{a.name}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    Minimum KKM: <span className="font-bold text-emerald-700">{a.min_score}</span> · Maks: {a.max_score}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={a.max_score}
                                                    step={a.max_score > 10 ? 1 : 0.5}
                                                    value={Number.isNaN(val) ? '' : val}
                                                    onChange={(e) => form.setData(`aspect_scores.${a.id}`, Number(e.target.value))}
                                                    className="w-20 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                />
                                                <span className={`text-[10px] font-bold ${met ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                    {met ? 'TUNTAS' : 'BELUM'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Evaluasi / Rekomendasi</label>
                                <textarea
                                    rows={3}
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="Tuliskan catatan apresiasi atau evaluasi teknis..."
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none p-2.5 bg-slate-50"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{form.processing ? 'Menyimpan...' : 'Simpan Nilai Siswa'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS PENILAIAN */}
            {deletingAssessment && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Reset / Hapus Penilaian?</h3>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Apakah Anda yakin ingin menghapus data penilaian untuk{' '}
                            <span className="font-bold text-slate-800">{deletingAssessment.student.user.name}</span>?
                            Siswa akan kembali berstatus "Belum Dinilai".
                        </p>

                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setDeletingAssessment(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                            >
                                Ya, Hapus Nilai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}