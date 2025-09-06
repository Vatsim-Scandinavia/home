import type { ForumData } from "@/interfaces/Forum";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook to fetch forum data.
 * @returns Forum data, loading state, error state, and a refetch function.
 */
export default function useFetchForumData(): {
    forumData: ForumData | undefined;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
} {
    const [forumData, setForumData] = useState<ForumData>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleFetchForumData = useCallback(async () => {

        try {
            const response = await fetch ('https://forum.vatsim-scandinavia.org/api/discussions?filter[tag]=announcements');
            const data = await response.json();

            setForumData(data);
        } catch {
            setError('Something went wrong while attempting to fetch data from the forum API.')
        } finally {
            setIsLoading(false);
        }

    }, [])

    useEffect(() => {
        handleFetchForumData();
    }, [])

    return { forumData, isLoading, error, refetch: handleFetchForumData }
}