import api from "../../../api/axios";

const LinesApi = {
  // Get all lines (supports optional query params: { plantId, departmentId, subDepartmentId, lineName })
  getLines: (params) => api.get("/lms/lines/", { params }),

  // Get lines by sub-department
  getLinesBySubDepartment: (subDepartmentId) =>
    api.get("/lms/lines/", { params: { subDepartmentId } }),

  // Create a line
  createLine: (lineData) => api.post("/lms/lines/", lineData),

  // Get one line by ID
  getLine: (lineId) => api.get(`/lms/lines/${lineId}`),

  // Update a line
  updateLine: (lineId, lineData) =>
    api.put(`/lms/lines/${lineId}`, lineData),

  // Delete a line
  deleteLine: (lineId) => api.delete(`/lms/lines/${lineId}`),

  // Get all machines for a line
  getMachinesByLine: (lineId) => api.get(`/lms/lines/${lineId}/machines`),

  // Alias helper for machines
  getMachines: (lineId) => api.get(`/lms/lines/${lineId}/machines`),
};

export default LinesApi;
