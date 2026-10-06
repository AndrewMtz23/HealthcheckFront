export function readPeriod(params: URLSearchParams) { return { days: params.get('days') || '30', start: params.get('startDate') || '', end: params.get('endDate') || '' }; }
export function periodQuery(query: string, period: {
    days: string;
    start: string;
    end: string;
}) { const next = new URLSearchParams(query); next.set('days', period.days); for (const [key, val] of [['startDate', period.start], ['endDate', period.end]]) {
    if (period.days === 'custom' && val)
        next.set(key, val);
    else
        next.delete(key);
} return next.toString(); }
export function relatedNewsHref(row: {
    noticia_id?: unknown;
}) { const id = Number(row.noticia_id); return Number.isSafeInteger(id) && id > 0 ? `/admin/news?detail=${id}` : null; }
export function manageDrawerFocus(panel: HTMLElement, doc: Document, trigger: HTMLElement | null, close: () => void) {
    const targets = () => Array.from(panel.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),summary,[tabindex="0"]')).filter(el => el.getClientRects().length > 0);
    targets()[0]?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
    } if (event.key !== 'Tab')
        return; const items = targets(), first = items[0], last = items[items.length - 1]; if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last?.focus();
    }
    else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first?.focus();
    } };
    doc.addEventListener('keydown', key);
    return () => { doc.removeEventListener('keydown', key); trigger?.focus(); };
}
