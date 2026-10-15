import api from "../../../api/axios";


const PlantApi = {
    // Get all plants
    getPlants: () => api.get("/lms/plants/"),

    // Create a plant
    createPlant: (plantData) =>
        api.post("/lms/plants/", plantData),

    // Get one plant
    getPlant: (plantId) =>
        api.get(`/lms/plants/${plantId}`),

    // Update a plant
    updatePlant: (plantId, plantData) =>
        api.put(`/lms/plants/${plantId}`, plantData),

    // Delete a plant
    deletePlant: (plantId) =>
        api.delete(`/lms/plants/${plantId}`),

    // Get departments by plant
    getDepartmentsByPlant: (plantId) =>
        api.get(`/lms/plants/${plantId}/departments`),
};

export default PlantApi;
