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
