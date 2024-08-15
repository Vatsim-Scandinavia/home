import React, { useEffect, useState } from "react";
import bookingType from "../utils/bookingType";
import convertZulu from "../utils/convertZulu";
import fixNetworkTime from "../utils/fixNetworkTime";
import {ExternalLinkIcon} from './icons/ExternalLinkIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"
import "../globals.css";
import positions from "./positions.json";


const BookingComponent = () => {
  const [ControlCenterBookings, setControlCenterBookings] = useState([]);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const ControlCenterBookingsFetch = await fetch(
          "https://cc.vatsim-scandinavia.org/api/bookings"
        );
        const ControlCenterBookings = await ControlCenterBookingsFetch.json();

        const VATSIMNetworkDataFetch = await fetch(
          "https://data.vatsim.net/v3/vatsim-data.json"
        );
        const VATSIMNetworkData = await VATSIMNetworkDataFetch.json();

        let startDate = new Date();
        let endDate = new Date(new Date().setDate(new Date().getDate() + 7))

        let dateArray = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            // Convert the date to a string (optional, for better readability)
            let dateString = d.toISOString().split('T')[0];

            // Add the date and an empty sub-array to the main array
            dateArray.push({
                date: dateString,
                data: []
            });
        }

        const acceptedFIRsRegex = /((EK[A-Z][A-Z]_)|(EF[A-Z][A-Z]_)|(BI[A-Z][A-Z]_)|(EN[A-Z][A-Z]_)|(ES[A-Z][A-Z]_))\w+/i;

        ControlCenterBookings.data.forEach(booking => {
          const bookingDate = new Date(booking.time_start).toISOString().split('T')[0];
          const dateIndex = dateArray.findIndex(dateObj => dateObj.date === bookingDate);
          if (dateIndex !== -1) {
            dateArray[dateIndex].data.push(booking);
          }
        });

        VATSIMNetworkData.controllers.forEach(session => {
          if (acceptedFIRsRegex.test(session.callsign)) {
            dateArray[0].data.push(session);
          }
        });



        setControlCenterBookings(dateArray);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBookingData();

  }, []);

  console.log(ControlCenterBookings);

  return (
    <table className="w-full h-full px-2">
      <tbody className="h-full">
        {ControlCenterBookings.map((date, index) => (
          <React.Fragment key={index}>
            <tr className="bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-4 text-center">
              <td colSpan={4}>{new Date(date.date).toDateString()}</td>
            </tr>
            {date.data.map((booking) => (
              <tr key={booking.id} className="h-6 even:bg-gray-50 odd:bg-white dark:even:bg-tertiary dark:odd:bg-black">
                <td className="pl-[4px]">{booking.callsign}</td>
                <td className="pl-[4px]">{bookingType(booking)}</td>
                <td className="pl-[4px]">{convertZulu(booking.time_start)}</td>
                <td className="pl-[4px]">{convertZulu(booking.time_end)}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default BookingComponent;
