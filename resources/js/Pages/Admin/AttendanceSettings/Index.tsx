import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Save, SatelliteDish, Info, ShieldAlert, Check } from 'lucide-react';

interface Props {
    settings: { max_gps_accuracy: number };
    envDefault: number;
}

export default function AttendanceSettingsIndex({ settings, envDefault }: Props) {
    const form = useForm({
        max_gps_accuracy: settings.max_gps_accuracy,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/admin/pengaturan-absensi', {
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Pengaturan Presensi GPS" />

            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Pengaturan Presensi GPS</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                        Konfigurasi global yang dipakai seluruh siswa saat absensi (check-in & check-out) berbasis GPS.
                    </p>
                </div>

                <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-cyan-800 leading-relaxed">
                        Akurasi GPS adalah tingkat ketelitian posisi perangkat siswa (nilai <code className="font-bold">accuracy</code>
                        &nbsp;dari satelit, dari 0 hingga ribuan meter). Nilai ini tidak bisa dikontrol sekolah — yang bisa diatur
                        hanyalah <strong>batas toleransi</strong> di bawah ini. Cadangan dari file konfigurasi server:&nbsp;
                        <strong>{envDefault} m</strong>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                                <SatelliteDish className="w-4 h-4 text-cyan-600" /> Batas Akurasi GPS (Global)
                            </h3>
                            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                                Absensi ditolak bila akurasi GPS siswa lebih buruk dari batas ini.
                                <br />
                                <span className="text-slate-400">Contoh: 50 m (ketat) · 200 m (standar) · 1000 m (longgar untuk uji coba).</span>
                            </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase shrink-0">
                            Berlaku untuk semua perusahaan
                        </span>
                    </div>

                    <div className="mt-6">
                        <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Maksimal Akurasi (meter)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min={10}
                                max={5000}
                                step={10}
                                value={form.data.max_gps_accuracy}
                                onChange={(e) => form.setData('max_gps_accuracy', parseInt(e.target.value) || 50)}
                                className="w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <span className="text-[12px] font-semibold text-slate-400">meter</span>
                        </div>
                        {form.errors.max_gps_accuracy && (
                            <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> {form.errors.max_gps_accuracy}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-400 font-semibold">
                            Nilai saat ini: <span className="text-slate-700 font-bold">{form.data.max_gps_accuracy} m</span>
                        </p>
                        <button
                            type="submit"
                            disabled={form.processing || form.data.max_gps_accuracy === settings.max_gps_accuracy}
                            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 shadow-sm"
                        >
                            {form.processing ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Simpan Pengaturan
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-4 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-800 leading-relaxed">
                        <strong>Catatan:</strong> selain akurasi GPS, siswa juga harus berada di dalam <strong>radius lokasi</strong>{' '}
                        perusahaan (diatur per perusahaan pada menu <em>Perusahaan Mitra → Edit</em> → field <em>Radius (m)</em>).
                        Keduanya harus terpenuhi agar absensi diterima.
                    </p>
                </div>

                {form.recentlySuccessful && (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[12px] font-semibold text-emerald-800">
                            Pengaturan tersimpan. Nilai terbaru langsung dipakai oleh validasi server untuk absensi berikutnya.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}