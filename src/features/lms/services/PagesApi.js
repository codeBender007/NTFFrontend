import api from "../../../api/axios";

/**
 * LMS Pages API Service
 * Interacts with /api/v1/lms/pages endpoints
 */
const PagesApi = {
  // 1. POST /api/v1/lms/pages - Create a new page
  createPage: (pageData) => api.post("/lms/pages", pageData),

  // 2. GET /api/v1/lms/pages - Retrieve all configured pages (supports optional module, skip, limit)
  getPages: (params) => api.get("/lms/pages", { params }),

  // 3. GET /api/v1/lms/pages/assigned - Retrieve assigned pages & permissions for a specific role
  getAssignedPages: (roleId, params = {}) =>
    api.get("/lms/pages/assigned", { params: { roleId, ...params } }),

  // 4. PUT /api/v1/lms/pages/{page_id} - Update an existing page configuration
  updatePage: (pageId, pageData) => api.put(`/lms/pages/${pageId}`, pageData),

  // 5. DELETE /api/v1/lms/pages/{page_id} - Delete a page and its associated role permissions
  deletePage: (pageId) => api.delete(`/lms/pages/${pageId}`),
};

export default PagesApi;
