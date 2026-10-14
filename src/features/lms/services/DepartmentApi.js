
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const DepartmentApi = {
    // Get all departments
    getDepartments: () => api.get("/lms/departments/"),

    // Get departments belonging to a specific plant
    getDepartmentsByPlant: (plantId) =>
        api.get(`/lms/plants/${plantId}/departments`),

    // Create department
    createDepartment: (departmentData) =>
        api.post("/lms/departments/", departmentData),

    // Get one department
    getDepartment: (departmentId) =>
        api.get(`/lms/departments/${departmentId}`),

    // Update department
    updateDepartment: (departmentId, departmentData) =>
        api.put(`/lms/departments/${departmentId}`, departmentData),

    // Delete department
    deleteDepartment: (departmentId) =>
        api.delete(`/lms/departments/${departmentId}`),

    // Get sub-departments
    getSubDepartments: (departmentId) =>
        api.get(`/lms/departments/${departmentId}/sub-departments`),
};

export default DepartmentApi;
