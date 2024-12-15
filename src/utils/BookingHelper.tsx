import moment from "moment";
import positions from "../components/positions.json";

function startsWithSameICAO(callsign1: string, callsign2: string) {
    if (callsign1.substring(0, 4) === callsign2.substring(0, 4)) {
        return true;
    }

    return false;
}

function getBookableCallsign(callsign: string, frequency: string) {
    let correctedCallsign = callsign;
    positions.forEach(position => {
        if(position['frequency'] === frequency && startsWithSameICAO(position['callsign'], callsign)) {
        correctedCallsign = position['callsign'];
        }
    });
    return correctedCallsign;
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