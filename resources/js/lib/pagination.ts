export interface Paginator<T = unknown> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export type Listable<T> = T[] | Paginator<T> | null | undefined;

function isPaginator<T>(value: T[] | Paginator<T>): value is Paginator<T> {
    return !Array.isArray(value) && typeof value === 'object' && value !== null && Array.isArray((value as Paginator<T>).data);
}

export function toItems<T>(value: Listable<T>): T[] {
    if (Array.isArray(value)) return value;
    if (value && isPaginator(value)) return value.data;
    return [];
}

export function toPaginator<T>(value: Listable<T>): Paginator<T> | null {
    if (Array.isArray(value)) return null;
    if (value && isPaginator(value)) return value;
    return null;
}

export function toTotal<T>(value: Listable<T>): number {
    const paginator = toPaginator(value);
    if (paginator) return paginator.total;
    return toItems(value).length;
}
