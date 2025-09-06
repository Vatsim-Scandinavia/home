import { useEffect, useState } from "react";
import useFetchVatsimData from "./useFetchVatsimData";
import useFetchControlCenterData from "./useFetchControlCenterData";
import moment, { type Moment } from "moment";
import { getPositionFromFrequency, positionExists } from "@/utils/BookingHelper";
import type { BookingDataMap, BookingDataState } from "@/interfaces/Booking";
import type { vatsimSession } from "@/interfaces/Vatsim";
import type { ControlCenterBooking } from "@/interfaces/ControlCenter";

const REFRESH_INTERVAL = 60000;
const START_DAYS = 1;
const END_DAYS = 6;

/**
 * Create a map with keys for each date between startDate and endDate, inclusive.
 * @param startDate 
 * @param endDate 
 * @returns Map with keys for each date between startDate and endDate, inclusive.
 */
const createDateMap = (startDate: Moment, endDate: Moment): Map<string, BookingDataMap> => {
    const map = new Map<string, BookingDataMap>();
    for (let d = startDate.clone(); d.isSameOrBefore(endDate, 'day'); d.add(1, 'days')) {
        const mapKey = d.format('YYYY-MM-DD');
        map.set(mapKey, { date: mapKey, data: [] });
    }
    return map;
};

/**
 * Add Control Center bookings to the date map provided.
 * @param map The date map to add bookings to.
 * @param bookings The Control Center bookings to add.
 */
const addControlCenterBookings = (map: Map<string, BookingDataMap>, bookings: ControlCenterBooking[]) => {
    bookings.forEach (booking => {
        const key = moment(booking.time_start).format('YYYY-MM-DD');
            map.get(key)?.data.push(booking);
    })
}

/**
 * Sort each date's bookings by start time or logon_time.
 * @param map The date map to sort.
 */
const sortDateMap = (map: Map<string, BookingDataMap>) => {
    map.forEach(key => {
        key.data.sort((a, b) => {
            const timeA = a.time_start || a.logon_time || Infinity;
            const timeB = b.time_start || b.logon_time || Infinity;
            return moment.utc(timeA).isBefore(moment.utc(timeB)) ? -1 : 1;
        });
    });
}

/**
 * Merge VATSIM sessions into the date map provided.
 * @param map The date map to merge VATSIM sessions into.
 * @param sessions The VATSIM sessions to merge.
 */
async function mergeVatsimSessions(
    map: Map<string, BookingDataMap>,
    sessions: vatsimSession[]
) {
    const todayKey = moment().format('YYYY-MM-DD');
    const todayBookings = map.get(todayKey)?.data || [];

    for (const session of sessions) {
        const frequencyCallsign = await getPositionFromFrequency(session.callsign, session.frequency);
        const exists = await positionExists(frequencyCallsign);

        if (!exists) continue;

        const existing = todayBookings.find(b => b.callsign === frequencyCallsign);
        if (existing && moment.utc(existing.time_start).isBefore(moment())) {
            existing.logon_time = session.logon_time;
        } else if (!todayBookings.some(s => s.callsign === frequencyCallsign)) {
            todayBookings.push({ ...session, callsign: frequencyCallsign });
        }
    }
}

/**
 * Custom hook to manage booking data.
 * @returns An object containing booking data, loading state, and error state.
 */
export default function useBookingData() {
    const [bookingData, setBookingData] = useState<BookingDataState | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>();

    const { vatsimData, isLoading: vatsimIsLoading, error: vatsimError, refetch: vatsimRefetch } = useFetchVatsimData();
    const { controlCenterData, isLoading: controlCenterIsLoading, error: controlCenterError, refetch: controlCenterRefetch } = useFetchControlCenterData();

    useEffect(() => {
        let isMounted = true;

        if ((vatsimIsLoading || controlCenterIsLoading) && !bookingData) {
            if (isMounted) setIsLoading(true);
            return;
        }

        if (vatsimError || controlCenterError) {
            if (isMounted) setError(vatsimError || controlCenterError || 'An error occurred while fetching data.');
            return;
        }

        async function processData() {
            try {
                const startDate = moment().subtract(START_DAYS, 'days');
                const endDate = moment().add(END_DAYS, 'days');
                const map = createDateMap(startDate, endDate);

                addControlCenterBookings(map, controlCenterData || []);
                await mergeVatsimSessions(map, vatsimData || []);
                sortDateMap(map);

                if (isMounted) setBookingData(Object.fromEntries(map))
            } catch (error) {
                if (isMounted) {
                    if (error instanceof Error) {
                        setError(error.message);
                    } else {
                        setError('An unknown error occurred while processing booking data.');
                    }
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        processData();

        const interval = setInterval(() => {
            vatsimRefetch();
            controlCenterRefetch();
        }, REFRESH_INTERVAL);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [vatsimData, controlCenterData]);

    return { bookingData, isLoading, error }
}