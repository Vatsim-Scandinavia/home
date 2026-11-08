import type { EventCard, VatscaEvent } from '@/interfaces/Event';

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
