import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Company, PklApplication as PklApplicationType, PklPeriod, Student } from '@/Types';
import { Building2, Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props { student: Student | null; companies: Company[]; activePeriod: PklPeriod | null; application: PklApplicationType | null; }

export default function PklApplication({ student, companies, activePeriod, application }: Props) {
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(application?.company_id || null);
    const { data, setData, post, processing, errors } = useForm({
        company_id: application?.company_id || '', company_name: application?.company_name || '',
        company_address: application?.company_address || '', field_of_work: application?.field_of_work || '',
        desired_position: application?.desired_position || '', cv_file: null as File | null, cover_letter_file: null as File | null,
    });

    const handleSelectCompany = (company: Company) => {
        setSelectedCompanyId(company.id);
        setData({ ...data, company_id: company.id.toString(), company_name: company.name, company_address: company.address, field_of_work: company.industry_type || 'Teknologi Informasi' });
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post('/pkl/pendaftaran'); };

    return (
        <DashboardLayout>
            <Head title="Pendaftaran PKL" />
            <div className="space-y-5">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10">
                        <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 mb-2">Formulir Pendaftaran PKL</span>
                        <h1 className="text-xl sm:text-2xl font-bold">Pendaftaran Praktik Kerja Lapangan</h1>
                        <p className="text-emerald-100 text-[13px] mt-1">Pilih perusahaan mitra atau ajukan mandiri. Lengkapi berkas untuk diverifikasi Hubin.</p>
                    </div>
                </div>

                {application?.status === 'revision' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-800 text-[13px]">Perlu Revisi</h4>
                            <p className="text-[12px] text-amber-700 mt-0.5">{application.revision_note}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-500" /> Perusahaan Tujuan</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                                {companies.map((comp) => (
                                    <button type="button" key={comp.id} onClick={() => handleSelectCompany(comp)}
                                        className={`p-3 rounded-xl border text-left transition-all text-[12px] flex items-center justify-between ${
                                            selectedCompanyId === comp.id ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}>
                                        <div className="truncate"><p className="font-semibold text-slate-900 truncate">{comp.name}</p><p className="text-[11px] text-slate-500">{comp.industry_type}</p></div>
                                        {selectedCompanyId === comp.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="block text-[12px] font-semibold text-slate-700 mb-1">Nama Perusahaan</label><input type="text" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" /></div>
                                <div><label className="block text-[12px] font-semibold text-slate-700 mb-1">Bidang Usaha</label><input type="text" value={data.field_of_work} onChange={(e) => setData('field_of_work', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" /></div>
                            </div>
                            <div><label className="block text-[12px] font-semibold text-slate-700 mb-1">Alamat</label><textarea value={data.company_address} onChange={(e) => setData('company_address', e.target.value)} rows={2} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" /></div>
                            <div><label className="block text-[12px] font-semibold text-slate-700 mb-1">Posisi Magang</label><input type="text" value={data.desired_position} onChange={(e) => setData('desired_position', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" /></div>
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><Upload className="w-4 h-4" /> Berkas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="border border-dashed border-slate-300 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                                        <FileText className="w-5 h-5 text-slate-400 mb-1.5" />
                                        <p className="text-[12px] font-semibold text-slate-900">CV</p>
                                        <p className="text-[11px] text-slate-500">PDF max 5MB</p>
                                        <input type="file" onChange={(e) => setData('cv_file', e.target.files ? e.target.files[0] : null)} className="mt-2 text-[11px] text-slate-500" />
                                    </div>
                                    <div className="border border-dashed border-slate-300 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                                        <FileText className="w-5 h-5 text-slate-400 mb-1.5" />
                                        <p className="text-[12px] font-semibold text-slate-900">Surat Pengantar</p>
                                        <p className="text-[11px] text-slate-500">PDF/DOCX max 5MB</p>
                                        <input type="file" onChange={(e) => setData('cover_letter_file', e.target.files ? e.target.files[0] : null)} className="mt-2 text-[11px] text-slate-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={processing} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-[12px] rounded-xl hover:bg-slate-800 flex items-center gap-1.5">
                                    Kirim Pengajuan <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                            <h4 className="text-[13px] font-bold text-slate-900 border-b border-slate-100 pb-2">Periode PKL</h4>
                            <div className="space-y-2 text-[12px]">
                                <div><p className="text-slate-500">Nama</p><p className="font-semibold text-slate-900">{activePeriod?.name || 'Semester Ganjil 2026/2027'}</p></div>
                                <div><p className="text-slate-500">Tahun Ajaran</p><p className="font-semibold text-slate-900">{activePeriod?.academic_year || '2026/2027'}</p></div>
                                <div><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">Pendaftaran Dibuka</span></div>
                            </div>
                        </div>
                        {application && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                                <h4 className="text-[13px] font-bold text-slate-900 border-b border-slate-100 pb-2">Pengajuan Terakhir</h4>
                                <div className="space-y-1.5 text-[12px]">
                                    <p className="text-slate-500">Perusahaan: <span className="font-semibold text-slate-900">{application.company_name}</span></p>
                                    <p className="text-slate-500">Posisi: <span className="font-semibold text-slate-900">{application.desired_position}</span></p>
                                    <p className="text-slate-500">Status: <span className="font-bold text-emerald-600 uppercase">{application.status}</span></p>
                                </div>
                                <Link href="/pkl/status" className="w-full py-2 bg-slate-100 text-slate-700 font-semibold text-[12px] rounded-xl flex items-center justify-center gap-1 hover:bg-slate-200 transition-colors">
                                    Lihat Timeline <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
