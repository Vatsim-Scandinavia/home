import React, { useEffect, useState } from "react";
import moment from "moment";
import { formatAsZulu } from "../utils/BookingHelper";
import bookingType from "./BookingType";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import useBookingData from "@/hooks/useBookingData";
import type { MergedBooking } from "@/interfaces/Booking";

const BookingComponent = () => {
    const { bookingData, isLoading, error } = useBookingData();

    return (
        <table className="w-full h-full px-2">
            <tbody>
                {isLoading ? (
                    <tr className="h-12">
                        <td colSpan={4} className="text-center">
                            {!error ? (
                                <>
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-300 dark:bg-secondary w-full"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-300 dark:bg-secondary w-full"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-300 dark:bg-secondary w-full"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-full mb-1"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-full mb-1"></div>
                                    </div>
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
                        {bookingData && Object.values(bookingData).map((date, index) => (
                            <React.Fragment key={index}>
                                {date.data.length > 0 ? (
                                    <>
                                       <tr className="h-8 bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-4 text-center">
                                            <td colSpan={4}>{moment(date.date).format('dddd Do MMMM')}</td>
                                        </tr> 
                                        {date.data.map((booking: MergedBooking) => (
                                            <tr key={`${date.date}-${booking.callsign}-${booking.time_start ?? booking.logon_time ?? ''}`} className="h-6 even:bg-gray-50 odd:bg-white dark:even:bg-tertiary dark:odd:bg-black">
                                                {booking.logon_time ? (
                                                    <td className="pl-[4px] text-[#447b68] font-bold">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={'10px'} height={'10px'} style={{ display: 'inline', marginRight: '2px' }}>
                                                            <path fill="hsl(162, 33%, 38%)" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
                                                        </svg>
                                                        {booking.callsign}
                                                    </td>
                                                ) : (
                                                    <td className="pl-[4px]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={'10px'} height={'10px'} style={{ display: 'inline', marginRight: '2px' }}>
                                                            <path fill="grey" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                                                        </svg>
                                                        {booking.callsign}
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
                        {bookingData && Object.values(bookingData).some(date => date.data.length > 0) && (
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