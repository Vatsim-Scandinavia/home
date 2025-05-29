import React, { useEffect, useState } from "react";
import moment from "moment";
import { formatAsZulu, getPositionFromFrequency } from "../utils/BookingHelper";
import bookingType from "./BookingType";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface VatsimSession {
    callsign: string;
    frequency: string;
    logon_time: string; 
}

interface ControlCenterBooking {
    callsign: string;
    time_start: string;
    time_end: string;
    logon_time?: string;
}

interface mergedBookingAndSession {
    callsign: string;
    time_start?: string;
    time_end?: string;
    logon_time?: string;
}

interface ControlCenterResponse {
    data: ControlCenterBooking[];
}

interface VatsimResponse {
    controllers: VatsimSession[];
}

type BookingDateMap = {
    date: string;
    data: mergedBookingAndSession[];
};

const BookingComponent = () => {
    const [bookingData, setBookingData] = useState<BookingDateMap[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<true | false>(true);

    const acceptedFIRsRegex = /((?:BI|EF|EK|EN|ES)([A-Z][A-Z]_))\w+/i;
    const mentorRegex = /((_X\d*_)|(_M\d*_))\w+/i;

    /**
     * Fetch data from Control Center and VATSIM APIs.
     * This function is called when the component mounts and every 60 seconds.
     * 
     * @param {String} ControlCenterURI - The URI for the Control Center API.
     * @param {String} VatsimURI - The URI for the VATSIM API.
     * @returns {Promise<void>} - Two promises that resolves when the data is fetched.
     * @throws {Error} - Throws an error if the fetch operation fails.
     */
    const fetchData = async (ControlCenterURI: string, VatsimURI: string): Promise<[ControlCenterResponse, VatsimResponse] | undefined> => {
        try {
            let [ControlCenterResponse, VatsimResponse] = await Promise.all([
                fetch(ControlCenterURI),
                fetch(VatsimURI)
            ]);
            
            const ControlCenterData: ControlCenterResponse = await ControlCenterResponse.json();
            const VatsimData: VatsimResponse = await VatsimResponse.json();

            return [ControlCenterData, VatsimData];
        } catch (Error) {
            console.error("Error fetching data:", Error);
            setError("Failed to fetch bookings...");
        }
    }

    /**
     * Handle the fetched data from Control Center and VATSIM.
     * This function processes the data and updates the state.
     * 
     * @param {ControlCenterResponse} ControlCenterData - The data from the Control Center API.
     * @param {VatsimResponse} VatsimData - The data from the VATSIM API.
     */
    const handleData = async (ControlCenterResponse: ControlCenterResponse, VatsimResponse: VatsimResponse) => {
        const ControlCenterData = ControlCenterResponse.data;
        const VatsimData = VatsimResponse.controllers;
        const mergedBookingsAndSessions = [];

        const startDate = moment().subtract(1, 'days');
        const endDate = moment().add(6, 'days');

        // TODO: Shouldnt error if one of the data points is existing

        if (!ControlCenterData || !VatsimData) {
            setError("No bookings/sessions found.");
            return;
        }

        /**
         * Create a map of dates with empty arrays for bookings.
         * Hold bookings/controller sessions for each date in the range from startDate to endDate.
         * 
         * @type {Map<String, Array>}
         * @property {String} date - The date in 'YYYY-MM-DD' format.
         * @property {Array} data - An array to hold bookings for that date.
         */
        const dateMap = new Map();
        for (let d = startDate; d <= endDate; d.add(1, 'days')) {
            const dateString = d.format('YYYY-MM-DD');
            dateMap.set(dateString, { date: dateString, data: [] });
        }

        /**
         * Insert Control Center bookings into the dateMap.
         * Each booking is added to the corresponding date based on its start time.
         * 
         * @param {ControlCenterBooking} booking - The booking object from Control Center.
         */
        ControlCenterData.forEach(booking => {
            const bookingDate = moment(booking.time_start).format('YYYY-MM-DD');
            const bookingData = dateMap.get(bookingDate);
            if (bookingData) {
                bookingData.data.push(booking);
            }
        });

        /**
         * Merge Control Center bookings with VATSIM sessions.
         * 
         * @param {VatsimSession} session - The session object from VATSIM.
         */
        for (const session of VatsimData) {
            if (acceptedFIRsRegex.test(session.callsign) && !mentorRegex.test(session.callsign)) {
                const frequencyCallsign: string = await getPositionFromFrequency(session.callsign, session.frequency);
                const bookingData = dateMap.get(moment().format('YYYY-MM-DD'))?.data || [];
    
                const existingBooking: ControlCenterBooking = bookingData.find((booking: ControlCenterBooking) => booking.callsign === frequencyCallsign);
                if (existingBooking && moment.utc(existingBooking.time_start).isBefore(moment())) {
                    existingBooking.logon_time = session.logon_time;
                } else {
                    mergedBookingsAndSessions.push({ ...session, callsign: frequencyCallsign });
                }
            }
        }
         
        /**
         * Insert merged bookings and sessions into the dateMap.
         * Each session is added to the corresponding date based on its logon time.
         */
        mergedBookingsAndSessions.forEach(session => {
            const dateKey = moment.utc(session.logon_time).format('YYYY-MM-DD');
            const dateData = dateMap.get(dateKey);
            if (dateData) {
                dateData.data.push(session);
            }
        });
        
        // Sort the bookings and sessions for each date by their start time or logon time
        dateMap.forEach(dateData => {
            dateData.data.sort((a: mergedBookingAndSession, b: mergedBookingAndSession) => {
                const timeA = a.time_start || a.logon_time || Infinity;
                const timeB = b.time_start || b.logon_time || Infinity;
                return moment.utc(timeA).isBefore(moment.utc(timeB)) ? -1 : 1;
            });
        });

        setBookingData(Array.from(dateMap.values()));
        setLoading(false);

    }

    useEffect(() => {
        const fetchAndHandleData = async () => {
            const response = await fetchData("https://cc.vatsim-scandinavia.org/api/bookings", "https://data.vatsim.net/v3/vatsim-data.json");
            if (response) {
                const [ControlCenterResponse, VatsimResponse] = response;
                await handleData(ControlCenterResponse, VatsimResponse);
            }
        }
        fetchAndHandleData();
        const interval = setInterval(fetchAndHandleData, 60000); // Fetch data every 60 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }
    , []);

    return (
        <table className="w-full h-full px-2">
            <tbody>
                {loading ? (
                    <tr className="h-12">
                        <td colSpan={4} className="text-center">
                            {!error ? (
                                <>
                                    <iframe src="https://lottie.host/embed/e516525c-74c1-4db5-b2b2-bb135366e103/W8AodEgALN.json" className="w-full" />
                                    <p className="font-semibold text-lg">Loading...</p>
                                    <p className="text-gray-500 mt-2">Fetching bookings and VATSIM controllers...</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-lg">Error!</p>
                                    <p className="text-danger mt-2">An error occured while fetching bookings/sessions...</p>
                                </>
                            )}
                        </td>
                    </tr>
                ) : (
                    <>
                        {bookingData && bookingData.map((date, index) => (
                            <React.Fragment key={index}>
                                {date.data.length > 0 ? (
                                    <>
                                       <tr className="h-8 bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-4 text-center">
                                            <td colSpan={4}>{moment(date.date).format('dddd Do MMMM')}</td>
                                        </tr> 
                                        {date.data.map((booking, index2) => (
                                            <tr key={index2} className="h-6 even:bg-gray-50 odd:bg-white dark:even:bg-tertiary dark:odd:bg-black">
                                                {booking.logon_time ? (
                                                    <td className="pl-[4px] text-[#447b68] font-bold">
                                                        <img className="circle" src="img/icons/circle-solid.svg" alt="" /> {booking.callsign}
                                                    </td>
                                                ) : (
                                                    <td className="pl-[4px]">
                                                        <img className="circle" src="img/icons/circle-regular.svg" alt="" /> {booking.callsign}
                                                    </td>
                                                )}
                                                <td className="px-[15px]">{bookingType(booking)}</td>
                                                <td className="pl-[4px]">
                                                    {booking.time_start && !booking.logon_time
                                                        ? formatAsZulu(booking.time_start)
                                                        : ""}
                                                    {booking.logon_time ? formatAsZulu(booking.logon_time) : ""}
                                                </td>
                                                <td className="pl-[4px]">{booking.time_end ? formatAsZulu(booking.time_end) : ""}</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : null}
                            </React.Fragment>
                        ))}
                        {bookingData && bookingData.some(date => date.data.length > 0) && (
                            <tr className="bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-4 text-center h-12">
                                <td colSpan={4} className="underline hover:no-underline text-md">
                                    <a href="https://cc.vatsim-scandinavia.org/booking" target="_blank" className="underline hover:no-underline">
                                        See all bookings
                                    </a>
                                    <ExternalLinkIcon width="0.75rem" marginLeft="0.3rem" />
                                </td>
                            </tr>
                        )}
                    </>
                )}
            </tbody>
        </table>
    );
}

export default BookingComponent;