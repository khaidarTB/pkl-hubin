import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Company, PklPeriod, Placement, Student, User } from '@/Types';
import { MapPin, Users, Building2, CheckCircle2, Plus, Edit3, Trash2, X, Check, Search } from 'lucide-react';

interface Props {
    unplacedStudents: Student[];
    activePlacements: Placement[];
    companies: Company[];
    teachers: User[];
    industrySupervisors: User[];
    activePeriod: PklPeriod | null;
}

export default function PlacementsIndex({ unplacedStudents, activePlacements, companies, teachers, industrySupervisors, activePeriod }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
    const [deletingPlacement, setDeletingPlacement] = useState<Placement | null>(null);

    // Form Tambah Penempatan
    const { data, setData, post, processing, reset } = useForm({
        student_id: '', company_id: '', school_supervisor_id: '', industry_supervisor_id: '',
        start_date: activePeriod?.start_date || '2026-08-01', end_date: activePeriod?.end_date || '2026-11-30',
    });

    // Form Edit Penempatan
    const editForm = useForm({
        company_id: '',
        school_supervisor_id: '',
        industry_supervisor_id: '',
        start_date: '',
        end_date: '',
        status: 'Aktif',
    });

    const openPlaceModal = (std: Student) => {
        setSelectedStudent(std);
        setData({
            student_id: std.id.toString(),
            company_id: std.latestApplication?.company_id ? std.latestApplication.company_id.toString() : (companies[0]?.id.toString() || ''),
            school_supervisor_id: teachers[0]?.id.toString() || '',
            industry_supervisor_id: industrySupervisors[0]?.id.toString() || '',
            start_date: activePeriod?.start_date ? String(activePeriod.start_date) : '2026-08-01',
            end_date: activePeriod?.end_date ? String(activePeriod.end_date) : '2026-11-30',
        });
        setIsModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/penempatan', { onSuccess: () => { setIsModalOpen(false); reset(); } });
    };

    const openEditModal = (plc: Placement) => {
        setEditingPlacement(plc);
        editForm.setData({
            company_id: plc.company_id?.toString() || (companies[0]?.id.toString() || ''),
            school_supervisor_id: plc.school_supervisor_id?.toString() || (teachers[0]?.id.toString() || ''),
            industry_supervisor_id: plc.industry_supervisor_id ? plc.industry_supervisor_id.toString() : '',
            start_date: plc.start_date ? String(plc.start_date).substring(0, 10) : '2026-08-01',
            end_date: plc.end_date ? String(plc.end_date).substring(0, 10) : '2026-11-30',
            status: plc.status || 'Aktif',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlacement) return;
        editForm.put(`/admin/penempatan/${editingPlacement.id}`, {
            onSuccess: () => setEditingPlacement(null),
        });
    };

    const handleDelete = () => {
        if (!deletingPlacement) return;
        router.delete(`/admin/penempatan/${deletingPlacement.id}`, {
            onSuccess: () => setDeletingPlacement(null),
        });
    };

    const filteredPlacements = activePlacements.filter(p => {
        const studentName = p.student?.user?.name || '';
        const companyName = p.company?.name || '';
        const teacherName = p.schoolSupervisor?.name || '';
        return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <DashboardLayout>
            <Head title="Penempatan Siswa" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Penempatan Siswa PKL</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Tempatkan siswa ke perusahaan mitra beserta guru dan instruktur pembimbing.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center gap-3 shadow-sm">
                        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600"><Users className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500">Belum Ditempatkan</p>
                            <p className="text-lg font-bold text-slate-900">{unplacedStudents.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center gap-3 shadow-sm">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500">Penempatan Aktif</p>
                            <p className="text-lg font-bold text-slate-900">{activePlacements.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center gap-3 shadow-sm">
                        <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-600"><Building2 className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500">Perusahaan Mitra</p>
                            <p className="text-lg font-bold text-slate-900">{companies.length}</p>
                        </div>
                    </div>
                </div>

                {/* Siswa Siap Penempatan */}
                {unplacedStudents.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                        <div>
                            <h3 className="text-[14px] font-bold text-slate-900">Siswa Siap Penempatan ({unplacedStudents.length})</h3>
                            <p className="text-[12px] text-slate-500 mt-0.5">Pengajuan PKL telah disetujui sekolah, siap dialokasikan ke industri mitra.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {unplacedStudents.map((std) => (
                                <div key={std.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-slate-900 text-[13px]">{std.user?.name}</p>
                                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-medium">{std.class}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1">Target: <span className="font-medium text-slate-700">{std.latestApplication?.company_name || 'Mitra'}</span></p>
                                    </div>
                                    <button onClick={() => openPlaceModal(std)}
                                        className="w-full py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-sm">
                                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Tempatkan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabel Penempatan Aktif */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-[14px] font-bold text-slate-900">Daftar Penempatan Aktif</h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari siswa atau tempat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3">Siswa</th>
                                    <th className="px-5 py-3">Perusahaan</th>
                                    <th className="px-5 py-3">Guru Pembimbing</th>
                                    <th className="px-5 py-3">Pembimbing DUDI</th>
                                    <th className="px-5 py-3">Periode</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredPlacements.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                                            Tidak ada data penempatan yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlacements.map((plc) => (
                                        <tr key={plc.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3">
                                                <p className="font-bold text-slate-900">{plc.student?.user?.name || 'Siswa'}</p>
                                                <p className="text-[10px] text-slate-400">{plc.student?.class} ({plc.student?.major})</p>
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-800">{plc.company?.name || '-'}</td>
                                            <td className="px-5 py-3 text-slate-600">{plc.schoolSupervisor?.name || 'Belum Diatur'}</td>
                                            <td className="px-5 py-3 text-slate-600">{plc.industrySupervisor?.name || '-'}</td>
                                            <td className="px-5 py-3 text-slate-500 text-[11px]">{plc.start_date} s/d {plc.end_date}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    plc.status === 'Bermasalah' ? 'bg-rose-50 text-rose-700' :
                                                    plc.status === 'Selesai' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-emerald-50 text-emerald-700'
                                                }`}>
                                                    {plc.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(plc)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingPlacement(plc)}
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors"
                                                        title="Batalkan Penempatan"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ================= MODAL TAMBAH PENEMPATAN ================= */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Penetapan Tempat PKL
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">Siswa: {selectedStudent.user?.name}</h3>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Perusahaan Mitra</label>
                            <select value={data.company_id} onChange={(e) => setData('company_id', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Guru Pembimbing Sekolah</label>
                            <select value={data.school_supervisor_id} onChange={(e) => setData('school_supervisor_id', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Pembimbing Lapangan Industri (DUDI)</label>
                            <select value={data.industry_supervisor_id} onChange={(e) => setData('industry_supervisor_id', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option value="">-- Pilih Jika Sudah Terdaftar --</option>
                                {industrySupervisors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                                <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                                <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={processing} className="px-5 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan Penempatan</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= MODAL EDIT PENEMPATAN ================= */}
            {editingPlacement && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Edit Penempatan Siswa
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{editingPlacement.student?.user?.name}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingPlacement(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Perusahaan Mitra</label>
                            <select value={editForm.data.company_id} onChange={(e) => editForm.setData('company_id', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Guru Pembimbing</label>
                                <select value={editForm.data.school_supervisor_id} onChange={(e) => editForm.setData('school_supervisor_id', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Status Penempatan</label>
                                <select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value as any)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Bermasalah">Bermasalah</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Pembimbing Industri (DUDI)</label>
                            <select value={editForm.data.industry_supervisor_id} onChange={(e) => editForm.setData('industry_supervisor_id', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option value="">-- Tidak Diatur --</option>
                                {industrySupervisors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                                <input type="date" value={editForm.data.start_date} onChange={(e) => editForm.setData('start_date', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                                <input type="date" value={editForm.data.end_date} onChange={(e) => editForm.setData('end_date', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setEditingPlacement(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700 flex items-center gap-1.5">
                                <Check className="w-4 h-4" /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= MODAL KONFIRMASI HAPUS / BATALKAN ================= */}
            {deletingPlacement && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-base">Batalkan Penempatan?</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Yakin ingin membatalkan penempatan untuk <strong className="text-slate-800">{deletingPlacement.student?.user?.name}</strong> di {deletingPlacement.company?.name}?
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 pt-2">
                            <button onClick={() => setDeletingPlacement(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                                Batal
                            </button>
                            <button onClick={handleDelete} className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-md">
                                Ya, Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

