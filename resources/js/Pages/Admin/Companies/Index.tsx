import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Company } from '@/Types';
import { Building2, Plus, MapPin, Phone, Globe } from 'lucide-react';

interface Props { companies: Company[]; }

export default function CompaniesIndex({ companies }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '', address: '', city: '', phone: '', email: '', website: '',
        industry_type: 'Technology & Software', description: '', supervisor_name: '', student_quota: 10,
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/perusahaan', { onSuccess: () => { setIsAddModalOpen(false); reset(); } });
    };

    return (
        <DashboardLayout>
            <Head title="Perusahaan Mitra" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Perusahaan Mitra</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Daftar industri DU/DI mitra PKL.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-2 self-start">
                        <Plus className="w-4 h-4" /> Tambah Perusahaan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((comp) => {
                        const filledCount = comp.placements_count || 0;
                        const quota = comp.student_quota || 10;
                        const percent = Math.min(100, Math.round((filledCount / quota) * 100));
                        return (
                            <div key={comp.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold">{comp.industry_type}</span>
                                            <h3 className="text-[15px] font-bold text-slate-900 mt-1">{comp.name}</h3>
                                        </div>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold shrink-0">{comp.partnership_status}</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 line-clamp-2">{comp.description || 'Mitra industri PKL.'}</p>
                                    <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                                        <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{comp.address}</span></p>
                                        {comp.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400 shrink-0" /> {comp.phone}</p>}
                                        {comp.website && <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-slate-400 shrink-0" /> <a href={comp.website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline truncate">{comp.website}</a></p>}
                                    </div>
                                </div>
                                <div className="pt-3 mt-3 border-t border-slate-100 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">Kuota</span>
                                        <span className="font-semibold text-slate-700">{filledCount}/{quota}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Tambah Perusahaan Mitra</h3>
                            <p className="text-[12px] text-slate-500">Daftarkan industri mitra baru.</p>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kategori</label>
                                <input type="text" value={data.industry_type} onChange={(e) => setData('industry_type', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Kuota Siswa</label>
                                <input type="number" value={data.student_quota} onChange={(e) => setData('student_quota', parseInt(e.target.value) || 1)} min={1} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Alamat</label>
                            <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Telepon</label>
                                <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Website</label>
                                <input type="text" value={data.website} onChange={(e) => setData('website', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan</button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
