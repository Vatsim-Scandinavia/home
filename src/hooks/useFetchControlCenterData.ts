import { useEffect, useState } from "react";
import type { ControlCenterBooking } from "@/interfaces/ControlCenter";

export default function useFetchControlCenterData() {
    const [controlCenterData, setControlCenterData] = useState<ControlCenterBooking[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>();

    useEffect(() => {
        const handleFetchControlCenterData = async () => {

            try {
                const response = await fetch ('https://cc.vatsim-scandinavia.org/api/bookings');
                const data = await response.json();

                setControlCenterData(data.data);
            } catch {
                setError('Something went wrong while attempting to fetch data from the Control Center API.')
            } finally {
                setIsLoading(false);
            }

        }

        handleFetchControlCenterData();
    }, [])

    return { controlCenterData, isLoading, error }
}