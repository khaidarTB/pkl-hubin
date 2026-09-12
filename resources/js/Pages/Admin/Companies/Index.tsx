import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Company } from '@/Types';
import { Building2, Plus, MapPin, Phone, Globe, Radar, Edit3, Trash2, X, Check, Search, Clock } from 'lucide-react';

interface Props { companies: Company[]; }

export default function CompaniesIndex({ companies }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

    // Form Tambah
    const addForm = useForm({
        name: '', address: '', city: '', phone: '', email: '', website: '',
        industry_type: 'Technology & Software', description: '', supervisor_name: '', student_quota: 10,
        latitude: '', longitude: '', allowed_radius: 100, jam_masuk: '', jam_keluar: '',
    });

    // Form Edit
    const editForm = useForm({
        name: '', address: '', city: '', phone: '', email: '', website: '',
        industry_type: '', description: '', supervisor_name: '', student_quota: 10,
        latitude: '' as string | number, longitude: '' as string | number, allowed_radius: 100,
        partnership_status: 'active', jam_masuk: '', jam_keluar: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/perusahaan', { onSuccess: () => { setIsAddModalOpen(false); addForm.reset(); } });
    };

    const openEditModal = (comp: Company) => {
        setEditingCompany(comp);
        editForm.setData({
            name: comp.name,
            address: comp.address,
            city: comp.city || '',
            phone: comp.phone || '',
            email: comp.email || '',
            website: comp.website || '',
            industry_type: comp.industry_type,
            description: comp.description || '',
            supervisor_name: comp.supervisor_name || '',
            student_quota: comp.student_quota || 10,
            latitude: comp.latitude ?? '',
            longitude: comp.longitude ?? '',
            allowed_radius: comp.allowed_radius || 100,
            jam_masuk: comp.jam_masuk || '',
            jam_keluar: comp.jam_keluar || '',
            partnership_status: comp.partnership_status || 'active',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCompany) return;
        editForm.put(`/admin/perusahaan/${editingCompany.id}`, {
            onSuccess: () => {
                setEditingCompany(null);
            }
        });
    };

    const handleDelete = () => {
        if (!deletingCompany) return;
        router.delete(`/admin/perusahaan/${deletingCompany.id}`, {
            onSuccess: () => setDeletingCompany(null),
        });
    };

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <Head title="Perusahaan Mitra" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Perusahaan Mitra (DU/DI)</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Daftar industri mitra PKL dengan konfigurasi kuota dan validasi geofence GPS.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-2 self-start shadow-sm">
                        <Plus className="w-4 h-4 text-emerald-400" /> Tambah Perusahaan
                    </button>
                </div>

                {/* Filter / Search bar */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari nama perusahaan, kategori, atau kota..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{filteredCompanies.length} Perusahaan</span>
                </div>

                {filteredCompanies.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="font-semibold text-slate-600 text-sm">Tidak ada perusahaan yang sesuai.</p>
                        <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Tambah Perusahaan" untuk menambahkan mitra baru.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCompanies.map((comp) => {
                            const filledCount = comp.placements_count || 0;
                            const quota = comp.student_quota || 10;
                            const percent = Math.min(100, Math.round((filledCount / quota) * 100));
                            return (
                                <div key={comp.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold">{comp.industry_type}</span>
                                                <h3 className="text-[15px] font-bold text-slate-900 mt-1">{comp.name}</h3>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${comp.partnership_status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {comp.partnership_status === 'active' ? 'Aktif' : comp.partnership_status}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-slate-500 line-clamp-2">{comp.description || 'Mitra industri PKL.'}</p>
                                        <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                                            <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{comp.address}</span></p>
                                            {comp.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400 shrink-0" /> {comp.phone}</p>}
                                            {comp.website && <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-slate-400 shrink-0" /> <a href={comp.website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline truncate">{comp.website}</a></p>}
                                            {comp.latitude != null && comp.longitude != null && (
                                                <p className="flex items-center gap-1.5">
                                                    <Radar className="w-3 h-3 text-cyan-500 shrink-0" />
                                                    <span className="font-semibold text-cyan-700">
                                                        GPS radius {comp.allowed_radius ?? 100} m
                                                    </span>
                                                </p>
                                            )}
                                            {(comp.jam_masuk || comp.jam_keluar) && (
                                                <p className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span>Jam kerja {comp.jam_masuk || '—'}–{comp.jam_keluar || '—'}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="pt-3 mt-3 border-t border-slate-100 space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500">Kuota Siswa</span>
                                                <span className="font-semibold text-slate-700">{filledCount}/{quota}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                                            </div>
                                        </div>

                                        {/* Aksi Edit & Hapus */}
                                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(comp)}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeletingCompany(comp)}
                                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                                                title="Hapus Perusahaan"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ================= MODAL TAMBAH PERUSAHAAN ================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Perusahaan Mitra</h3>
                                <p className="text-[12px] text-slate-500">Daftarkan industri mitra baru ke dalam sistem.</p>
                            </div>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                            <input type="text" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kategori Industri</label>
                                <input type="text" value={addForm.data.industry_type} onChange={(e) => addForm.setData('industry_type', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kuota Siswa</label>
                                <input type="number" value={addForm.data.student_quota} onChange={(e) => addForm.setData('student_quota', parseInt(e.target.value) || 1)} min={1} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Alamat Kantor/Pabrik</label>
                            <textarea value={addForm.data.address} onChange={(e) => addForm.setData('address', e.target.value)} rows={2} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Telepon</label>
                                <input type="text" value={addForm.data.phone} onChange={(e) => addForm.setData('phone', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Website</label>
                                <input type="text" value={addForm.data.website} onChange={(e) => addForm.setData('website', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>
                        <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-3">
                            <p className="text-[12px] font-bold text-cyan-800 flex items-center gap-1.5 mb-2">
                                <Radar className="w-4 h-4" /> Koordinat Geofencing Presensi GPS
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
                                    <input type="number" step="any" placeholder="-6.2088"
                                        value={addForm.data.latitude} onChange={(e) => addForm.setData('latitude', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
                                    <input type="number" step="any" placeholder="106.8456"
                                        value={addForm.data.longitude} onChange={(e) => addForm.setData('longitude', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Radius (m)</label>
                                    <input type="number" min={50} max={5000}
                                        value={addForm.data.allowed_radius} onChange={(e) => addForm.setData('allowed_radius', parseInt(e.target.value) || 100)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Masuk</label>
                                    <input type="time" value={addForm.data.jam_masuk} onChange={(e) => addForm.setData('jam_masuk', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Keluar</label>
                                    <input type="time" value={addForm.data.jam_keluar} onChange={(e) => addForm.setData('jam_keluar', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={addForm.processing} className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan Perusahaan</button>
                        </div>
                        <FormErrors errors={addForm.errors} />
                    </form>
                </div>
            )}

            {/* ================= MODAL EDIT PERUSAHAAN ================= */}
            {editingCompany && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                    Edit Perusahaan
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{editingCompany.name}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingCompany(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                            <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kategori Industri</label>
                                <input type="text" value={editForm.data.industry_type} onChange={(e) => editForm.setData('industry_type', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kuota Siswa</label>
                                <input type="number" value={editForm.data.student_quota} onChange={(e) => editForm.setData('student_quota', parseInt(e.target.value) || 1)} min={1} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Alamat</label>
                            <textarea value={editForm.data.address} onChange={(e) => editForm.setData('address', e.target.value)} rows={2} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Telepon</label>
                                <input type="text" value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Status Kemitraan</label>
                                <select value={editForm.data.partnership_status} onChange={(e) => editForm.setData('partnership_status', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-3">
                            <p className="text-[12px] font-bold text-cyan-800 flex items-center gap-1.5 mb-2">
                                <Radar className="w-4 h-4" /> Koordinat Lokasi & Radius Geofence
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
                                    <input type="number" step="any"
                                        value={editForm.data.latitude} onChange={(e) => editForm.setData('latitude', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
                                    <input type="number" step="any"
                                        value={editForm.data.longitude} onChange={(e) => editForm.setData('longitude', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Radius (m)</label>
                                    <input type="number" min={50} max={5000}
                                        value={editForm.data.allowed_radius} onChange={(e) => editForm.setData('allowed_radius', parseInt(e.target.value) || 100)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Masuk</label>
                                    <input type="time" value={editForm.data.jam_masuk} onChange={(e) => editForm.setData('jam_masuk', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Keluar</label>
                                    <input type="time" value={editForm.data.jam_keluar} onChange={(e) => editForm.setData('jam_keluar', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px]" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setEditingCompany(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700 flex items-center gap-1.5">
                                <Check className="w-4 h-4" /> Simpan Perubahan
                            </button>
                        </div>
                        <FormErrors errors={editForm.errors} />
                    </form>
                </div>
            )}

            {/* ================= MODAL KONFIRMASI HAPUS ================= */}
            {deletingCompany && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-base">Hapus Perusahaan?</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Anda yakin ingin menghapus data mitra <strong className="text-slate-800">{deletingCompany.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 pt-2">
                            <button onClick={() => setDeletingCompany(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200">
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

function FormErrors({ errors }: { errors: Record<string, string> }) {
    const entries = Object.entries(errors);
    if (entries.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
            {entries.map(([field, message]) => (
                <p key={field} className="text-[11px] font-semibold text-rose-700">
                    {message}
                </p>
            ))}
        </div>
    );
}

