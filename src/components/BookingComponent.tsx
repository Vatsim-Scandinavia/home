import React from "react";
import moment from "moment";
import { formatAsZulu } from "../utils/BookingHelper";
import bookingType from "./BookingType";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import useBookingData from "@/hooks/useBookingData";
import type { MergedBooking } from "@/interfaces/Booking";
import Skeleton from "./ui/bookings/Skeleton";


const BookingComponent = () => {
    const { bookingData, isLoading, error } = useBookingData();

    // Country filter: ICAO prefixes + flag SVG icons
    type CountryOption = { prefixes: string[]; label: string; icon: string };
    const COUNTRIES: CountryOption[] = [
        { prefixes: ['EK'], label: 'Denmark', icon: '/img/icons/DK.svg' },
        { prefixes: ['ES'], label: 'Sweden',  icon: '/img/icons/SE.svg' },
        { prefixes: ['EN'], label: 'Norway',  icon: '/img/icons/NO.svg' },
        { prefixes: ['EF'], label: 'Finland', icon: '/img/icons/FI.svg' },
        // Iceland FIR also covers BG (Greenland)
        { prefixes: ['BI', 'BG'], label: 'Iceland', icon: '/img/icons/IS.svg' },
    ];

    const [selectedPrefixes, setSelectedPrefixes] = React.useState<string[]>([]);
    const POSITIONS = [
        { key: 'GND', label: 'GND' },
        { key: 'TWR', label: 'TWR' },
        { key: 'APP', label: 'APP' },
        { key: 'CTR', label: 'CTR' },
    ] as const;
    const [selectedPositions, setSelectedPositions] = React.useState<string[]>([]);
    const [countryOpen, setCountryOpen] = React.useState(false);
    const [positionOpen, setPositionOpen] = React.useState(false);
    const countryRef = React.useRef<HTMLDivElement | null>(null);
    const positionRef = React.useRef<HTMLDivElement | null>(null);

    const toggleCountry = (prefixes: string[]) => {
        setSelectedPrefixes(prev => {
            const allSelected = prefixes.every(pref => prev.includes(pref));
            if (allSelected) {
                // remove all
                return prev.filter(p => !prefixes.includes(p));
            }
            // add missing
            const toAdd = prefixes.filter(pref => !prev.includes(pref));
            return [...prev, ...toAdd];
        });
    };

    const isCountrySelected = (prefixes: string[]) => prefixes.every(pref => selectedPrefixes.includes(pref));
    const togglePosition = (pos: string) => {
        setSelectedPositions(prev =>
            prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
        );
    };
    const isPositionSelected = (pos: string) => selectedPositions.includes(pos);

    // Close dropdowns on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (countryRef.current && !countryRef.current.contains(target)) {
                setCountryOpen(false);
            }
            if (positionRef.current && !positionRef.current.contains(target)) {
                setPositionOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Determine first date section that actually has rows after filtering
    const datesArray = bookingData ? Object.values(bookingData) : [];
    const matchesFilters = (b: MergedBooking) => {
        const cs = (b.callsign || '').toUpperCase();
        const prefixOk = selectedPrefixes.length === 0 || selectedPrefixes.some(pref => cs.startsWith(pref));
        const posOk = selectedPositions.length === 0 || selectedPositions.some(pos => cs.includes(`_${pos}`));
        return prefixOk && posOk;
    };
    const getFilteredForDate = (d: { data: MergedBooking[] }) => d.data.filter(matchesFilters);
    // No need to track first index with data now that filters live in a top row

    return (
        <div className="h-full flex flex-col">
            <table className="w-full px-2">
                <tbody>
                {isLoading ? (
                    (!error) ? (
                        <Skeleton count={5}/>
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center text-danger">
                                <p className="font-bold text-2xl">Mayday..</p>
                                <p className="italic">{error}</p>
                            </td>
                        </tr>
                    )   
                ) : (
                    <>
                        {/* Filter row */}
                        {!isLoading && (
                            <tr className="bg-snow dark:bg-secondary w-full text-black dark:text-white">
                                <td colSpan={4} className="px-2 py-2">
                                    <div className="flex flex-wrap items-center gap-2 justify-around">
                                        <div className="relative" ref={countryRef}>
                                            <button
                                                onClick={() => setCountryOpen(o => !o)}
                                                className="flex items-center gap-1 bg-transparent px-1 py-1 hover:underline"
                                                aria-haspopup="listbox"
                                                aria-expanded={countryOpen}
                                            >
                                                <span className="text-sm">Country</span>
                                                <img src="/img/icons/Arrow.svg" alt="Open" className={`h-3 w-3 ml-0.5 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {countryOpen && (
                                                <div className="absolute mt-1 w-56 z-10 rounded-md border bg-white dark:bg-black border-gray-200 dark:border-gray-700 shadow">
                                                    <ul role="listbox" className="max-h-60 overflow-auto py-1">
                                                        {COUNTRIES.map(c => (
                                                            <li key={`country-${c.label}`} role="option" aria-selected={isCountrySelected(c.prefixes)}>
                                                                <button
                                                                    onClick={() => toggleCountry(c.prefixes)}
                                                                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-tertiary text-left"
                                                                >
                                                                    <img src={c.icon} alt={c.label} className="h-4 w-6 rounded-sm border border-gray-300 dark:border-gray-700" />
                                                                    <span className="text-sm">{c.label} <span className="text-gray-500">({c.prefixes.join(',')})</span></span>
                                                                    <span className="ml-auto text-primary text-xs">{isCountrySelected(c.prefixes) ? '✓' : ''}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative" ref={positionRef}>
                                            <button
                                                onClick={() => setPositionOpen(o => !o)}
                                                className="flex items-center gap-1 bg-transparent px-1 py-1 hover:underline"
                                                aria-haspopup="listbox"
                                                aria-expanded={positionOpen}
                                            >
                                                <span className="text-sm">Position</span>
                                                <img src="/img/icons/Arrow.svg" alt="Open" className={`h-3 w-3 ml-0.5 transition-transform ${positionOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {positionOpen && (
                                                <div className="absolute mt-1 w-48 z-10 rounded-md border bg-white dark:bg-black border-gray-200 dark:border-gray-700 shadow">
                                                    <ul role="listbox" className="max-h-60 overflow-auto py-1">
                                                        {POSITIONS.map(p => (
                                                            <li key={p.key} role="option" aria-selected={isPositionSelected(p.key)}>
                                                                <button
                                                                    onClick={() => togglePosition(p.key)}
                                                                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-tertiary text-left"
                                                                >
                                                                    <span className="text-sm">{p.label}</span>
                                                                    <span className="ml-auto text-primary text-xs">{isPositionSelected(p.key) ? '✓' : ''}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        {/* No global clear button by request */}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {bookingData && datesArray.map((date, index) => (
                            <React.Fragment key={index}>
                                {(() => {
                                    const filteredData: MergedBooking[] = getFilteredForDate(date);
                                    return filteredData.length > 0 ? (
                                    <>
                                       <tr className="h-8 bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-4 text-center">
                                            <td colSpan={4}>
                                                <div className="px-2">{moment(date.date).format('dddd Do MMMM')}</div>
                                            </td>
                                        </tr>
                                        {filteredData.map((booking: MergedBooking) => (
                                            <tr key={`${date.date}-${booking.callsign}-${booking.time_start ?? booking.logon_time ?? ''}`} className="h-7 even:bg-gray-50 odd:bg-white dark:even:bg-tertiary dark:odd:bg-black">
                                                {booking.logon_time ? (
                                                    <td className="pl-[4px] text-[#447b68] font-bold">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={'10px'} height={'10px'} className="inline mr-[4px] align-baseline">
                                                            <path fill="hsl(162, 33%, 38%)" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
                                                        </svg>
                                                        {booking.callsign}
                                                    </td>
                                                ) : (
                                                    <td className="pl-[4px]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={'10px'} height={'10px'} className="inline mr-[4px] align-baseline">
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
                                ) : null
                                })()}
                            </React.Fragment>
                        ))}
                        
                    </>
                )}
                </tbody>
            </table>

            {/* Stretchy bottom area for the "See all bookings" link */}
            {bookingData && Object.values(bookingData).some(date => date.data.length > 0) && !isLoading && (
                <div className="bg-snow dark:bg-secondary text-black dark:text-white text-center flex-1 flex items-center justify-center">
                    <div className="underline hover:no-underline text-md">
                        <a href="https://cc.vatsim-scandinavia.org/booking" target="_blank" className="underline hover:no-underline">
                            See all bookings
                        </a>
                        <ExternalLinkIcon width="0.75rem" marginLeft="0.3rem" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingComponent;
