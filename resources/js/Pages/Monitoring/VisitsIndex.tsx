import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { Company, Student, Visit, User, PageProps } from '@/Types';
import { 
    Calendar, 
    Plus, 
    CheckCircle2, 
    Clock, 
    Building2, 
    FileText, 
    QrCode, 
    MapPin, 
    UserCheck, 
    GraduationCap, 
    Search, 
    Filter, 
    Send, 
    Mail, 
    MessageSquare, 
    Sparkles, 
    Phone, 
    AlertCircle, 
    ChevronRight,
    Briefcase
} from 'lucide-react';

interface Props { 
    visits: Visit[]; 
    myStudents: Student[]; 
    companies: Company[];
    teachers?: User[];
}

export default function VisitsIndex({ visits, myStudents, companies, teachers = [] }: Props) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedVisitForReport, setSelectedVisitForReport] = useState<Visit | null>(null);

    // Initial student selection
    const defaultStudentId = myStudents[0]?.id ? myStudents[0].id.toString() : '';
    const defaultTeacherId = currentUser?.id ? currentUser.id.toString() : (teachers[0]?.id?.toString() || '');

    // Correct Inertia useForm usage
    const scheduleForm = useForm({
        student_id: defaultStudentId,
        teacher_id: defaultTeacherId,
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: '09:00 WIB',
        purpose: 'Kunjungan Monitoring Rutin PKL',
        notes: '',
    });

    const reportForm = useForm({
        student_condition: 'Baik, proaktif, dan beradaptasi sangat cepat dengan tim industri.',
        attendance_status: 'Hadir 100% (Kedisiplinan sangat baik)',
        progress_notes: 'Pekerjaan proyek yang diberikan selesai tepat waktu sesuai spesifikasi.',
        obstacles: 'Tidak ada kendala berarti. Penyesuaian awal pada alur kerja perusahaan.',
        industry_feedback: 'Pembimbing Lapangan PT memberikan apresiasi positif atas keahlian siswa.',
        recommendations: 'Pertahankan kinerja dan tingkatkan komunikasi proaktif di lingkungan kerja.',
    });

    // Currently selected student in schedule modal to auto-fill PT and address preview
    const selectedStudentId = scheduleForm.data.student_id;
    const selectedStudent = myStudents.find(s => s.id.toString() === selectedStudentId);
    const selectedStudentCompany = selectedStudent?.placement?.company || companies.find(c => c.id === selectedStudent?.placement?.company_id) || companies[0];

    // Calculated metrics
    const totalVisits = visits.length;
    const scheduledVisits = visits.filter(v => v.status === 'scheduled').length;
    const completedVisits = visits.filter(v => v.status === 'completed').length;
    const uniqueCompanies = new Set(visits.map(v => v.company_id || v.company?.id)).size;

    // Filtered visits
    const filteredVisits = visits.filter((visit) => {
        const matchesStatus = 
            statusFilter === 'all' ? true :
            statusFilter === 'scheduled' ? visit.status === 'scheduled' :
            visit.status === 'completed';

        const teacherName = visit.teacher?.name || '';
        const studentName = visit.student?.user?.name || '';
        const companyName = visit.company?.name || '';
        const companyAddress = visit.company?.address || '';

        const search = searchTerm.toLowerCase();
        const matchesSearch = 
            studentName.toLowerCase().includes(search) ||
            companyName.toLowerCase().includes(search) ||
            teacherName.toLowerCase().includes(search) ||
            companyAddress.toLowerCase().includes(search);

        return matchesStatus && matchesSearch;
    });

    const handleQuickPurpose = (purposeText: string) => {
        scheduleForm.setData('purpose', purposeText);
    };

    return (
        <DashboardLayout>
            <Head title="Kunjungan Monitoring PKL - SMK Taruna Bangsa" />
            
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Top Banner & Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
                    <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6 pointer-events-none">
                        <Building2 className="w-96 h-96 text-emerald-400" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>SMK Taruna Bangsa — Monitoring PKL System</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    Jadwal & Laporan Kunjungan Guru
                                </h1>
                                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                    Kelola jadwal penugasan guru pembimbing, pantau alamat & kondisi tempat PKL siswa, serta kirimkan **notifikasi otomatis via Web, Email & WhatsApp**.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsScheduleModalOpen(true)}
                                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>Buat Jadwal Kunjungan Baru</span>
                            </button>
                        </div>

                        {/* Multi-Channel Notification Integration Status Badge */}
                        <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-700/60 text-xs text-slate-300">
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5" /> Multi-Channel Dispatch Active:
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                                <Sparkles className="w-3 h-3 text-amber-400" /> In-App Web
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                                <Mail className="w-3 h-3 text-sky-400" /> Direct Email Guru
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                                <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp Gateway
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                            <Calendar className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Kunjungan</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalVisits}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Terjadwal</p>
                            <h3 className="text-2xl font-bold text-amber-600">{scheduledVisits}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Selesai (Dilaporkan)</p>
                            <h3 className="text-2xl font-bold text-emerald-600">{completedVisits}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PT / Industri Terjangkau</p>
                            <h3 className="text-2xl font-bold text-indigo-600">{uniqueCompanies}</h3>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari siswa, guru, PT, atau alamat..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" /> Status:
                        </span>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusFilter === 'all' 
                                    ? 'bg-slate-900 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua ({totalVisits})
                        </button>
                        <button
                            onClick={() => setStatusFilter('scheduled')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusFilter === 'scheduled' 
                                    ? 'bg-amber-500 text-white shadow-sm' 
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                            Terjadwal ({scheduledVisits})
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusFilter === 'completed' 
                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Selesai ({completedVisits})
                        </button>
                    </div>
                </div>

                {/* Visits Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredVisits.map((visit) => {
                        const isCompleted = visit.status === 'completed';
                        const studentUser = visit.student?.user;
                        const teacherUser = visit.teacher;
                        const company = visit.company || visit.placement?.company;

                        return (
                            <div 
                                key={visit.id} 
                                className={`bg-white rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md space-y-4 relative flex flex-col justify-between ${
                                    isCompleted ? 'border-emerald-200/80 bg-gradient-to-b from-white via-white to-emerald-50/20' : 'border-slate-200/80'
                                }`}
                            >
                                <div className="space-y-4">
                                    {/* Top Status & Date Header */}
                                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                                                isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {visit.visit_date}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400" /> {visit.visit_time || '09:00 WIB'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                    Tujuan: <span className="text-slate-700 font-semibold">{visit.purpose}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                        }`}>
                                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {isCompleted ? 'Selesai' : 'Terjadwal'}
                                        </span>
                                    </div>

                                    {/* Detailed Details: Guru, Siswa, & PT Location */}
                                    <div className="grid grid-cols-1 gap-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-xs">
                                        {/* Guru Pembimbing */}
                                        <div className="flex items-start gap-2.5">
                                            <UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guru Pembimbing Visiting</p>
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {teacherUser?.name || 'Guru Pembimbing SMK Taruna Bangsa'}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    Email: {teacherUser?.email || 'guru@smktarunabangsa.sch.id'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Siswa PKL */}
                                        <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
                                            <GraduationCap className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Siswa Terkait</p>
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {studentUser?.name || 'Siswa PKL'} 
                                                    {visit.student?.class ? <span className="font-medium text-slate-500"> ({visit.student.class})</span> : null}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    NIS: {visit.student?.nis || '-'} | Jurusan: {visit.student?.major || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Perusahaan & Alamat PT */}
                                        <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
                                            <MapPin className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan & Alamat PT</p>
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {company?.name || 'Perusahaan Mitra PKL'}
                                                </p>
                                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                                                    📍 {company?.address || 'Alamat Perusahaan Industri'} {company?.city ? `, ${company.city}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Laporan Kunjungan Summary if Completed */}
                                    {visit.report && (
                                        <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                <span>Laporan Monitoring Terverifikasi:</span>
                                            </div>
                                            <p className="text-emerald-900 text-[11px] font-medium leading-relaxed pl-5">
                                                <strong>Kondisi Siswa:</strong> {visit.report.student_condition}
                                            </p>
                                            <p className="text-emerald-800 text-[11px] font-medium pl-5">
                                                <strong>Feedback Industri:</strong> {visit.report.industry_feedback || 'Sangat baik'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 text-xs mt-2">
                                    <div className="flex items-center gap-2">
                                        {visit.document ? (
                                            <Link 
                                                href={`/dokumen/${visit.document.id}`} 
                                                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-semibold flex items-center gap-1.5 transition-colors"
                                            >
                                                <QrCode className="w-3.5 h-3.5" />
                                                <span>Surat Tugas QR</span>
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5" /> Belum terbit surat
                                            </span>
                                        )}
                                    </div>

                                    {!isCompleted && (
                                        <button 
                                            onClick={() => setSelectedVisitForReport(visit)}
                                            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl shadow-sm text-xs flex items-center gap-1.5 transition-all"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Isi Laporan Kunjungan</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredVisits.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Tidak ada jadwal kunjungan ditemukan</h3>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto">
                            Coba ubah kata kunci pencarian atau buat jadwal kunjungan monitoring PKL baru untuk guru pembimbing.
                        </p>
                        <button
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 shadow-md"
                        >
                            <Plus className="w-4 h-4" /> Buat Jadwal Kunjungan Baru
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL: Jadwal Kunjungan Baru */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] uppercase rounded-full tracking-wider">
                                    SMK Taruna Bangsa
                                </span>
                                <button 
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className="text-slate-400 hover:text-white text-sm font-bold p-1"
                                >
                                    ✕
                                </button>
                            </div>
                            <h3 className="text-lg font-extrabold text-white">Buat Jadwal Kunjungan Baru</h3>
                            <p className="text-xs text-slate-300">
                                Surat Tugas ber-QR Code & Notifikasi (Web, Email, WhatsApp) akan terkirim otomatis.
                            </p>
                        </div>

                        {/* Form */}
                        <form 
                            onSubmit={(e) => { 
                                e.preventDefault(); 
                                scheduleForm.post('/kunjungan', { 
                                    onSuccess: () => { 
                                        setIsScheduleModalOpen(false); 
                                        scheduleForm.reset(); 
                                    } 
                                }); 
                            }}
                            className="p-6 space-y-4 text-xs"
                        >
                            {/* Siswa Selector */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pilih Siswa PKL <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    value={scheduleForm.data.student_id} 
                                    onChange={(e) => scheduleForm.setData('student_id', e.target.value)} 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    {myStudents.map((std) => (
                                        <option key={std.id} value={std.id}>
                                            {std.user?.name || 'Siswa'} — {std.class} ({std.major || 'PKL'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Auto-filled PT and Address Preview */}
                            {selectedStudentCompany && (
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                            <Building2 className="w-3.5 h-3.5" /> Lokasi PT Tujuan Kunjungan:
                                        </span>
                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Auto-Detect</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-xs">{selectedStudentCompany.name}</p>
                                    <p className="text-slate-600 text-[11px] flex items-start gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                                        <span>{selectedStudentCompany.address || 'Alamat industri terdaftar'}</span>
                                    </p>
                                </div>
                            )}

                            {/* Guru Pembimbing (If user is Admin or teachers available) */}
                            {teachers.length > 0 && (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Guru Pembimbing yang Bertugas <span className="text-rose-500">*</span>
                                    </label>
                                    <select 
                                        value={scheduleForm.data.teacher_id} 
                                        onChange={(e) => scheduleForm.setData('teacher_id', e.target.value)} 
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Tanggal Kunjungan <span className="text-rose-500">*</span></label>
                                    <input 
                                        type="date" 
                                        value={scheduleForm.data.visit_date} 
                                        onChange={(e) => scheduleForm.setData('visit_date', e.target.value)} 
                                        required 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Waktu / Jam</label>
                                    <input 
                                        type="text" 
                                        value={scheduleForm.data.visit_time} 
                                        onChange={(e) => scheduleForm.setData('visit_time', e.target.value)} 
                                        placeholder="09:00 WIB"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    />
                                </div>
                            </div>

                            {/* Purpose + Presets */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="font-bold text-slate-700">Tujuan Kunjungan <span className="text-rose-500">*</span></label>
                                    <span className="text-[10px] text-slate-400 font-semibold">Pilih Preset Cepat:</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuickPurpose('Monitoring Rutin & Evaluasi Pembimbing Industri')}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                                    >
                                        + Monitoring Rutin
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuickPurpose('Evaluasi Akhir Penilaian Praktik PKL')}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                                    >
                                        + Evaluasi Akhir
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuickPurpose('Penyelesaian Kendala & Pendampingan Siswa')}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                                    >
                                        + Pendampingan Special
                                    </button>
                                </div>

                                <textarea 
                                    value={scheduleForm.data.purpose} 
                                    onChange={(e) => scheduleForm.setData('purpose', e.target.value)} 
                                    rows={2} 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                />
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                                <input 
                                    type="text" 
                                    value={scheduleForm.data.notes} 
                                    onChange={(e) => scheduleForm.setData('notes', e.target.value)} 
                                    placeholder="Contoh: Bertemu Bpk Haryanto (Manager HRD)"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                />
                            </div>

                            {/* Multi-channel notice */}
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Notifikasi Instan Multi-Channel:</span> Guru pembimbing akan langsung menerima notifikasi di aplikasi web, **email konfirmasi**, dan pesan **WhatsApp Gateway** berisi rincian jadwal & Surat Tugas.
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsScheduleModalOpen(false)} 
                                    className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={scheduleForm.processing} 
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{scheduleForm.processing ? 'Menyimpan...' : 'Simpan & Kirim Notifikasi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Laporan Hasil Kunjungan */}
            {selectedVisitForReport && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-6 text-white space-y-1">
                            <h3 className="text-base font-extrabold text-white">Laporan hasil Kunjungan Monitoring</h3>
                            <p className="text-xs text-slate-300">
                                Siswa: <span className="font-bold text-emerald-400">{selectedVisitForReport.student?.user?.name}</span> ({selectedVisitForReport.company?.name})
                            </p>
                        </div>

                        <form 
                            onSubmit={(e) => { 
                                e.preventDefault(); 
                                if (!selectedVisitForReport) return; 
                                reportForm.post(`/kunjungan/${selectedVisitForReport.id}/laporan`, { 
                                    onSuccess: () => { 
                                        setSelectedVisitForReport(null); 
                                        reportForm.reset(); 
                                    } 
                                }); 
                            }}
                            className="p-6 space-y-4 text-xs"
                        >
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Kondisi & Sikap Siswa <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={reportForm.data.student_condition} 
                                    onChange={(e) => reportForm.setData('student_condition', e.target.value)} 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Status Kedisiplinan & Presensi <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={reportForm.data.attendance_status} 
                                    onChange={(e) => reportForm.setData('attendance_status', e.target.value)} 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Progres Pekerjaan Proyek <span className="text-rose-500">*</span></label>
                                <textarea 
                                    value={reportForm.data.progress_notes} 
                                    onChange={(e) => reportForm.setData('progress_notes', e.target.value)} 
                                    rows={2} 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Kendala yang Dihadapi (Jika Ada)</label>
                                <input 
                                    type="text" 
                                    value={reportForm.data.obstacles} 
                                    onChange={(e) => reportForm.setData('obstacles', e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Feedback Pembimbing Industri</label>
                                <textarea 
                                    value={reportForm.data.industry_feedback} 
                                    onChange={(e) => reportForm.setData('industry_feedback', e.target.value)} 
                                    rows={2} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedVisitForReport(null)} 
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={reportForm.processing} 
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                                >
                                    {reportForm.processing ? 'Simpan...' : 'Simpan Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
