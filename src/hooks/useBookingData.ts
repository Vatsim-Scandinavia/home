import { useEffect, useState } from "react";
import useFetchVatsimData from "./useFetchVatsimData";
import useFetchControlCenterData from "./useFetchControlCenterData";
import moment from "moment";
import { getPositionFromFrequency, positionExists } from "@/utils/BookingHelper";
import type { BookingDataMap, MergedBooking } from "@/interfaces/Booking";
import type { vatsimSession } from "@/interfaces/Vatsim";
import type { ControlCenterBooking } from "@/interfaces/ControlCenter";

export default function useBookingData() {
    const [bookingData, setBookingData] = useState<BookingDataMap>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>();

    const { vatsimData, isLoading: vatsimIsLoading, error: vatsimError } = useFetchVatsimData();
    const { controlCenterData, isLoading: controlCenterIsLoading, error: controlCenterError } = useFetchControlCenterData();

    const handleBookingData = async (vatsimData: vatsimSession[], controlCenterData: ControlCenterBooking[]) => {
        const startDate = moment().subtract(1, 'days');
        const endDate = moment().add(6, 'days');

        const bookingDataMap = new Map();
        for (let d = startDate; d <= endDate; d.add(1, 'days')) {
            const dateString = d.format('YYYY-MM-DD');
            bookingDataMap.set(dateString, { date: dateString, data: [] });
        }

        controlCenterData.forEach(booking => {
            const bookingDate = moment(booking.time_start).format('YYYY-MM-DD');
            const bookingData = bookingDataMap.get(bookingDate);
            if (bookingData) {
                bookingData.data.push(booking);
            }
        });

        for (const session of vatsimData) {
            const frequencyCallsign: string = await getPositionFromFrequency(session.callsign, session.frequency);
            const positionExistsFlag: boolean = await positionExists(frequencyCallsign);
            const bookingData = bookingDataMap.get(moment().format('YYYY-MM-DD'))?.data || [];
            const existingBooking = bookingData.find((booking: ControlCenterBooking) => booking.callsign === frequencyCallsign);

            if (positionExistsFlag) {
                if (existingBooking && moment.utc(existingBooking.time_start).isBefore(moment())) {
                    existingBooking.logon_time = session.logon_time;
                } else {
                    // Prevent duplicate frequencyCallsigns
                    const alreadyExists = bookingData.some(
                        (session: vatsimSession) => session.callsign === frequencyCallsign
                    );
                    if (!alreadyExists) {
                        bookingData.push({ ...session, callsign: frequencyCallsign });
                    }
                }
            }
        }

        // Sort the bookings and sessions for each date by their start time or logon time
        bookingDataMap.forEach(dateData => {
            dateData.data.sort((a: MergedBooking, b: MergedBooking) => {
                const timeA = a.time_start || a.logon_time || Infinity;
                const timeB = b.time_start || b.logon_time || Infinity;
                return moment.utc(timeA).isBefore(moment.utc(timeB)) ? -1 : 1;
            });
        });

        setBookingData(Object.fromEntries(bookingDataMap));
        setIsLoading(false);
    }

    useEffect(() => {
        handleBookingData(vatsimData, controlCenterData);
    }, [vatsimData, controlCenterData])

    return { bookingData, isLoading, error }
}