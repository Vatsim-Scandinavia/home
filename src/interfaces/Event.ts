export interface VatscaEvent {
    id: number;
    name: string;
    short_description: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    start_datetime: string;
    end_datetime: string;
    airports: string[];
    banner: string;
    url: string;
    discord_channel_id: string | null;
    discord_message_id: string | null;
    has_staffing: boolean;
}

/** The subset the homepage island renders. Keeps the serialised island props small. */
export type EventCard = Pick<
    VatscaEvent,
    'id' | 'name' | 'short_description' | 'start_datetime' | 'end_datetime' | 'banner' | 'url'
>;
