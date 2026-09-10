import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Bell, Sparkles, ChevronDown } from 'lucide-react';
import { PageProps } from '@/Types';

interface HeaderProps {
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const { props } = usePage<PageProps & { userNotifications?: any[]; unreadNotificationCount?: number }>();
    const auth = props?.auth;
    const user = auth?.user;
    const notifications = props?.userNotifications || [];
    const unreadCount = props?.unreadNotificationCount || 0;
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-8 flex items-center justify-between">
            {/* Left: Mobile Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    SMK Taruna Bangsa
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* AI Quick Link */}
                <Link
                    href="/ai/insights"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NEXA AI</span>
                </Link>

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-slate-900">Notifikasi</h4>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-full">
                                            {unreadCount} baru
                                        </span>
                                    )}
                                </div>
                                <Link href="/notifikasi" className="text-[11px] font-semibold text-emerald-600 hover:underline">Lihat Semua</Link>
                            </div>
                            
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {notifications.length > 0 ? (
                                    notifications.map((notif: any) => (
                                        <Link 
                                            key={notif.id} 
                                            href={notif.link || '/notifikasi'} 
                                            onClick={() => setShowNotifications(false)}
                                            className="block p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-all text-left group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[12px] font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                                                <span>{notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru'}</span>
                                                <span className="text-emerald-600 group-hover:underline">Buka &rarr;</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        Belum ada notifikasi baru.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-semibold flex items-center justify-center text-sm">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-[12px] font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
