import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Users, Plus, Trash2, Mail, Calendar, Edit3, X, Check, Search } from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props { users: UserItem[]; }

export default function UsersIndex({ users }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form Tambah
    const addForm = useForm({
        name: '', email: '', password: '',
    });

    // Form Edit
    const editForm = useForm({
        name: '', email: '', password: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/guru', { onSuccess: () => { setIsAddModalOpen(false); addForm.reset(); } });
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(`/admin/guru/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            }
        });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/admin/guru/${deleteId}`, { onSuccess: () => setDeleteId(null) });
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <Head title="Kelola Guru" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Kelola Guru Pembimbing</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Daftar akun guru pembimbing sekolah yang bertugas memantau siswa PKL.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-2 self-start shadow-sm">
                        <Plus className="w-4 h-4 text-emerald-400" /> Tambah Guru
                    </button>
                </div>

                {/* Filter Search */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari guru berdasarkan nama atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{filteredUsers.length} Guru</span>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-[14px] font-semibold text-slate-500">Tidak ada guru ditemukan.</p>
                        <p className="text-[12px] text-slate-400 mt-1">Klik "Tambah Guru" untuk menambahkan akun baru.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Terdaftar</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[12px] shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openEditModal(user)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors">
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button onClick={() => setDeleteId(user.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Guru Pembimbing</h3>
                                <p className="text-[12px] text-slate-500">Buat akun guru baru.</p>
                            </div>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                            <input type="text" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
                            <input type="email" value={addForm.data.email} onChange={(e) => addForm.setData('email', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
                            <input type="password" value={addForm.data.password} onChange={(e) => addForm.setData('password', e.target.value)} required minLength={6}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={addForm.processing} className="px-5 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan Akun</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Edit Akun Guru
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{editingUser.name}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                            <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
                            <input type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Password Baru (Opsional)</label>
                            <input type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Kosongkan jika tidak ingin ganti password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700 flex items-center gap-1.5">
                                <Check className="w-4 h-4" /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-base">Hapus Akun Guru?</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Akun guru ini akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 pt-2">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">Batal</button>
                            <button onClick={handleDelete} className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-md">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
