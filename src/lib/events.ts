import type { EventCard, VatscaEvent } from '@/interfaces/Event';

/** Keep the same explicitly labelled UTC range on the server and in the browser. */
export function formatEventPeriod(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = startDate.toISOString().slice(0, 10) === endDate.toISOString().slice(0, 10);
    const time: Intl.DateTimeFormatOptions = {
        timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    };
    const date: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const from = startDate.toLocaleString('en-GB', { ...date, ...time, weekday: 'long' });
    const to = endDate.toLocaleString('en-GB', { ...(!sameDay ? { ...date, weekday: 'short' as const } : {}), ...time });

    return `${from} - ${to} UTC`;
}

/** Plain text for the linked preview, so description links cannot nest inside it. */
export function eventExcerpt(html: string | null): string {
    const entities: Record<string, string> = {
        amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    };
    const text = (html ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
            if (!code.startsWith('#')) return entities[code.toLowerCase()] ?? entity;
            const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
            return value <= 0x10ffff ? String.fromCodePoint(value) : entity;
        })
        .replace(/\s+/g, ' ')
        .trim();

    return text.length > 280 ? `${text.slice(0, 277).trimEnd()}...` : text;
}

/** Show each event once, using its next ongoing or upcoming, uncancelled date. */
export function toEventCards(events: VatscaEvent[], now = Date.now()): EventCard[] {
    return events.flatMap((event) => {
        if (event.cancelledAt) return [];

        const next = event.occurrences
            .filter((occurrence) => !occurrence.cancelledAt && Date.parse(occurrence.endsAt) > now)
            .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];

        if (!next) return [];

        return [{
            id: event.id,
            name: event.name,
            banner: event.banner,
            url: event.url,
            start_datetime: next.startsAt,
            end_datetime: next.endsAt,
        }];
    }).sort((a, b) => Date.parse(a.start_datetime) - Date.parse(b.start_datetime));
}
