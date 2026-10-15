import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { PageProps } from '@/Types';

const navigationItems = [
    { label: 'Foto ilustrasi', section: 'galeri' },
    { label: 'Mitra', section: 'mitra' },
    { label: 'Alur PKL', section: 'alur' },
    { label: 'Program keahlian', section: 'program' },
];

export const Navbar: React.FC = () => {
    const { props, url } = usePage<PageProps>();
    const auth = props?.auth;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isLandingPage = url.split('?')[0] === '/';

    const sectionHref = (section: string) =>
        `${isLandingPage ? '' : '/'}#${section}`;

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:h-20 lg:px-12">
                <Link
                    href="/"
                    className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                    <img
                        src="/img/pklconnect_logo.png"
                        alt=""
                        className="h-10 w-10 shrink-0 object-contain"
                    />
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-bold tracking-tight text-slate-950 sm:text-base">
                            PKLConnect
                        </span>
                        <span className="hidden text-xs text-slate-600 sm:block">
                            SMK Taruna Bangsa
                        </span>
                    </span>
                </Link>

                <nav aria-label="Navigasi utama" className="hidden items-center gap-6 lg:flex">
                    {navigationItems.map((item) => (
                        <a
                            key={item.section}
                            href={sectionHref(item.section)}
                            className="rounded-sm py-2 text-sm font-medium text-slate-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        href={auth?.user ? '/dashboard' : '/login'}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:px-4"
                    >
                        <span className="hidden sm:inline">
                            {auth?.user ? 'Dashboard' : 'Login pengguna'}
                        </span>
                        <span className="sm:hidden">{auth?.user ? 'Dashboard' : 'Masuk'}</span>
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 lg:hidden"
                        aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-navigation"
                    >
                        {mobileMenuOpen ? (
                            <X aria-hidden="true" className="h-5 w-5" />
                        ) : (
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <nav
                    id="mobile-navigation"
                    aria-label="Navigasi seluler"
                    className="border-t border-slate-200 bg-white px-4 py-3 sm:px-8 lg:hidden"
                >
                    <ul className="mx-auto max-w-7xl divide-y divide-slate-100">
                        {navigationItems.map((item) => (
                            <li key={item.section}>
                                <a
                                    href={sectionHref(item.section)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-sm py-3 text-sm font-medium text-slate-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
};
