import api from "../../../api/axios.js";

// Cache for plants list to avoid redundant requests across components and page navigations
let plantsCache = null;
let plantsInFlightPromise = null;

const PlantApi = {
    /**
     * Get all plants with in-memory caching and in-flight request deduplication.
     * @param {Object} [options]
     * @param {boolean} [options.forceRefresh=false] - Force bypass of cached data
     * @param {AbortSignal} [options.signal] - AbortController signal
     * @returns {Promise<any>}
     */
    getPlants: (options = {}) => {
        const forceRefresh = options?.forceRefresh === true;
        const signal = options?.signal;

        // If cached and fresh, return cached response directly
        if (plantsCache && !forceRefresh) {
            return Promise.resolve(plantsCache);
        }

        // If a request is already in-flight, reuse the shared in-flight promise
        if (plantsInFlightPromise && !forceRefresh) {
            return plantsInFlightPromise;
        }

        const axiosConfig = signal ? { signal } : {};
        const requestPromise = api
            .get("/lms/plants/", axiosConfig)
            .then((res) => {
                plantsCache = res;
                return res;
            })
            .catch((err) => {
                // If this request failed or was aborted, clear cache so future attempts can retry
                plantsCache = null;
                throw err;
            })
            .finally(() => {
                plantsInFlightPromise = null;
            });

        // Store active in-flight request unless already aborted
        if (!signal?.aborted) {
            plantsInFlightPromise = requestPromise;
        }

        return requestPromise;
    },

    /**
     * Invalidate cached plants data (e.g. after mutations).
     */
    clearCache: () => {
        plantsCache = null;
        plantsInFlightPromise = null;
    },

    // Create a plant
    createPlant: async (plantData) => {
        const res = await api.post("/lms/plants/", plantData);
        PlantApi.clearCache();
        return res;
    },

    // Get one plant
    getPlant: (plantId, config = {}) =>
        api.get(`/lms/plants/${plantId}`, config),

    // Update a plant
    updatePlant: async (plantId, plantData) => {
        const res = await api.put(`/lms/plants/${plantId}`, plantData);
        PlantApi.clearCache();
        return res;
    },

    // Delete a plant
    deletePlant: async (plantId) => {
        const res = await api.delete(`/lms/plants/${plantId}`);
        PlantApi.clearCache();
        return res;
    },

    // Get departments by plant
    getDepartmentsByPlant: (plantId, config = {}) =>
        api.get(`/lms/plants/${plantId}/departments`, config),
};

export default PlantApi;
