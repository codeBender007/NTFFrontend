import api from "../../../api/axios";

const MachinesApi = {
  // Get all machines (supports query params: { plantId, departmentId, subDepartmentId, lineId, machineName })
  getMachines: (params, config = {}) => api.get("/lms/machines/", { ...config, params }),

  // Get machines for a specific line
  getMachinesByLine: (lineId, config = {}) =>
    api.get("/lms/machines/", { ...config, params: { lineId, ...(config.params || {}) } }),

  // Create machine
  createMachine: (machineData) =>
    api.post("/lms/machines/", machineData),

  // Get one machine by ID
  getMachine: (machineId, config = {}) =>
    api.get(`/lms/machines/${machineId}`, config),

  // Update machine
  updateMachine: (machineId, machineData) =>
    api.put(`/lms/machines/${machineId}`, machineData),

  // Delete machine
  deleteMachine: (machineId) =>
    api.delete(`/lms/machines/${machineId}`),
};

export default MachinesApi;
