import React, { useState, useEffect } from 'react';
import axios from 'axios';
import convertZulu from "../utils/convertZulu";
import fixNetworkTime from "../utils/fixNetworkTime";
import bookingType from "../utils/bookingType";
import positions from './positions.json';

interface Controller {
    "cid": number,
    "name": string,
    "callsign": string,
    "frequency": string,
    "facility": number,
    "rating": number,
    "server": string,
    "visual_range": number,
    "text_atis": [],
    "last_updated": string,
    "logon_time": string
}

function isVATSCAController(controller: Controller) {
    const acceptedFIRsRegex = /((EK[A-Z][A-Z]_)|(EF[A-Z][A-Z]_)|(BI[A-Z][A-Z]_)|(EN[A-Z][A-Z]_)|(ES[A-Z][A-Z]_))\w+/i;
    return positions.some((position) => {
        return position.frequency === controller.frequency && acceptedFIRsRegex.test(controller.callsign)
    });
}



const LiveAndBookingSession = () => {
    const [vatsimAPIData, setVatsimAPIData] = useState([]);
    const [controlCenterData, setControlCenterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios({ method: 'get', url: `https://data.vatsim.net/v3/vatsim-data.json`, withCredentials: false });
                const response2 = await axios({ method: 'get', url: `https://cc.vatsim-scandinavia.org/api/bookings`, withCredentials: false });
                setVatsimAPIData(response.data.controllers);

                // Group the response2 data by time_start
                const groupedData = response2.data.data.reduce((acc: any, item: any) => {
                    const key = item.time_start;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(item);
                    return acc;
                }, {});

                setControlCenterData(groupedData);
            } catch (error) {
                setError((error as any).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
    }, []);

    if (loading) {
        return <div className='w-full h-full bg-white dark:bg-secondary flex justify-center items-center text-secondary dark:text-white text-xl'>
            <iframe src="https://lottie.host/embed/e516525c-74c1-4db5-b2b2-bb135366e103/W8AodEgALN.json" className="w-full h-full" />
        </div>;
    }

    if (error) {
        return <div className='w-full h-full bg-white flex justify-center items-center text-secondary text-xl'>Error: {error}</div>;
    }

    console.log(controlCenterData)

    return (
        <div>
            <table className='w-full table-auto'>
                <tbody>
                    {vatsimAPIData.map((item: Controller) => (
                        <>
                            {isVATSCAController(item) ?
                                <tr className='even:bg-gray-50 even:dark:bg-gray-500 odd:bg-white odd:dark:bg-black' key={item.id}>
                                    <td>{item.callsign}</td>
                                    <td></td>
                                    <td>{convertZulu(fixNetworkTime(item.logon_time))}</td>
                                    <td></td>
                                </tr>
                                : null
                            }
                        </>
                    ))}
                    {
                        Object.keys(controlCenterData).map((date, index) => (
                            <React.Fragment key={index}>
                                <tr className="bg-snow dark:bg-secondary w-full font-bold text-black dark:text-white py-4 text-center" key={index}>
                                    <td colSpan={4} className="py-1">
                                        {new Date(date).toLocaleString('en-uk', {  weekday: 'long', month: 'long', day: 'numeric' })}
                                    </td>
                                </tr>
                                {
                                    controlCenterData[date].map((item: any, index: number) => (
                                        <tr className='even:bg-gray-50 even:dark:bg-gray-500 odd:bg-white odd:dark:bg-black' key={index}>
                                            <td>{item.callsign}</td>
                                            <td>{bookingType(item)}</td>
                                            <td>{convertZulu(item.time_start)}</td>
                                            <td>{convertZulu(item.time_end)}</td>
                                        </tr>
                                    ))
                                }
                            </React.Fragment>
                        ))
                    }
                    <tr className="bg-snow dark:bg-tertiary w-full font-bold text-black dark:text-white p-2 text-center h-12">
                        <td colSpan={4}>
                            <a href="https://cc.vatsim-scandinavia.org/booking" target="_blank" className="underline hover:no-underline">
                            See all bookings
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default LiveAndBookingSession;
