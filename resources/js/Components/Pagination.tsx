import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Listable, toPaginator } from '@/lib/pagination';

interface PaginationProps<T> {
    source: Listable<T>;
    label?: string;
    divider?: boolean;
    className?: string;
}

export function Pagination<T>({
    source,
    label = 'Halaman',
    divider = true,
    className = '',
}: PaginationProps<T>) {
    const pager = toPaginator(source);

    if (!pager || (!pager.prev_page_url && !pager.next_page_url)) return null;

    const visit = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className={`p-4 flex items-center justify-between gap-3 ${divider ? 'border-t border-slate-100' : ''} ${className}`}>
            <button
                type="button"
                disabled={!pager.prev_page_url}
                onClick={() => visit(pager.prev_page_url)}
                className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>

            <span className="text-xs font-semibold text-slate-500">
                {label} {pager.current_page} dari {pager.last_page}
                {pager.total > 0 && ` • ${pager.total} data`}
            </span>

            <button
                type="button"
                disabled={!pager.next_page_url}
                onClick={() => visit(pager.next_page_url)}
                className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 transition-colors"
            >
                Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
