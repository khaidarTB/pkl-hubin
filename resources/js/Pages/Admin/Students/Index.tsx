import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { GraduationCap, Plus, Search, Edit3, Trash2, Eye, X, Check, Phone, Mail, Building2 } from 'lucide-react';

interface StudentItem {
    id: number;
    user_id: number;
    name: string;
    email: string;
    nis: string;
    class: string;
    major: string;
    phone: string;
    company: string;
    placement_status: string;
    created_at: string;
}

interface Props {
    students: StudentItem[];
}

export default function StudentsIndex({ students }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<StudentItem | null>(null);
    const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(null);

    // Form Tambah Siswa
    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        nis: '',
        class: 'XII RPL 1',
        major: 'Rekayasa Perangkat Lunak',
        phone: '',
    });

    // Form Edit Siswa
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        nis: '',
        class: '',
        major: '',
        phone: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/siswa', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            }
        });
    };

    const openEditModal = (std: StudentItem) => {
        setEditingStudent(std);
        editForm.setData({
            name: std.name,
            email: std.email,
            password: '',
            nis: std.nis,
            class: std.class,
            major: std.major,
            phone: std.phone === '-' ? '' : std.phone,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        editForm.put(`/admin/siswa/${editingStudent.id}`, {
            onSuccess: () => setEditingStudent(null),
        });
    };

    const handleDelete = () => {
        if (!deletingStudent) return;
        router.delete(`/admin/siswa/${deletingStudent.id}`, {
            onSuccess: () => setDeletingStudent(null),
        });
    };

    const classList = Array.from(new Set(students.map(s => s.class))).filter(Boolean);

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.nis.includes(searchTerm) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' || s.class === filterClass;
        return matchesSearch && matchesClass;
    });

    return (
        <DashboardLayout>
            <Head title="Kelola Siswa PKL" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Kelola Data Siswa PKL</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Master data siswa, nomor induk (NIS), kelas, dan penempatan industri.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-2 self-start shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Tambah Siswa</span>
                    </button>
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari nama, NIS, atau jurusan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="all">Semua Kelas</option>
                            {classList.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <span className="text-xs text-slate-500 font-semibold shrink-0">{filteredStudents.length} Siswa</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                <tr>
                                    <th className="p-4">NIS & Siswa</th>
                                    <th className="p-4">Kelas & Jurusan</th>
                                    <th className="p-4">Kontak Siswa</th>
                                    <th className="p-4">Tempat PKL</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            Tidak ada data siswa yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((std) => (
                                        <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900">{std.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">NIS: {std.nis}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800">{std.class}</p>
                                                <p className="text-[10px] text-slate-500">{std.major}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-slate-600 truncate">{std.email}</p>
                                                <p className="text-[10px] text-slate-400">{std.phone}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800">{std.company}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    std.placement_status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' :
                                                    std.placement_status === 'Bermasalah' ? 'bg-rose-50 text-rose-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {std.placement_status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedDetail(std)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>Detail</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(std)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingStudent(std)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Hapus Siswa"
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

            {/* ================= MODAL TAMBAH SISWA ================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Siswa Baru</h3>
                                <p className="text-[12px] text-slate-500">Daftarkan akun dan data induk siswa.</p>
                            </div>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
                                <input type="text" value={addForm.data.nis} onChange={(e) => addForm.setData('nis', e.target.value)} required
                                    placeholder="2026101" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} required
                                    placeholder="Nama siswa" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kelas</label>
                                <input type="text" value={addForm.data.class} onChange={(e) => addForm.setData('class', e.target.value)} required
                                    placeholder="XII RPL 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kompetensi Keahlian (Jurusan)</label>
                                <input type="text" value={addForm.data.major} onChange={(e) => addForm.setData('major', e.target.value)} required
                                    placeholder="Rekayasa Perangkat Lunak" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
                                <input type="email" value={addForm.data.email} onChange={(e) => addForm.setData('email', e.target.value)} required
                                    placeholder="siswa@sekolah.sch.id" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                                <input type="text" value={addForm.data.phone} onChange={(e) => addForm.setData('phone', e.target.value)}
                                    placeholder="081234567890" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kata Sandi Awal</label>
                            <input type="password" value={addForm.data.password} onChange={(e) => addForm.setData('password', e.target.value)} required minLength={6}
                                placeholder="Min. 6 karakter" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={addForm.processing} className="px-5 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan Siswa</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= MODAL EDIT SISWA ================= */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Edit Data Siswa
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{editingStudent.name}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">NIS</label>
                                <input type="text" value={editForm.data.nis} onChange={(e) => editForm.setData('nis', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kelas</label>
                                <input type="text" value={editForm.data.class} onChange={(e) => editForm.setData('class', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Jurusan</label>
                                <input type="text" value={editForm.data.major} onChange={(e) => editForm.setData('major', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
                                <input type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                                <input type="text" value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Password Baru (Opsional)</label>
                            <input type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Kosongkan jika tidak ingin mengubah password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700 flex items-center gap-1.5">
                                <Check className="w-4 h-4" /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= MODAL DETAIL SISWA ================= */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Biodata Siswa
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedDetail.name}</h3>
                            </div>
                            <button onClick={() => setSelectedDetail(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2.5 text-xs p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-slate-500">NIS:</span>
                                <span className="font-semibold text-slate-800">{selectedDetail.nis}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kelas:</span>
                                <span className="font-semibold text-slate-800">{selectedDetail.class}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jurusan:</span>
                                <span className="font-semibold text-slate-800">{selectedDetail.major}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Email:</span>
                                <span className="font-semibold text-slate-800">{selectedDetail.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">No. WhatsApp:</span>
                                <span className="font-semibold text-slate-800">{selectedDetail.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tempat PKL:</span>
                                <span className="font-bold text-slate-900">{selectedDetail.company}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status Penempatan:</span>
                                <span className="font-semibold text-emerald-700">{selectedDetail.placement_status}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
                            <button onClick={() => setSelectedDetail(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl">
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    const s = selectedDetail;
                                    setSelectedDetail(null);
                                    openEditModal(s);
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Siswa</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL KONFIRMASI HAPUS ================= */}
            {deletingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-base">Hapus Data Siswa?</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Data akun & berkas siswa <strong className="text-slate-800">{deletingStudent.name}</strong> akan dihapus.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 pt-2">
                            <button onClick={() => setDeletingStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
                                Batal
                            </button>
                            <button onClick={handleDelete} className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-md">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
