import React, { useEffect, useState } from "react";
import moment from "moment";
import { formatAsZulu, getPositionFromFrequency } from "../utils/BookingHelper";
import bookingType from "../components/BookingType";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';


const BookingComponent = () => {
    const [ControlCenterBookings, setControlCenterBookings] = useState([]);
    const [VatsimNetworkSessions, setVatsimNetworkSessions] = useState([]);
    const [dateArray, setDateArray] = useState([]);
    const [loading, setLoading] = useState(true);

    const acceptedFIRsRegex = /((?:BI|EF|EK|EN|ES)([A-Z][A-Z]_))\w+/i;
    const mentorRegex = /((_X_)|(_X\d_)|(_M_))\w+/i;

    /**
     * Fetch data
     */
    const fetchComponentData = async () => {
        try {
            let [ControlCenterBookingsData, VatsimNetworkSessionsData] = await Promise.all([
                fetch('https://cc.vatsim-scandinavia.org/api/bookings'),
                fetch('https://data.vatsim.net/v3/vatsim-data.json'),
            ]);

            ControlCenterBookingsData = await ControlCenterBookingsData.json();
            VatsimNetworkSessionsData = await VatsimNetworkSessionsData.json();

            setControlCenterBookings(ControlCenterBookingsData);
            setVatsimNetworkSessions(VatsimNetworkSessionsData);
        } catch (error) {
            console.log('Error while fetching data:', error);
        }
    }
    
    /**
     * Process data
     */
    const processData = async () => {
        const ControlCenterBookingsData = ControlCenterBookings.data;
        const VatsimNetworkSessionsData = VatsimNetworkSessions.controllers;
    
        const startDate = moment();
        const endDate = moment().add(6, 'days');
    
        // Create initial localDateArray using a Map for quick lookup
        const dateMap = new Map();
        for (let d = startDate; d <= endDate; d.add(1, 'days')) {
            const dateString = d.format('YYYY-MM-DD');
            dateMap.set(dateString, { date: dateString, data: [] });
        }
    
        // Insert CC bookings into localDateArray
        ControlCenterBookingsData.forEach(booking => {
            const bookingDate = moment(booking.time_start).format('YYYY-MM-DD');
            const bookingData = dateMap.get(bookingDate);
            if (bookingData) {
                bookingData.data.push(booking);
            }
        });
    
        // Match online sessions to bookings
        const updatedSessions = [];
        for (const session of VatsimNetworkSessionsData) {
            if (acceptedFIRsRegex.test(session.callsign) && !mentorRegex.test(session.callsign)) {
                const correctedCallsign = await getPositionFromFrequency(session.callsign, session.frequency);
                const bookingData = dateMap.get(moment().format('YYYY-MM-DD'))?.data || [];
    
                const existingBooking = bookingData.find(booking => booking.callsign === correctedCallsign);
                if (existingBooking && moment.utc(existingBooking.time_start).isBefore(moment())) {
                    existingBooking.logon_time = session.logon_time;
                } else {
                    updatedSessions.push({ ...session });
                }
            }
        }
    
        // Merge sessions into the correct date
        updatedSessions.forEach(session => {
            const dateKey = moment(session.logon_time).format('YYYY-MM-DD');
            const dateData = dateMap.get(dateKey);
            if (dateData) {
                dateData.data.push(session);
            }
        });

        // Sorting
        dateMap.forEach(dateData => {
            dateData.data.sort((a, b) => {
                const timeA = a.time_start || a.logon_time || Infinity;
                const timeB = b.time_start || b.logon_time || Infinity;
                return moment.utc(timeA).isBefore(moment.utc(timeB)) ? -1 : 1;
            });
        });
    
        // Convert the dateMap back to an array for setting state
        setDateArray(Array.from(dateMap.values()));
        setLoading(false);
    };
    

    useEffect(() => {
        // Fetches data and starts intercal of 1 min for data pulling.
        const interval = setInterval(fetchComponentData, 60000);
        fetchComponentData();
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // When data is fetched and states for CC Bookings and/or VATSIM updates.
        if (!ControlCenterBookings.data || !VatsimNetworkSessions.controllers) { return } // Make sure there is data to be processed otherwise exit
        processData();
    }, [ControlCenterBookings, VatsimNetworkSessions])

    return (
        <table className="w-full h-full px-2">
            <tbody className="h-full">
                {loading ? (
                    <tr className="h-12">
                        <td colSpan={4}>
                            <iframe src="https://lottie.host/embed/e516525c-74c1-4db5-b2b2-bb135366e103/W8AodEgALN.json" className="w-full h-full" />
                        </td>
                    </tr>
                ) : (
                    <>
                        {dateArray.map((date, index) => (
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
                        {ControlCenterBookings.length < 1 ? null : (
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
    
};

export default BookingComponent;