import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Building2,
  CirclePlus,
  Pencil,
  Trash2,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import buildPaths from "../utils/hierarchyPaths";
import DepartmentApi from "../services/DepartmentApi";
import SubDepartmentApi from "../services/SubDepartmentApi";
import PlantApi from "../services/PlantApi";

// Map the backend response onto the shape the UI renders.
const normalizeDepartment = (department) => ({
  ...department,
  id: department?.id ?? department?.department_id ?? department?.departmentId,
  name:
    department?.departmentName ??
    department?.name ??
    department?.department_name ??
    "Unnamed department",
  plantId: department?.plantId ?? department?.plant_id,
});

const normalizeSubDepartment = (subDepartment) => ({
  ...subDepartment,
  id:
    subDepartment?.id ??
    subDepartment?.sub_department_id ??
    subDepartment?.subDepartmentId,
  departmentId:
    subDepartment?.departmentId ?? subDepartment?.department_id,
});

// The list endpoints return a JSON array, but tolerate wrapped shapes too.
const getList = (data) => {
  if (Array.isArray(data)) return data;
  const nested = data?.data ?? data?.items ?? data?.results;
  return Array.isArray(nested) ? nested : [];
};

export default function Department() {
  const navigate = useNavigate();
  const { plantId } = useParams();
  const paths = buildPaths(plantId);

  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [plantName, setPlantName] = useState(
    plantId ? `Plant #${plantId}` : "",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");

  const [addModal, setAddModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [saving, setSaving] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const departmentRequest = plantId
          ? DepartmentApi.getDepartmentsByPlant(plantId)
          : DepartmentApi.getDepartments();
        const subDepartmentRequest = plantId
          ? SubDepartmentApi.getSubDepartments({ plantId })
          : SubDepartmentApi.getSubDepartments();

        const [departmentsResponse, subDepartmentsResponse] = await Promise.all(
          [departmentRequest, subDepartmentRequest],
        );

        if (cancelled) return;
        setDepartments(getList(departmentsResponse.data).map(normalizeDepartment));
        setSubDepartments(
          getList(subDepartmentsResponse.data).map(normalizeSubDepartment),
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.detail ||
            "Unable to load departments from the server.",
        );
        console.error("Get departments API error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [plantId, reloadKey]);

  // The plant name is only needed for the breadcrumb, so a failure here
  // should not block the page.
  useEffect(() => {
    let cancelled = false;

    const fetchPlantName = async () => {
      if (!plantId) return;
      try {
        const response = await PlantApi.getPlant(plantId);
        const name = response?.data?.plantName ?? response?.data?.name;
        if (!cancelled && name) setPlantName(name);
      } catch (err) {
        console.warn("Unable to load plant name:", err);
      }
    };

    fetchPlantName();

    return () => {
      cancelled = true;
    };
  }, [plantId]);

  /* ===================== DERIVED DATA ===================== */

  const plantDepartments = plantId
    ? departments.filter(
        (department) => String(department.plantId) === String(plantId),
      )
    : departments;

  const subDepartmentCount = (departmentId) =>
    subDepartments.filter(
      (subDepartment) =>
        String(subDepartment.departmentId) === String(departmentId),
    ).length;

  // Oldest first, keeping a stable display number (#N) tied to
  // the order departments are returned in.
  const orderedDepartments = plantDepartments.map((department, index) => ({
    ...department,
    displayId: index + 1,
    subDepartmentCount: subDepartmentCount(department.id),
  }));

  const filteredDepartments = orderedDepartments.filter((department) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      String(department.displayId).includes(query) ||
      String(department.name).toLowerCase().includes(query)
    );
  });

  const totalSubDepartments = subDepartments.length;

  /* ===================== ADD DEPARTMENT ===================== */

  const openAddModal = () => {
    setDepartmentName("");
    setAddModal(true);
  };

  const saveDepartment = async () => {
    if (saving) return;

    if (!plantId) {
      showToast("Please open this page from a plant to add departments.");
      return;
    }

    const name = departmentName.trim();

    if (!name) {
      showToast("Please enter department name.");
      return;
    }

    const isDuplicate = plantDepartments.some(
      (department) => String(department.name).toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      showToast("Department already exists.");
      return;
    }

    setSaving(true);
    try {
      const response = await DepartmentApi.createDepartment({
        departmentName: name,
        plantId: Number(plantId) || plantId,
      });
      const created = normalizeDepartment(response.data);

      if (created.id === undefined || created.id === null) {
        const refreshed = plantId
          ? await DepartmentApi.getDepartmentsByPlant(plantId)
          : await DepartmentApi.getDepartments();
        setDepartments(getList(refreshed.data).map(normalizeDepartment));
      } else {
        setDepartments((prev) => [...prev, created]);
      }

      showToast("Department added successfully.");
      setAddModal(false);
      setDepartmentName("");
    } catch (err) {
      showToast(
        `Failed to add department: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Create department API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== EDIT DEPARTMENT ===================== */

  const openEditModal = (department) => {
    setEditTarget(department);
    setEditName(department.name);
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editTarget || saving) return;

    const name = editName.trim();

    if (!name) {
      showToast("Please enter department name.");
      return;
    }

    setSaving(true);
    try {
      const response = await DepartmentApi.updateDepartment(editTarget.id, {
        departmentName: name,
        plantId: editTarget.plantId
          ? Number(editTarget.plantId) || editTarget.plantId
          : undefined,
      });
      const updated = normalizeDepartment({
        ...editTarget,
        ...response.data,
        name: response.data?.departmentName ?? response.data?.name ?? name,
      });

      setDepartments((prev) =>
        prev.map((department) =>
          String(department.id) === String(editTarget.id) ? updated : department,
        ),
      );

      showToast("Department updated successfully.");
      setEditModal(false);
    } catch (err) {
      showToast(
        `Failed to update department: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Update department API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== DELETE DEPARTMENT ===================== */

  const askDelete = (department) => {
    setDeleteTarget(department);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || saving) return;

    // Keep the existing guard: a department with sub-departments cannot be
    // deleted. Counts come from the API-loaded sub-department list.
    if (subDepartmentCount(deleteTarget.id) > 0) {
      showToast(
        `Cannot delete Department "${deleteTarget.name}" because it has associated sub-departments.`,
      );
      return;
    }

    setSaving(true);
    try {
      await DepartmentApi.deleteDepartment(deleteTarget.id);
      setDepartments((prev) =>
        prev.filter(
          (department) => String(department.id) !== String(deleteTarget.id),
        ),
      );
      showToast("Department deleted successfully.");
      setDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to delete department. Please try again.",
      );
      console.error("Delete department API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            {plantName ? `Departments — ${plantName}` : "Department Management"}
          </h2>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs px-4 py-2.5 text-xs text-slate-600 flex items-center gap-1.5 select-none">
        <Link
          to="/lms/plant"
          className="text-[#0284c7] hover:underline font-semibold"
        >
          Plants
        </Link>
        {plantName && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 font-medium">{plantName}</span>
          </>
        )}
        <span className="text-slate-400">/</span>
        <span className="font-bold text-slate-900">Departments</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-200/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200/80 text-[#0284c7] shadow-xs">
              <Building2 size={20} className="text-[#0284c7]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900">
                {plantName
                  ? `Departments: ${plantName}`
                  : "Department Management"}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {plantName
                  ? `Manage departments in ${plantName} and drill into their sub-departments`
                  : "Manage departments and drill into their sub-departments"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/lms/plant")}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-[#0284c7] hover:text-[#0284c7] shadow-xs"
            >
              <ArrowLeft size={15} />
              Back to Plant
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <CirclePlus size={16} />
              Add Department
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Departments
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {plantDepartments.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Sub-Departments
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalSubDepartments} Sub-Depts
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="flex flex-col gap-2 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-[340px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID or department name..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredDepartments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {plantDepartments.length}
            </span>
          </p>
        </div>

        {/* TABLE */}

        <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-slate-200 sm:mx-5 sm:mb-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-[#0b295c] text-white">
                  <th className="border-r border-[#153e7e] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white sm:px-4">
                    ID
                  </th>
                  <th className="border-r border-[#153e7e] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white sm:px-4">
                    Department Name
                  </th>
                  <th className="border-r border-[#153e7e] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white sm:px-4">
                    Sub-Departments
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white sm:px-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <p className="text-sm">Loading departments...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <p className="mb-4 text-sm text-rose-600">{error}</p>
                        <button
                          onClick={() => setReloadKey((key) => key + 1)}
                          className="rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Building2 size={42} className="mb-3 opacity-40 text-slate-400" />
                        <p className="mb-4 text-sm">No departments found.</p>
                        <button
                          onClick={openAddModal}
                          className="flex items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                        >
                          <CirclePlus size={15} />
                          Add Department
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((department) => (
                    <tr
                      key={department.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                    >
                      <td className="border-r border-slate-100 px-4 py-3 sm:px-4">
                        <span className="inline-flex rounded-md bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-xs font-semibold text-[#0284c7]">
                          #{department.displayId}
                        </span>
                      </td>

                      <td className="border-r border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900 sm:px-4">
                        {department.name}
                      </td>

                      <td className="border-r border-slate-100 px-4 py-3 sm:px-4">
                        <span className="inline-flex rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {department.subDepartmentCount} Sub-Depts
                        </span>
                      </td>

                      <td className="px-4 py-3 sm:px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(paths.subDepartments(department.id))
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-sky-50/50 shadow-xs transition-colors"
                          >
                            Sub-Departments
                            <ArrowRight size={13} />
                          </button>

                          <button
                            title="Edit department"
                            onClick={() => openEditModal(department)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 transition hover:bg-sky-50 hover:text-[#0284c7] hover:border-sky-300"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            title="Delete department"
                            onClick={() => askDelete(department)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD DEPARTMENT MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Add Department</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Department Name
              </label>
              <input
                autoFocus
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveDepartment()}
                placeholder="Enter department name"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setAddModal(false)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDepartment}
                  disabled={saving}
                  className="rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DEPARTMENT MODAL */}

      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Edit Department</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Department Name
              </label>
              <input
                autoFocus
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveEdit()}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setEditModal(false)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Confirm Delete</h2>
              <button
                onClick={() => setDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs leading-5 text-slate-600">
                Are you sure you want to delete{" "}
                <strong className="text-slate-900">
                  "{deleteTarget?.name}"
                </strong>
                ? It can only be deleted once it has no sub-departments.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={saving}
                  className="rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900/95 text-white px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6">
          {toast}
        </div>
      )}
    </div>
  );
}
