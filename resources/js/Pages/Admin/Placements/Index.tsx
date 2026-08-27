import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Company, PklPeriod, Placement, Student, User } from '@/Types';
import { MapPin, Users, Building2, CheckCircle2, Plus } from 'lucide-react';

interface Props {
    unplacedStudents: Student[];
    activePlacements: Placement[];
    companies: Company[];
    teachers: User[];
    industrySupervisors: User[];
    activePeriod: PklPeriod | null;
}

export default function PlacementsIndex({ unplacedStudents, activePlacements, companies, teachers, industrySupervisors, activePeriod }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const { data, setData, post, processing, reset } = useForm({
        student_id: '', company_id: '', school_supervisor_id: '', industry_supervisor_id: '',
        start_date: activePeriod?.start_date || '2026-08-01', end_date: activePeriod?.end_date || '2026-11-30',
    });

    const openPlaceModal = (std: Student) => {
        setSelectedStudent(std);
        setData({
            student_id: std.id.toString(),
            company_id: std.latestApplication?.company_id ? std.latestApplication.company_id.toString() : (companies[0]?.id.toString() || ''),
            school_supervisor_id: teachers[0]?.id.toString() || '',
            industry_supervisor_id: industrySupervisors[0]?.id.toString() || '',
            start_date: activePeriod?.start_date || '2026-08-01', end_date: activePeriod?.end_date || '2026-11-30',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/penempatan', { onSuccess: () => { setIsModalOpen(false); reset(); } });
    };

    return (
        <DashboardLayout>
            <Head title="Penempatan Siswa" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Penempatan Siswa</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">Tempatkan siswa ke perusahaan mitra beserta pembimbing.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600"><Users className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500">Belum Ditempatkan</p>
                            <p className="text-lg font-bold text-slate-900">{unplacedStudents.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500">Penempatan Aktif</p>
                            <p className="text-lg font-bold text-slate-900">{activePlacements.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600"><Building2 className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500">Perusahaan Mitra</p>
                            <p className="text-lg font-bold text-slate-900">{companies.length}</p>
                        </div>
                    </div>
                </div>

                {unplacedStudents.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                        <div>
                            <h3 className="text-[14px] font-bold text-slate-900">Siswa Siap Penempatan</h3>
                            <p className="text-[12px] text-slate-500 mt-0.5">Pengajuan disetujui, menunggu penetapan tempat.</p>
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
                                        className="w-full py-2 bg-slate-900 text-white font-semibold text-[12px] rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" /> Tempatkan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-[14px] font-bold text-slate-900">Daftar Penempatan Aktif</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3">Siswa</th>
                                    <th className="px-5 py-3">Perusahaan</th>
                                    <th className="px-5 py-3">Guru</th>
                                    <th className="px-5 py-3">Industri</th>
                                    <th className="px-5 py-3">Durasi</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activePlacements.map((plc) => (
                                    <tr key={plc.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-slate-900">{plc.student?.user?.name || 'Siswa'}</p>
                                            <p className="text-[10px] text-slate-400">{plc.student?.class}</p>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-slate-700">{plc.company?.name || '-'}</td>
                                        <td className="px-5 py-3 text-slate-600">{plc.schoolSupervisor?.name || '-'}</td>
                                        <td className="px-5 py-3 text-slate-600">{plc.industrySupervisor?.name || '-'}</td>
                                        <td className="px-5 py-3 text-slate-500">{plc.start_date} s/d {plc.end_date}</td>
                                        <td className="px-5 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">{plc.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Penetapan Penempatan</h3>
                            <p className="text-[12px] text-slate-500 mt-0.5">Siswa: <span className="font-semibold text-emerald-600">{selectedStudent.user?.name}</span></p>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Perusahaan</label>
                            <select value={data.company_id} onChange={(e) => setData('company_id', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Guru Pembimbing</label>
                            <select value={data.school_supervisor_id} onChange={(e) => setData('school_supervisor_id', e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Pembimbing Industri</label>
                            <select value={data.industry_supervisor_id} onChange={(e) => setData('industry_supervisor_id', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option value="">-- Pilih --</option>
                                {industrySupervisors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Mulai</label>
                                <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Selesai</label>
                                <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-[12px] rounded-xl hover:bg-slate-200">Batal</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800">Simpan</button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
