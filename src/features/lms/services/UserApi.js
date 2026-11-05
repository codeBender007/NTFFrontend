import api from "../../../api/axios";

const UserApi = {
  // GET - /lms/users/
  // Filters: plantId, departmentId, subDepartmentId, lineId, machineId, shift, startDate, endDate, skillLevel, active, skip, limit
  getUsers: (params) => api.get("/lms/users/", { params }),

  // POST - /lms/users/
  createUser: (userData) => api.post("/lms/users/", userData),

  // GET - /lms/users/{userId}
  getUser: (userId) => api.get(`/lms/users/${userId}`),

  // PUT - /lms/users/{userId}
  updateUser: (userId, userData) =>
    api.put(`/lms/users/${userId}`, userData),

  // DELETE - /lms/users/{userId}
  deleteUser: (userId) => api.delete(`/lms/users/${userId}`),

  // POST - /lms/users/upload-excel
  uploadExcel: (formData, onUploadProgress) =>
    api.post("/lms/users/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }),

  // PUT - /api/v1/lms/users/{user_id}/role - Assign Role to User
  assignUserRole: (userId, roleData) =>
    api.put(`/lms/users/${userId}/role`, roleData),

  // GET - /api/v1/lms/users/{user_id}/permissions - Get User Permissions
  getUserPermissions: (userId) =>
    api.get(`/lms/users/${userId}/permissions`),

  // GET - /api/v1/lms/me/permissions - Get Current User ("Me") Permissions
  getMyPermissions: () =>
    api.get("/lms/me/permissions"),
};

export default UserApi;
