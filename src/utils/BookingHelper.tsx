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

function startsWithSameICAO(callsign1: string, callsign2: string) {
    if (callsign1.substring(0, 4) === callsign2.substring(0, 4)) {
        return true;
    }

    return false;
}

async function getBookableCallsign(callsign: string, frequency: string) {
    const positionData = await fetchPositionData();

    if(!positionData?.data) {
        console.error('ATC Position data is missing or malformed.');
        return callsign;
    }

    const correctedCallsign = positionData.data.find(
        (position: { frequency: string; callsign: string }) =>
            position.frequency === frequency && startsWithSameICAO(position.callsign, callsign)
    )?.callsign;

    return correctedCallsign || callsign;
}

function parseControlCenterDate(dateString: string) {
    if (!dateString) return moment();

    return moment(dateString).utc();
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

export { startsWithSameICAO, getBookableCallsign, parseControlCenterDate, bookingType, formatAsZulu };