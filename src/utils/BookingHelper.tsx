import moment from "moment";
import PositionDataFetcher from "./PositionDataFetcher";

const fetchPositionData = async () => {
    const apiEndpoint = "https://cc.vatsim-scandinavia.org/api/positions";

    try {
        const data = await PositionDataFetcher.fetchPositionData(apiEndpoint);
        return data;
    } catch (error) {
        console.error("Error accessing position data:", error);
        return null;
    }
};

const getPositionFromFrequency = async (callsign: string, frequency: string) => {
    try {
        const positionData = await fetchPositionData();

        if (!positionData?.data) {
            console.warn('No position data available');
            return null;
        }

        const matchingPosition = positionData.data.find(
            (position:
                { frequency: string; callsign: string; }
            ) => position.frequency === frequency && position.callsign.substring(0,4) == callsign.substring(0,4)
        );

        return matchingPosition?.callsign || null;
    } catch (error) {
        console.error('An error occured while trying get position', error);
    }
}

function parseControlCenterDate(dateString: string) {
    if (!dateString) return moment();

    return moment.utc(dateString);
}

function bookingType(booking: any) {
    if (booking.training === 1) {
        return <span className="bg-[#1a475f] text-xs text-white px-2 py-[2px] rounded-md flex items-center justify-center">Training</span>
    } else if (booking.event === 1) {
        return <span className="bg-[#41826e] text-xs text-white px-2 py-[2px] rounded-md flex items-center justify-center">Event</span>
    } else if (booking.exam === 1) {
        return <span className="bg-[#b63f3f] text-xs text-white px-2 py-[2px] rounded-md flex items-center justify-center">Exam</span>
    } else {
        return ""
    }
}

function formatAsZulu(timestring: string) {
    return moment.utc(timestring).format('HH:mm') + 'z';
}

export { parseControlCenterDate, bookingType, formatAsZulu, getPositionFromFrequency };