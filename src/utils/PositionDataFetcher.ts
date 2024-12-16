const PositionDataFetcher = (() => {
    let cachedPositionData: any = null; // Cache variable for storing fetched data
    let fetchInProgress: any = null; // Promise to track ongoing fetch

    return {
        fetchPositionData: async (apiEndpoint: string) => {
            if (cachedPositionData) {
                return cachedPositionData; // Return cached data if available
            }

            if (fetchInProgress) {
                return fetchInProgress; // Return the ongoing fetch Promise
            }

            fetchInProgress = fetch(apiEndpoint)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch data: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    cachedPositionData = data; // Cache the data
                    fetchInProgress = null; // Reset fetch tracking
                    return data;
                })
                .catch((error) => {
                    fetchInProgress = null; // Reset fetch tracking on error
                    console.error(error);
                    throw error;
                });

            return fetchInProgress; // Return the ongoing Promise
        },
    };
})();

export default PositionDataFetcher;
