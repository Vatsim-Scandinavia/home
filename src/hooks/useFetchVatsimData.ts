import { useEffect, useState } from "react";
import type { vatsimSession } from "@/interfaces/Vatsim";

export default function useFetchVatsimData() {
    const [vatsimData, setVatsimData] = useState<vatsimSession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>();

    useEffect(() => {
        const handleFetchVatsimData = async () => {

            try {
                const response = await fetch ('https://data.vatsim.net/v3/vatsim-data.json');
                const data = await response.json();

                setVatsimData(data.controllers);
            } catch {
                setError('Something went wrong while attempting to fetch data from the VATSIM data API.')
            } finally {
                setIsLoading(false);
            }

        }

        handleFetchVatsimData();
    }, [])

    return { vatsimData, isLoading, error }
}