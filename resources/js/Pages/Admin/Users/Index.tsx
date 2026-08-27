import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Users, Plus, Trash2, Mail, Calendar } from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props { users: UserItem[]; }

export default function UsersIndex({ users }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/guru', { onSuccess: () => { setIsAddModalOpen(false); reset(); } });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/admin/guru/${deleteId}`, { onSuccess: () => setDeleteId(null) });
    };

    return (
        <DashboardLayout>
            <Head title="Kelola Guru" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Kelola Guru</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Daftar akun guru pembimbing yang terdaftar.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-2 self-start">
                        <Plus className="w-4 h-4" /> Tambah Guru
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-[14px] font-semibold text-slate-500">Belum ada guru terdaftar.</p>
                        <p className="text-[12px] text-slate-400 mt-1">Klik "Tambah Guru" untuk menambahkan akun baru.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
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
                                    {users.map((user) => (
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
                                                <button onClick={() => setDeleteId(user.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Tambah Guru Pembimbing</h3>
                            <p className="text-[12px] text-slate-500">Buat akun guru baru.</p>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required
                                placeholder="Masukkan nama guru"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required
                                placeholder="guru@email.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Password</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required
                                placeholder="Min. 6 karakter"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => { setIsAddModalOpen(false); reset(); }}
                                className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={processing}
                                className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800 disabled:opacity-50">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                                <Trash2 className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Hapus Guru?</h3>
                            <p className="text-[12px] text-slate-500 mt-1">Akun guru ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button onClick={handleDelete}
                                className="px-4 py-2 bg-rose-600 text-white font-bold text-[12px] rounded-xl hover:bg-rose-700">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
