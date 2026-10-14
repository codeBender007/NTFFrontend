import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const MachinesApi = {
  // Get all machines (supports query params: { plantId, departmentId, subDepartmentId, lineId, machineName })
  getMachines: (params) => api.get("/lms/machines/", { params }),

  // Get machines for a specific line
  getMachinesByLine: (lineId) =>
    api.get("/lms/machines/", { params: { lineId } }),

  // Create machine
  createMachine: (machineData) =>
    api.post("/lms/machines/", machineData),

  // Get one machine by ID
  getMachine: (machineId) =>
    api.get(`/lms/machines/${machineId}`),

  // Update machine
  updateMachine: (machineId, machineData) =>
    api.put(`/lms/machines/${machineId}`, machineData),

  // Delete machine
  deleteMachine: (machineId) =>
    api.delete(`/lms/machines/${machineId}`),
};

export default MachinesApi;
