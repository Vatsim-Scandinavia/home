export interface MergedBooking {
    cid?: string
    callsign: string;
    frequency?: string;
    logon_time?: string;
    time_start?: string;
    time_end?: string;
}
    

export interface BookingDataMap {
    date: string;
    data: MergedBooking[];
}