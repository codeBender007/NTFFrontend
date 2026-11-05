import api from "../../../api/axios";

const LinesApi = {
  // Get all lines (supports optional query params: { plantId, departmentId, subDepartmentId, lineName })
  getLines: (params, config = {}) => api.get("/lms/lines/", { ...config, params }),

  // Get lines by sub-department
  getLinesBySubDepartment: (subDepartmentId, config = {}) =>
    api.get("/lms/lines/", { ...config, params: { subDepartmentId, ...(config.params || {}) } }),

  // Create a line
  createLine: (lineData) => api.post("/lms/lines/", lineData),

  // Get one line by ID
  getLine: (lineId, config = {}) => api.get(`/lms/lines/${lineId}`, config),

  // Update a line
  updateLine: (lineId, lineData) =>
    api.put(`/lms/lines/${lineId}`, lineData),

  // Delete a line
  deleteLine: (lineId) => api.delete(`/lms/lines/${lineId}`),

  // Get all machines for a line
  getMachinesByLine: (lineId, config = {}) => api.get(`/lms/lines/${lineId}/machines`, config),

  // Alias helper for machines
  getMachines: (lineId, config = {}) => api.get(`/lms/lines/${lineId}/machines`, config),
};

export default LinesApi;
