export interface MergedBooking {
    cid?: number
    callsign: string;
    frequency?: string;
    logon_time?: string;
    time_start?: string;
    time_end?: string;
    training?: number;
    event?: number;
    exam?: number;
}
    

export interface BookingDataMap {
    date: string;
    data: MergedBooking[];
}

export type BookingDataState = Record<string, BookingDataMap>;