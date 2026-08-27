import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, Users, Building2, CalendarCheck, BookOpen, 
    GraduationCap, LineChart, FileSpreadsheet, Bell, Sparkles, 
    CheckSquare, MessageSquare, LogOut, FileText, MapPin, Calendar, QrCode,
    ChevronDown
} from 'lucide-react';
import { PageProps, Role } from '@/Types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const page = usePage<PageProps>();
    const url = page.url;
    const user = page.props?.auth?.user;
    const role: Role = user?.role || 'siswa';

    const getNavItems = () => {
        switch (role) {
            case 'admin':
                return [
                    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                    { label: 'Pengajuan PKL', href: '/admin/pengajuan', icon: FileText },
                    { label: 'Penempatan', href: '/admin/penempatan', icon: MapPin },
                    { label: 'Perusahaan', href: '/admin/perusahaan', icon: Building2 },
                    { label: 'Kelola Guru', href: '/admin/guru', icon: Users },
                    { label: 'Kunjungan', href: '/kunjungan', icon: Calendar },
                    { label: 'Dokumen', href: '/dokumen', icon: FileText },
                    { label: 'Verifikasi', href: '/admin/verifikasi-dokumen', icon: QrCode },
                    { label: 'Monitoring', href: '/monitoring', icon: LineChart },
                    { label: 'Absensi', href: '/absensi', icon: CalendarCheck },
                    { label: 'E-Jurnal', href: '/jurnal', icon: BookOpen },
                    { label: 'Penilaian', href: '/penilaian', icon: GraduationCap },
                    { label: 'NEXA AI', href: '/ai-assistant', icon: Sparkles },
                    { label: 'AI Insights', href: '/ai/insights', icon: LineChart },
                    { label: 'Laporan', href: '/laporan', icon: FileSpreadsheet },
                    { label: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
                    { label: 'Notifikasi', href: '/notifikasi', icon: Bell },
                ];
            case 'guru':
                return [
                    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                    { label: 'Siswa Bimbingan', href: '/monitoring', icon: Users },
                    { label: 'Kunjungan', href: '/kunjungan', icon: Calendar },
                    { label: 'Surat Tugas', href: '/dokumen', icon: FileText },
                    { label: 'Jurnal Siswa', href: '/jurnal', icon: BookOpen },
                    { label: 'Absensi', href: '/absensi', icon: CalendarCheck },
                    { label: 'Laporan', href: '/laporan', icon: FileSpreadsheet },
                    { label: 'NEXA AI', href: '/ai-assistant', icon: Sparkles },
                    { label: 'Notifikasi', href: '/notifikasi', icon: Bell },
                ];
            case 'industri':
                return [
                    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                    { label: 'Siswa PKL', href: '/monitoring', icon: Users },
                    { label: 'Approval Jurnal', href: '/jurnal', icon: CheckSquare },
                    { label: 'Penilaian', href: '/penilaian', icon: GraduationCap },
                    { label: 'Dokumen', href: '/dokumen', icon: FileText },
                    { label: 'NEXA AI', href: '/ai-assistant', icon: Sparkles },
                    { label: 'Notifikasi', href: '/notifikasi', icon: Bell },
                ];
            case 'siswa':
            default:
                return [
                    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                    { label: 'Daftar PKL', href: '/pkl/pendaftaran', icon: FileText },
                    { label: 'Status PKL', href: '/pkl/status', icon: MapPin },
                    { label: 'Absensi', href: '/absensi', icon: CalendarCheck },
                    { label: 'E-Jurnal', href: '/jurnal', icon: BookOpen },
                    { label: 'Penilaian', href: '/penilaian', icon: GraduationCap },
                    { label: 'Notifikasi', href: '/notifikasi', icon: Bell },
                    { label: 'NEXA AI', href: '/ai-assistant', icon: Sparkles },
                    { label: 'AI Insights', href: '/ai/insights', icon: LineChart },
                ];
        }
    };

    const navItems = getNavItems();

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
                    <div className="h-16 flex items-center px-5 border-b border-white/5">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-500/20">
                                P
                            </div>
                            <div>
                                <h1 className="font-bold text-[15px] text-white tracking-tight leading-none">PKLConnect</h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">Hubin Management</p>
                            </div>
                        </Link>
                    </div>

                    {/* Role Badge */}
                    <div className="px-5 py-3 border-b border-white/5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {roleLabel}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                        {navItems.map((item, idx) => {
                            const Icon = item.icon;
                            const isActive = url === item.href || (item.href !== '/dashboard' && url.startsWith(item.href));
                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                                        ${isActive 
                                            ? 'bg-emerald-500/15 text-emerald-400' 
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Info & Logout */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-200 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
