import React from "react";
import moment from "moment";
import { formatAsZulu } from "../utils/BookingHelper";
import bookingType from "./BookingType";
import useBookingData from "@/hooks/useBookingData";
import type { MergedBooking } from "@/interfaces/Booking";
import Skeleton from "./ui/bookings/Skeleton";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "./ui/Table";


interface BookingComponentProps {
    selectedPrefixes?: string[];
    selectedPositions?: string[];
    selectedEventTypes?: string[];
}

const BookingComponent = ({ selectedPrefixes = [], selectedPositions = [], selectedEventTypes = [] }: BookingComponentProps) => {
    const { bookingData, isLoading, error } = useBookingData();

    // Determine first date section that actually has rows after filtering
    const datesArray = bookingData ? Object.values(bookingData) : [];
    const matchesFilters = (b: MergedBooking) => {
        const cs = (b.callsign || '').toUpperCase();
        const prefixOk = selectedPrefixes.length === 0 || selectedPrefixes.some(pref => cs.startsWith(pref));
        const posOk = selectedPositions.length === 0 || selectedPositions.some(pos => cs.includes(`_${pos}`));
        
        // Event type filter
        let eventTypeOk = true;
        if (selectedEventTypes.length > 0) {
            eventTypeOk = selectedEventTypes.some(type => {
                if (type === 'training') return b.training === 1;
                if (type === 'event') return b.event === 1;
                if (type === 'exam') return b.exam === 1;
                return false;
            });
        }
        
        return prefixOk && posOk && eventTypeOk;
    };
    const getFilteredForDate = (d: { data: MergedBooking[] }) => d.data.filter(matchesFilters);
    // No need to track first index with data now that filters live in a top row

    return (
        <div className="h-full flex flex-col p-0">
            <Table className="w-full">
                <TableBody>
                {isLoading ? (
                    (!error) ? (
                        <Skeleton count={5}/>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-danger">
                                <p className="font-bold text-2xl">Mayday..</p>
                                <p className="italic">{error}</p>
                            </TableCell>
                        </TableRow>
                    )   
                ) : (
                    <>
                        {bookingData && datesArray.map((date, index) => (
                            <React.Fragment key={index}>
                                {(() => {
                                    const filteredData: MergedBooking[] = getFilteredForDate(date);
                                    return filteredData.length > 0 ? (
                                    <>
                                       <TableRow className="h-6 bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-1 hover:bg-snow dark:hover:bg-secondary">
                                            <TableCell colSpan={4} className="text-center py-1">
                                                <div className="px-2 text-xs">{moment(date.date).format('dddd Do MMMM')}</div>
                                            </TableCell>
                                        </TableRow>
                                        {filteredData.map((booking: MergedBooking) => (
                                            <TableRow key={`${date.date}-${booking.callsign}-${booking.time_start ?? booking.logon_time ?? ''}`} className="h-5 even:bg-gray-50 odd:bg-white dark:even:bg-tertiary dark:odd:bg-black hover:bg-accent/50">
                                                {booking.logon_time ? (
                                                    <TableCell className="pl-1 py-1 text-[#447b68] font-bold text-xs whitespace-nowrap w-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={'8px'} height={'8px'} className="inline mr-1 align-baseline">
                                                            <path fill="hsl(162, 33%, 38%)" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
                                                        </svg>
                                                        {booking.callsign}
                                                    </TableCell>
                                                ) : (
                                                    <TableCell className="pl-1 py-1 text-xs whitespace-nowrap w-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={'8px'} height={'8px'} className="inline mr-1 align-baseline">
                                                            <path fill="grey" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                                                        </svg>
                                                        {booking.callsign}
                                                    </TableCell>
                                                )}
                                                <TableCell className="px-2 py-1 text-xs whitespace-nowrap">{bookingType(booking)}</TableCell>
                                                <TableCell className="pl-1 py-1 text-xs whitespace-nowrap text-right w-auto min-w-fit">
                                                    {booking.time_start && !booking.logon_time
                                                        ? formatAsZulu(booking.time_start)
                                                        : ""}
                                                    {booking.logon_time ? formatAsZulu(booking.logon_time) : ""}
                                                </TableCell>
                                                <TableCell className="pl-1 pr-2 py-1 text-xs whitespace-nowrap text-right w-auto min-w-fit">{booking.time_end ? formatAsZulu(booking.time_end) : ""}</TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : null
                                })()}
                            </React.Fragment>
                        ))}
                        
                    </>
                )}
                </TableBody>
            </Table>

            {/* Stretchy bottom area for the "See all bookings" link */}
            {bookingData && Object.values(bookingData).some(date => date.data.length > 0) && !isLoading && (
                <div className="bg-snow dark:bg-secondary text-black dark:text-white text-center flex-1 flex items-center justify-center p-4">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                        className="gap-2"
                    >
                        <a href="https://cc.vatsim-scandinavia.org/booking" target="_blank" rel="noopener noreferrer">
                            See all bookings
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                </div>
            )}
        </div>
    );
}

export default BookingComponent;
