import api from "../../../api/axios";

const SubDepartmentApi = {
  // Get all sub-departments belonging to a specific department
  getSubDepartmentsByDepartment: (departmentId, config = {}) =>
    api.get(`/lms/departments/${departmentId}/sub-departments`, config),

  // Get all sub-departments (supports optional query params: { plantId, departmentId, subDepartmentName })
  getSubDepartments: (params, config = {}) =>
    api.get("/lms/sub-departments/", { ...config, params }),

  // Create sub-department
  createSubDepartment: (subDepartmentData) =>
    api.post("/lms/sub-departments/", subDepartmentData),

  // Get one sub-department
  getSubDepartment: (subDepartmentId, config = {}) =>
    api.get(`/lms/sub-departments/${subDepartmentId}`, config),

  // Update sub-department
  updateSubDepartment: (subDepartmentId, subDepartmentData) =>
    api.put(`/lms/sub-departments/${subDepartmentId}`, subDepartmentData),

  // Delete sub-department
  deleteSubDepartment: (subDepartmentId) =>
    api.delete(`/lms/sub-departments/${subDepartmentId}`),

  // Get lines belonging to a specific sub-department
  getLinesBySubDepartment: (subDepartmentId, config = {}) =>
    api.get(`/lms/sub-departments/${subDepartmentId}/lines`, config),

  // Alias for getLinesBySubDepartment
  getLines: (subDepartmentId, config = {}) =>
    api.get(`/lms/sub-departments/${subDepartmentId}/lines`, config),
};

export default SubDepartmentApi;
