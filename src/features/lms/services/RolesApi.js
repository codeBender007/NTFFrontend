import api from "../../../api/axios";

const RolesApi = {
  // GET /api/v1/lms/roles - Fetch all roles
  getRoles: (params) => api.get("/lms/roles", { params }),

  // GET /api/v1/lms/roles/{role_id} - Fetch single role details
  getRole: (roleId) => api.get(`/lms/roles/${roleId}`),

  // POST /api/v1/lms/roles - Create a new role (Role Name and Status payload)
  createRole: (roleData) => api.post("/lms/roles", roleData),

  // DELETE /api/v1/lms/roles/{role_id} - Delete a role
  deleteRole: (roleId) => api.delete(`/lms/roles/${roleId}`),

  // GET /api/v1/lms/roles/{role_id}/permissions - Fetch role permissions
  getRolePermissions: (roleId) => api.get(`/lms/roles/${roleId}/permissions`),

  // GET /api/v1/lms/roles/{role_id}/pages - Fetch pages and permissions associated with the role
  getRolePages: (roleId) => api.get(`/lms/roles/${roleId}/pages`),

  // PUT /api/v1/lms/roles/{role_id}/permissions - Save or update all role page permissions
  updateRolePermissions: (roleId, permissions, sync = false) =>
    api.put(`/lms/roles/${roleId}/permissions`, permissions, { params: { sync } }),

  // PUT /api/v1/lms/roles/{role_id}/permissions - Update all role permissions alias
  updateAllRolePermissions: (roleId, permissions, sync = false) =>
    api.put(`/lms/roles/${roleId}/permissions`, permissions, { params: { sync } }),

  // PUT /api/v1/lms/roles/{role_id}/permissions/{page_id} - Update page-specific permission for a role
  updateRolePagePermission: (roleId, pageId, permissionData) =>
    api.put(`/lms/roles/${roleId}/permissions/${pageId}`, permissionData),

  // DELETE /api/v1/lms/roles/{role_id}/permissions/{page_id} - Delete page permission from a role
  deleteRolePagePermission: (roleId, pageId) =>
    api.delete(`/lms/roles/${roleId}/permissions/${pageId}`),

  // PUT /api/v1/lms/users/{user_id}/role - Assign Role to User
  assignUserRole: (userId, roleData) =>
    api.put(`/lms/users/${userId}/role`, roleData),

  // GET /api/v1/lms/users/{user_id}/permissions - Get User Permissions
  getUserPermissions: (userId) =>
    api.get(`/lms/users/${userId}/permissions`),

  // GET /api/v1/lms/me/permissions - Get Current User ("Me") Permissions
  getMyPermissions: () =>
    api.get("/lms/me/permissions"),
};

export default RolesApi;
