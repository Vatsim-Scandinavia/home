import React, { useEffect, useState } from "react";


const BookingComponent = () => {
    const [ControlCenterBookings, setControlCenterBookings] = useState([]);
    const [ControlCenterPositions, setControlCenterPositions] = useState([]);
    const [VatsimNetworkSessions, setVatsimNetworkSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch data
     */
    const fetchComponentData = async () => {
        try {
            let [ControlCenterBookingsData, ControlCenterPositionsData, VatsimNetworkSessionsData] = await Promise.all([
                fetch('https://cc.vatsim-scandinavia.org/api/bookings'),
                fetch('https://cc.vatsim-scandinavia.org/api/positions'),
                fetch('https://data.vatsim.net/v3/vatsim-data.json'),
            ]);

            ControlCenterBookingsData = await ControlCenterBookingsData.json();
            ControlCenterPositionsData = await ControlCenterPositionsData.json();
            VatsimNetworkSessionsData = await VatsimNetworkSessionsData.json();

            setControlCenterBookings(ControlCenterBookingsData);
            setControlCenterPositions(ControlCenterPositionsData);
            setVatsimNetworkSessions(VatsimNetworkSessionsData);
        } catch (error) {
            console.log('Error while fetching data:', error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchComponentData(),
            ]);
            setLoading(false);
        }

        fetchData();

        const interval = setInterval(fetchData, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <table>
            <tbody>
                <tr></tr>
            </tbody>
        </table>
      );
};

export default BookingComponent;