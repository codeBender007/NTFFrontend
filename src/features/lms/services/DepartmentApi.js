import api from "../../../api/axios";

const DepartmentApi = {
    // Get all departments
    getDepartments: (config = {}) => api.get("/lms/departments/", config),

    // Get departments belonging to a specific plant
    getDepartmentsByPlant: (plantId, config = {}) =>
        api.get(`/lms/plants/${plantId}/departments`, config),

    // Create department
    createDepartment: (departmentData) =>
        api.post("/lms/departments/", departmentData),

    // Get one department
    getDepartment: (departmentId, config = {}) =>
        api.get(`/lms/departments/${departmentId}`, config),

    // Update department
    updateDepartment: (departmentId, departmentData) =>
        api.put(`/lms/departments/${departmentId}`, departmentData),

    // Delete department
    deleteDepartment: (departmentId) =>
        api.delete(`/lms/departments/${departmentId}`),

    // Get sub-departments
    getSubDepartments: (departmentId, config = {}) =>
        api.get(`/lms/departments/${departmentId}/sub-departments`, config),
};

export default DepartmentApi;
