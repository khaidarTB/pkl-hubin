import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Proportions, Users, Building2, CalendarCheck, BookOpen, 
    GraduationCap, LineChart, FileSpreadsheet, Sparkles, 
    CheckSquare, LogOut, FileText, MapPin, Calendar, QrCode,
    Award, ListChecks, Settings2
} from 'lucide-react';
import { PageProps, Role } from '@/Types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
    title?: string;
    items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const page = usePage<PageProps>();
    const url = page.url;
    const user = page.props?.auth?.user;
    const role: Role = user?.role || 'siswa';

    const getNavGroups = (): NavGroup[] => {
        switch (role) {
            case 'admin':
                return [
                    {
                        title: 'UTAMA',
                        items: [
                            { label: 'Dashboard', href: '/dashboard', icon: Proportions },
                        ],
                    },
                    {
                        title: 'MANAJEMEN PKL',
                        items: [
                            { label: 'Pengajuan PKL', href: '/admin/pengajuan', icon: FileText },
                            { label: 'Penempatan Siswa', href: '/admin/penempatan', icon: MapPin },
                            { label: 'Perusahaan Mitra', href: '/admin/perusahaan', icon: Building2 },
                            { label: 'Kelola Guru', href: '/admin/guru', icon: Users },
                            { label: 'Kelola Siswa', href: '/admin/siswa', icon: GraduationCap },
                            { label: 'Periode PKL', href: '/admin/periode', icon: Calendar },
                        ],
                    },
                    {
                        title: 'MONITORING & AKTIVITAS',
                        items: [
                            { label: 'Monitoring Siswa', href: '/monitoring', icon: LineChart },
                            { label: 'Presensi & Geofence', href: '/absensi', icon: CalendarCheck },
                            { label: 'E-Jurnal Kegiatan', href: '/jurnal', icon: BookOpen },
                            { label: 'Kunjungan Guru', href: '/kunjungan', icon: CheckSquare },
                            { label: 'Pengaturan Presensi GPS', href: '/admin/pengaturan-absensi', icon: Settings2 },
                        ],
                    },
                    {
                        title: 'AKADEMIK & DOKUMEN',
                        items: [
                            { label: 'Penilaian Industri', href: '/penilaian', icon: Award },
                            { label: 'Aspek Nilai', href: '/admin/aspek-nilai', icon: ListChecks },
                            { label: 'Dokumen & Surat', href: '/dokumen', icon: FileText },
                            { label: 'Verifikasi QR Dokumen', href: '/admin/verifikasi-dokumen', icon: QrCode },
                            { label: 'Laporan Rekapitulasi', href: '/laporan', icon: FileSpreadsheet },
                        ],
                    },
                    {
                        title: 'ASISTEN CERDAS',
                        items: [
                            { label: 'NEXA AI Assistant', href: '/ai-assistant', icon: Sparkles },
                            { label: 'AI Risk Insights', href: '/ai/insights', icon: LineChart },
                        ],
                    },
                ];
            case 'guru':
                return [
                    {
                        title: 'UTAMA',
                        items: [
                            { label: 'Dashboard', href: '/dashboard', icon: Proportions },
                        ],
                    },
                    {
                        title: 'BIMBINGAN & MONITORING',
                        items: [
                            { label: 'Siswa Bimbingan', href: '/monitoring', icon: Users },
                            { label: 'Kunjungan Lapangan', href: '/kunjungan', icon: Calendar },
                            { label: 'Jurnal Siswa', href: '/jurnal', icon: BookOpen },
                            { label: 'Presensi Siswa', href: '/absensi', icon: CalendarCheck },
                        ],
                    },
                    {
                        title: 'DOKUMEN & LAPORAN',
                        items: [
                            { label: 'Surat Tugas Monitoring', href: '/dokumen', icon: FileText },
                            { label: 'Laporan Rekapitulasi', href: '/laporan', icon: FileSpreadsheet },
                            { label: 'NEXA AI Assistant', href: '/ai-assistant', icon: Sparkles },
                        ],
                    },
                ];
            case 'industri':
                return [
                    {
                        title: 'UTAMA',
                        items: [
                            { label: 'Dashboard', href: '/dashboard', icon: Proportions },
                        ],
                    },
                    {
                        title: 'SUPERVISI SISWA',
                        items: [
                            { label: 'Daftar Siswa PKL', href: '/monitoring', icon: Users },
                            { label: 'Approval E-Jurnal', href: '/jurnal', icon: CheckSquare },
                            { label: 'Penilaian Kinerja', href: '/penilaian', icon: Award },
                            { label: 'Dokumen Perusahaan', href: '/dokumen', icon: FileText },
                            { label: 'NEXA AI Assistant', href: '/ai-assistant', icon: Sparkles },
                        ],
                    },
                ];
            case 'siswa':
            default: {
                const application = page.props?.auth?.user?.student?.latestApplication;
                const isPklApproved = application?.status === 'approved';

                const programItems: NavItem[] = [
                    ...(isPklApproved ? [] : [{ label: 'Daftar PKL', href: '/pkl/pendaftaran', icon: FileText }]),
                    { label: 'Status Penempatan', href: '/pkl/status', icon: MapPin },
                    { label: 'Presensi Harian', href: '/absensi', icon: CalendarCheck },
                    { label: 'E-Jurnal Kegiatan', href: '/jurnal', icon: BookOpen },
                    { label: 'Nilai & Evaluasi', href: '/penilaian', icon: Award },
                ];

                return [
                    {
                        title: 'UTAMA',
                        items: [
                            { label: 'Dashboard', href: '/dashboard', icon: Proportions },
                        ],
                    },
                    {
                        title: 'PROGRAM PKL',
                        items: programItems,
                    },
                    {
                        title: 'ASISTEN AI',
                        items: [
                            { label: 'NEXA AI Assistant', href: '/ai-assistant', icon: Sparkles },
                            { label: 'AI Progress Insights', href: '/ai/insights', icon: LineChart },
                        ],
                    },
                ];
            }
        }
    };

    const navGroups = getNavGroups();

    const roleLabel = role === 'admin' ? 'Admin Hubin' 
        : role === 'guru' ? 'Guru Pembimbing' 
        : role === 'industri' ? 'Pembimbing Industri' 
        : 'Siswa PKL';

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-[260px] bg-slate-900 flex flex-col justify-between transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo & Brand */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm">
                                <img src="/img/pklconnect_logo.png" alt="pklconnect logo" />
                            </div>
                            <div>
                                <h1 className="font-bold text-[15px] text-white tracking-tight leading-none">PKLConnect</h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">SMK Monitoring Hubin</p>
                            </div>
                        </Link>
                    </div>

                    {/* Role Badge */}
                    <div className="px-5 py-2.5 border-b border-white/5 shrink-0">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{roleLabel}</span>
                        </div>
                    </div>

                    {/* Navigation with Categorized Groups */}
                    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
                        {navGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-1">
                                {group.title && (
                                    <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                        {group.title}
                                    </div>
                                )}
                                <div className="space-y-0.5">
                                    {group.items.map((item, idx) => {
                                        const Icon = item.icon;
                                        const isActive = url === item.href || (item.href !== '/dashboard' && url.startsWith(item.href));
                                        return (
                                            <Link
                                                key={idx}
                                                href={item.href}
                                                onClick={onClose}
                                                className={`
                                                    flex items-center gap-3 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all
                                                    ${isActive 
                                                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm' 
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                                    }
                                                `}
                                            >
                                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* User Info & Logout */}
                <div className="p-3 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-200 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
};
