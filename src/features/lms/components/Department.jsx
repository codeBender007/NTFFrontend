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
    <div className="text-[#26364d]">
      <section className="p-4 sm:p-[30px_25px]">
        {/* BREADCRUMB */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#9aa3af]">
          <Link
            to="/lms/plant"
            className="hover:text-[#0d9488] hover:underline"
          >
            Plants
          </Link>
          {plantName && (
            <>
              <span>/</span>
              <span className="text-[#718096]">{plantName}</span>
            </>
          )}
          <span>/</span>
          <span className="font-semibold text-[#26364d]">Departments</span>
        </div>

        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
                <Building2 size={20} className="text-[#0d9488]" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">
                  {plantName
                    ? `Departments: ${plantName}`
                    : "Department Management"}
                </h1>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  {plantName
                    ? `Manage departments in ${plantName} and drill into their sub-departments`
                    : "Manage departments and drill into their sub-departments"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/lms/plant")}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-4 text-xs font-semibold text-[#64748b] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] sm:flex-none shadow-xs"
              >
                <ArrowLeft size={15} />
                Back to Plant
              </button>

              <button
                onClick={openAddModal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:flex-none"
              >
                <CirclePlus size={16} />
                Add Department
              </button>
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Total Departments
              </p>
              <p className="mt-1 text-2xl font-bold text-[#26364d]">
                {plantDepartments.length}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Total Sub-Departments
              </p>
              <p className="mt-1 text-2xl font-bold text-[#0f172a]">
                {totalSubDepartments} Sub-Depts
              </p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="flex flex-col gap-2 px-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="relative w-full sm:max-w-[340px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID or department name..."
                className="h-9 w-full rounded-xl border border-[#e2edf2] bg-white pl-9 pr-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />
            </div>

            <p className="text-xs text-[#718096]">
              Showing{" "}
              <span className="font-semibold text-[#26364d]">
                {filteredDepartments.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#26364d]">
                {plantDepartments.length}
              </span>
            </p>
          </div>

          {/* TABLE */}

          <div className="mx-4 mb-4 overflow-hidden rounded-[14px] border border-[#e3e6eb] sm:mx-5 sm:mb-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-[#f5f6f8]">
                    <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                      ID
                    </th>
                    <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                      Department Name
                    </th>
                    <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                      Sub-Departments
                    </th>
                    <th className="px-3 py-3 text-right text-[12px] font-bold uppercase text-[#3b4b62] sm:px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <p className="text-sm">Loading departments...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <p className="mb-4 text-sm text-[#e74c3c]">{error}</p>
                          <button
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Building2 size={42} className="mb-3 opacity-40" />
                          <p className="mb-4 text-sm">No departments found.</p>
                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
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
                        className="border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
                      >
                        <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                          <span className="inline-flex rounded-full bg-[#e6f7f5] border border-[#0d9488]/20 px-2.5 py-1 text-[12px] font-semibold text-[#0d9488]">
                            #{department.displayId}
                          </span>
                        </td>

                        <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] font-semibold text-[#344760] last:border-r-0 sm:px-4">
                          {department.name}
                        </td>

                        <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                          <span className="inline-flex rounded-full bg-[#eef7ff] px-2.5 py-1 text-[12px] font-semibold text-[#3182ce]">
                            {department.subDepartmentCount} Sub-Depts
                          </span>
                        </td>

                        <td className="px-3 py-3 sm:px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(paths.subDepartments(department.id))
                              }
                              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all"
                            >
                              Sub-Departments
                              <ArrowRight size={13} />
                            </button>

                            <button
                              title="Edit department"
                              onClick={() => openEditModal(department)}
                              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2edf2] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              title="Delete department"
                              onClick={() => askDelete(department)}
                              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#fff0ee] text-[#e74c3c] transition hover:bg-[#ffe3df]"
                            >
                              <Trash2 size={15} />
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
      </section>

      {/* ADD DEPARTMENT MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Add Department</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Department Name
              </label>
              <input
                autoFocus
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveDepartment()}
                placeholder="Enter department name"
                className="h-11 w-full rounded-xl border border-[#e2edf2] px-3 text-sm outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setAddModal(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDepartment}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
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
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Edit Department</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Department Name
              </label>
              <input
                autoFocus
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveEdit()}
                className="h-11 w-full rounded-xl border border-[#e2edf2] px-3 text-sm outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setEditModal(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
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
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Confirm Delete</h2>
              <button
                onClick={() => setDeleteModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-gray-600">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  "{deleteTarget?.name}"
                </strong>
                ? It can only be deleted once it has no sub-departments.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={saving}
                  className="rounded-lg bg-[#fff0ee] px-4 py-2.5 text-xs font-semibold text-[#e74c3c]"
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
        <div className="fixed bottom-4 right-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-lg border-l-4 border-[#10b981] bg-[#202938] px-5 py-3 text-xs font-medium text-white shadow-xl sm:bottom-6 sm:right-6">
          {toast}
        </div>
      )}
    </div>
  );
}
