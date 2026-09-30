import React from "react";
import moment from "moment";
import { RefreshCw, ArrowUpRight } from "lucide-react";
import useBookingData from "@/hooks/useBookingData";
import type { MergedBooking } from "@/interfaces/Booking";
import "./booking-board.css";

interface BookingComponentProps {
    selectedPrefixes?: string[];
    selectedPositions?: string[];
    selectedEventTypes?: string[];
}

export default function BookingComponent({ selectedPrefixes = [], selectedPositions = [], selectedEventTypes = [] }: BookingComponentProps) {
    const { bookingData, isLoading, error, refetch, updatedAt } = useBookingData();
    const [refreshing, setRefreshing] = React.useState(false);
    const matchesFilters = (booking: MergedBooking) => {
        const callsign = booking.callsign.toUpperCase();
        return (!selectedPrefixes.length || selectedPrefixes.some(prefix => callsign.startsWith(prefix)))
            && (!selectedPositions.length || selectedPositions.some(position => callsign.includes(`_${position}`)))
            && (!selectedEventTypes.length || selectedEventTypes.some(type => booking[type as 'training' | 'event' | 'exam'] === 1));
    };
    const dates = Object.values(bookingData ?? {});
    const online = dates.flatMap(date => date.data).filter(booking => booking.logon_time && matchesFilters(booking));
    const scheduled = dates.map(date => ({ ...date, data: date.data.filter(booking => !booking.logon_time && matchesFilters(booking)) })).filter(date => date.data.length);
    const refresh = async () => {
        setRefreshing(true);
        try { await refetch(); } finally { setRefreshing(false); }
    };
    const row = (booking: MergedBooking, key: string) => (
        <tr key={key}>
            <th scope="row">{booking.callsign}</th>
            <td><div className="booking-status-list">
                {booking.logon_time && <span className="booking-badge booking-online">Online</span>}
                {booking.training === 1 && <span className="booking-badge booking-training">Training</span>}
                {booking.event === 1 && <span className="booking-badge booking-event">Event</span>}
                {booking.exam === 1 && <span className="booking-badge booking-exam">Exam</span>}
                {!booking.logon_time && !booking.training && !booking.event && !booking.exam && <span className="booking-badge">Booked</span>}
            </div></td>
            <td>{booking.logon_time ? `Since ${moment.utc(booking.logon_time).format('HH:mm')}` :
                [booking.time_start, booking.time_end].filter(Boolean).map(time => moment.utc(time).format('HH:mm')).join('–')}</td>
        </tr>
    );

    return (
        <section className="booking-board" aria-label="Live ATC and bookings">
            <div className="booking-board-heading">
                <div><p>On frequency</p><h2>Live ATC &amp; Bookings</h2></div>
            </div>
            <div className="booking-table-scroll" tabIndex={0} role="region" aria-label="Live controllers and scheduled bookings" aria-busy={isLoading || refreshing}>
                <table>
                    <tbody>
                        {isLoading && !error ? <tr><td colSpan={3} className="booking-message">Checking the Scandinavian skies…</td></tr> : <>
                            {error && <tr><td colSpan={3} className="booking-message">{error}</td></tr>}
                            {online.length > 0 && <>
                                <tr className="booking-date"><th colSpan={3}>Online now</th></tr>
                                {online.map((booking, index) => row(booking, `online-${booking.callsign}-${index}`))}
                            </>}
                            {scheduled.map(date => <React.Fragment key={date.date}>
                                <tr className="booking-date"><th colSpan={3}>{moment.utc(date.date).format('dddd D MMMM')}</th></tr>
                                {date.data.map((booking, index) => row(booking, `${date.date}-${booking.callsign}-${index}`))}
                            </React.Fragment>)}
                            {!error && !online.length && !scheduled.length && <tr><td colSpan={3} className="booking-message">No controllers online or upcoming bookings. Check back soon or view all bookings below.</td></tr>}
                        </>}
                    </tbody>
                </table>
            </div>
            <a className="booking-footer" href="https://cc.vatsim-scandinavia.org/booking" target="_blank" rel="noopener noreferrer">View all bookings <ArrowUpRight size={16} /></a>
        </section>
    );
}
