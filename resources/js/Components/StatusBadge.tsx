import React from 'react';

interface Props {
    status: string;
    size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
    let bg = 'bg-slate-100 text-slate-600';
    let dot = 'bg-slate-400';

    const s = status.toLowerCase();

    if (s.includes('aman') || s.includes('aktif') || s.includes('approved') || s.includes('hadir') || s.includes('selesai') || s.includes('terkirim') || s.includes('valid')) {
        bg = 'bg-emerald-50 text-emerald-700';
        dot = 'bg-emerald-500';
    } else if (s.includes('perlu perhatian') || s.includes('menunggu') || s.includes('izin') || s.includes('terlambat') || s.includes('submitted')) {
        bg = 'bg-amber-50 text-amber-700';
        dot = 'bg-amber-500';
    } else if (s.includes('bermasalah') || s.includes('revision') || s.includes('revisi') || s.includes('alpa') || s.includes('sakit') || s.includes('revoked')) {
        bg = 'bg-rose-50 text-rose-700';
        dot = 'bg-rose-500';
    }

    const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px] font-semibold';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full ${padding} ${bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {status}
        </span>
    );
};
