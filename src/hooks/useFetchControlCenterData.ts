import { useCallback, useEffect, useState } from "react";
import type { ControlCenterBooking } from "@/interfaces/ControlCenter";

/**
 * Custom hook to fetch Control Center booking data.
 * @returns Control Center booking data, loading state, error state, and a refetch function.
 */
export default function useFetchControlCenterData(): {
    controlCenterData: ControlCenterBooking[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
} {
    const [controlCenterData, setControlCenterData] = useState<ControlCenterBooking[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleFetchControlCenterData = useCallback(async () => {

        try {
            const response = await fetch ('https://cc.vatsim-scandinavia.org/api/bookings');
            const data = await response.json();

            setControlCenterData(data.data);
        } catch {
            setError('Something went wrong while attempting to fetch data from the Control Center API.')
        } finally {
            setIsLoading(false);
        }

    }, [])

    useEffect(() => {
        handleFetchControlCenterData();
    }, [])

    return { controlCenterData, isLoading, error, refetch: handleFetchControlCenterData }
}