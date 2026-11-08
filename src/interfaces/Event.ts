export interface VatscaEvent {
    id: number;
    name: string;
    banner: string | null;
    url: string;
    cancelledAt: string | null;
    occurrences: {
        id: number;
        startsAt: string;
        endsAt: string;
        cancelledAt: string | null;
    }[];
}

export interface EventsResponse {
    data: VatscaEvent[];
    links: { next: string | null };
}

/** The subset the homepage island renders. Keeps the serialised island props small. */
export type EventCard = Pick<
    VatscaEvent,
    'id' | 'name' | 'banner' | 'url'
> & {
    start_datetime: string;
    end_datetime: string;
};
