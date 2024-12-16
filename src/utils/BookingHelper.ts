import moment from "moment";
import PositionDataFetcher from "./PositionDataFetcher";

const fetchPositionData = async () => {
    const apiEndpoint = "https://cc.vatsim-scandinavia.org/api/positions";

    try {
        return await PositionDataFetcher.fetchPositionData(apiEndpoint);
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

function formatAsZulu(timestring: string) {
    return moment.utc(timestring).format('HH:mm') + 'z';
}

export { parseControlCenterDate, formatAsZulu, getPositionFromFrequency };