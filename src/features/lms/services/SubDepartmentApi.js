import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const SubDepartmentApi = {
  // Get all sub-departments belonging to a specific department
  getSubDepartmentsByDepartment: (departmentId) =>
    api.get(`/lms/departments/${departmentId}/sub-departments`),

  // Get all sub-departments (supports optional query params: { plantId, departmentId, subDepartmentName })
  getSubDepartments: (params) =>
    api.get("/lms/sub-departments/", { params }),

  // Create sub-department
  createSubDepartment: (subDepartmentData) =>
    api.post("/lms/sub-departments/", subDepartmentData),

  // Get one sub-department
  getSubDepartment: (subDepartmentId) =>
    api.get(`/lms/sub-departments/${subDepartmentId}`),

  // Update sub-department
  updateSubDepartment: (subDepartmentId, subDepartmentData) =>
    api.put(`/lms/sub-departments/${subDepartmentId}`, subDepartmentData),

  // Delete sub-department
  deleteSubDepartment: (subDepartmentId) =>
    api.delete(`/lms/sub-departments/${subDepartmentId}`),

  // Get lines belonging to a specific sub-department
  getLinesBySubDepartment: (subDepartmentId) =>
    api.get(`/lms/sub-departments/${subDepartmentId}/lines`),

  // Alias for getLinesBySubDepartment
  getLines: (subDepartmentId) =>
    api.get(`/lms/sub-departments/${subDepartmentId}/lines`),
};

export default SubDepartmentApi;
