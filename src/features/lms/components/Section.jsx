import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Pencil,
  Trash2,
  Search,
  X,
  Plus,
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
    "Unnamed department",
  plantId: department?.plantId ?? department?.plant_id,
});

const normalizeSubDepartment = (subDepartment) => ({
  ...subDepartment,
  id:
    subDepartment?.id ??
    subDepartment?.sub_department_id ??
    subDepartment?.subDepartmentId,
  name:
    subDepartment?.subDepartmentName ??
    subDepartment?.name ??
    "Unnamed sub-department",
  plantId: subDepartment?.plantId ?? subDepartment?.plant_id,
  departmentId:
    subDepartment?.departmentId ?? subDepartment?.department_id,
});

// The list endpoints return a JSON array, but tolerate wrapped shapes too.
const getList = (data) => {
  if (Array.isArray(data)) return data;
  const nested = data?.data ?? data?.items ?? data?.results;
  return Array.isArray(nested) ? nested : [];
};

export default function SubDepartment() {
  const navigate = useNavigate();
  const { plantId, deptId } = useParams();
  const paths = buildPaths(plantId);

  const [department, setDepartment] = useState(null);
  const [subDepartments, setSubDepartments] = useState([]);
  const [plantName, setPlantName] = useState(
    plantId ? `Plant #${plantId}` : "",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");

  const [addModal, setAddModal] = useState(false);
  const [subDeptName, setSubDeptName] = useState("");
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

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [departmentResponse, subDepartmentsResponse] = await Promise.all([
          DepartmentApi.getDepartment(deptId),
          SubDepartmentApi.getSubDepartmentsByDepartment(deptId),
        ]);
        if (cancelled) return;
        setDepartment(normalizeDepartment(departmentResponse.data));
        setSubDepartments(
          getList(subDepartmentsResponse.data).map(normalizeSubDepartment),
        );
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          // The parent department does not exist; show the not-found state.
          setDepartment(null);
        } else {
          setError(
            err.response?.data?.detail ||
              "Unable to load sub-departments from the server.",
          );
          console.error("Get sub-departments API error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [deptId, reloadKey]);

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

  /* ===================== RENDER GUARDS ===================== */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20">
            <Layers size={21} className="text-[#0d9488]" />
          </div>
          <h2 className="text-[15px] font-bold">Loading sub-departments...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#fff0ee] border border-[#e74c3c]/20">
            <Layers size={21} className="text-[#e74c3c]" />
          </div>
          <h2 className="text-[15px] font-bold">Unable to load</h2>
          <p className="mt-1 text-xs text-[#718096]">{error}</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20">
            <Layers size={21} className="text-[#0d9488]" />
          </div>
          <h2 className="text-[15px] font-bold">Department not found</h2>
          <p className="mt-1 text-xs text-[#718096]">
            The selected department could not be found.
          </p>
          <button
            onClick={() => navigate(paths.departments)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Departments
          </button>
        </div>
      </div>
    );
  }

  /* ===================== DERIVED DATA ===================== */

  const orderedSubDepartments = subDepartments.map((subDept, index) => ({
    ...subDept,
    displayId: index + 1,
  }));

  const filteredSubDepartments = orderedSubDepartments.filter((subDept) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      String(subDept.displayId).includes(query) ||
      String(subDept.name).toLowerCase().includes(query)
    );
  });

  /* ===================== ADD SUB-DEPARTMENT ===================== */

  const openAddModal = () => {
    setSubDeptName("");
    setAddModal(true);
  };

  const saveSubDepartment = async () => {
    if (saving) return;

    const name = subDeptName.trim();

    if (!name) {
      showToast("Please enter sub-department name.");
      return;
    }

    const isDuplicate = subDepartments.some(
      (subDept) => String(subDept.name).toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      showToast("Sub-department already exists.");
      return;
    }

    setSaving(true);
    try {
      const response = await SubDepartmentApi.createSubDepartment({
        departmentId: Number(deptId) || deptId,
        subDepartmentName: name,
      });
      const created = normalizeSubDepartment(response.data);

      if (created.id === undefined || created.id === null) {
        const refreshed =
          await SubDepartmentApi.getSubDepartmentsByDepartment(deptId);
        setSubDepartments(getList(refreshed.data).map(normalizeSubDepartment));
      } else {
        setSubDepartments((prev) => [...prev, created]);
      }

      showToast("Sub-department added successfully.");
      setAddModal(false);
      setSubDeptName("");
    } catch (err) {
      showToast(
        `Failed to add sub-department: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Create sub-department API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== EDIT SUB-DEPARTMENT ===================== */

  const openEditModal = (subDept) => {
    setEditTarget(subDept);
    setEditName(subDept.name);
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editTarget || saving) return;

    const name = editName.trim();

    if (!name) {
      showToast("Please enter sub-department name.");
      return;
    }

    setSaving(true);
    try {
      const response = await SubDepartmentApi.updateSubDepartment(
        editTarget.id,
        { subDepartmentName: name },
      );
      const updated = normalizeSubDepartment({
        ...editTarget,
        ...response.data,
        name: response.data?.subDepartmentName ?? response.data?.name ?? name,
      });

      setSubDepartments((prev) =>
        prev.map((subDept) =>
          String(subDept.id) === String(editTarget.id) ? updated : subDept,
        ),
      );

      showToast("Sub-department updated successfully.");
      setEditModal(false);
    } catch (err) {
      showToast(
        `Failed to update sub-department: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Update sub-department API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== DELETE SUB-DEPARTMENT ===================== */

  const askDelete = (subDept) => {
    setDeleteTarget(subDept);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || saving) return;

    // Check the backend for dependent lines before deleting, so the guard
    // uses current server data.
    setSaving(true);
    try {
      const response = await SubDepartmentApi.getLinesBySubDepartment(
        deleteTarget.id,
      );
      const dependentLines = getList(response?.data);
      if (dependentLines.length > 0) {
        showToast(
          `Cannot delete Sub-Department "${deleteTarget.name}" because it has associated lines.`,
        );
        return;
      }

      await SubDepartmentApi.deleteSubDepartment(deleteTarget.id);
      setSubDepartments((prev) =>
        prev.filter(
          (subDept) => String(subDept.id) !== String(deleteTarget.id),
        ),
      );
      showToast("Sub-department deleted successfully.");
      setDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to delete sub-department. Please try again.",
      );
      console.error("Delete sub-department API error:", err);
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
              <Link
                to={paths.departments}
                className="hover:text-[#0d9488] hover:underline"
              >
                {plantName}
              </Link>
            </>
          )}
          <span>/</span>
          <Link
            to={paths.departments}
            className="hover:text-[#0d9488] hover:underline"
          >
            {department.name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#26364d]">Sub-Departments</span>
        </div>

        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
                <Layers size={20} className="text-[#0d9488]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">
                  Sub-Departments: {department.name}
                </h1>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  Manage sub-departments within this department
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(paths.departments)}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-4 text-xs font-semibold text-[#64748b] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] sm:flex-none shadow-xs"
              >
                <ArrowLeft size={15} />
                Back to Departments
              </button>

              <button
                onClick={openAddModal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:flex-none"
              >
                <Plus size={15} />
                Add Sub-Department
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Department Name
              </p>
              <p className="mt-1 text-lg font-bold text-[#0f172a]">
                {department.name}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Sub-Departments Count
              </p>
              <p className="mt-1 text-2xl font-bold text-[#26364d]">
                {subDepartments.length} Sub-Depts
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
                placeholder="Search sub-departments..."
                className="h-9 w-full rounded-xl border border-[#e2edf2] bg-white pl-9 pr-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />
            </div>

            <p className="text-xs text-[#718096]">
              Showing{" "}
              <span className="font-semibold text-[#26364d]">
                {filteredSubDepartments.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#26364d]">
                {subDepartments.length}
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
                      Sub-Department Name
                    </th>
                    <th className="px-3 py-3 text-right text-[12px] font-bold uppercase text-[#3b4b62] sm:px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Layers size={42} className="mb-3 opacity-40" />
                          <p className="mb-4 text-sm">
                            No sub-departments found.
                          </p>
                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            <Plus size={15} />
                            Add Sub-Department
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubDepartments.map((subDept) => (
                      <tr
                        key={subDept.id}
                        className="border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
                      >
                        <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                          <span className="inline-flex rounded-full bg-[#e6f7f5] border border-[#0d9488]/20 px-2.5 py-1 text-[12px] font-semibold text-[#0d9488]">
                            #{subDept.displayId}
                          </span>
                        </td>

                        <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] font-semibold text-[#344760] last:border-r-0 sm:px-4">
                          {subDept.name}
                        </td>

                        <td className="px-3 py-3 sm:px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  paths.lines(department.id, subDept.id),
                                )
                              }
                              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all"
                            >
                              Lines
                              <ArrowRight size={13} />
                            </button>

                            <button
                              title="Edit sub-department"
                              onClick={() => openEditModal(subDept)}
                              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2edf2] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              title="Delete sub-department"
                              onClick={() => askDelete(subDept)}
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

      {/* ADD SUB-DEPARTMENT MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Add Sub-Department</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Sub-Department Name
              </label>
              <input
                autoFocus
                value={subDeptName}
                onChange={(event) => setSubDeptName(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && saveSubDepartment()
                }
                placeholder="Enter sub-department name"
                className="h-11 w-full rounded-xl border border-[#e2edf2] px-3 text-sm outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setAddModal(false)}
                  className="rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] px-4 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#F2F2EF]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSubDepartment}
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

      {/* EDIT SUB-DEPARTMENT MODAL */}

      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Edit Sub-Department</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Sub-Department Name
              </label>
              <input
                autoFocus
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveEdit()}
                className="h-11 w-full rounded-xl border border-[#e2edf2] px-3 text-sm outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setEditModal(false)}
                  className="rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] px-4 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#F2F2EF]"
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
                ? It can only be deleted once it has no lines.
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
