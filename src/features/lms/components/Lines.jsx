import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Waypoints,
  Pencil,
  Trash2,
  Search,
  X,
  Plus,
} from "lucide-react";
import buildPaths from "../utils/hierarchyPaths";
import DepartmentApi from "../services/DepartmentApi";
import SubDepartmentApi from "../services/SubDepartmentApi";
import LinesApi from "../services/LinesApi";
import MachinesApi from "../services/MachinesApi";
import PlantApi from "../services/PlantApi";

// Map the backend response shapes onto the shapes the UI already renders.
const normalizeLine = (line) => ({
  id: line?.id,
  name: line?.lineName ?? line?.name ?? "Unnamed line",
  code: line?.code ?? "",
  plantId: line?.plantId,
  departmentId: line?.departmentId,
  subDepartmentId: line?.subDepartmentId,
  machines: [],
});

const normalizeMachine = (machine) => ({
  id: machine?.id,
  name: machine?.machineName ?? machine?.name ?? "Unnamed machine",
  lineId: machine?.lineId,
});

const normalizeDepartment = (department) => ({
  ...department,
  id: department?.id ?? department?.department_id ?? department?.departmentId,
  name: department?.departmentName ?? department?.name ?? "Unnamed department",
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

export default function Lines() {
  const navigate = useNavigate();
  const { plantId, deptId, subDeptId } = useParams();
  const paths = buildPaths(plantId);

  const [department, setDepartment] = useState(null);
  const [subDepartment, setSubDepartment] = useState(null);
  const [lines, setLines] = useState([]);
  const [plantName, setPlantName] = useState(
    plantId ? `Plant #${plantId}` : "",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");

  const [addModal, setAddModal] = useState(false);
  const [lineForm, setLineForm] = useState({
    name: "",
    code: "",
    leaders: "",
    mentor: "",
    requirement: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    leaders: "",
    mentor: "",
    requirement: "",
    description: "",
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const emptyLineForm = {
    name: "",
    code: "",
    leaders: "",
    mentor: "",
    requirement: "",
    description: "",
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [
          departmentResponse,
          subDepartmentResponse,
          linesResponse,
          machinesResponse,
        ] = await Promise.all([
          DepartmentApi.getDepartment(deptId),
          SubDepartmentApi.getSubDepartment(subDeptId),
          LinesApi.getLinesBySubDepartment(subDeptId),
          // One request for every machine in the sub-department instead of
          // one request per line.
          MachinesApi.getMachines({ subDepartmentId: subDeptId }),
        ]);

        if (cancelled) return;

        const machineList = getList(machinesResponse.data).map(normalizeMachine);
        const nextLines = getList(linesResponse.data).map((line) => {
          const normalized = normalizeLine(line);
          return {
            ...normalized,
            machines: machineList.filter(
              (machine) => String(machine.lineId) === String(normalized.id),
            ),
          };
        });

        setDepartment(normalizeDepartment(departmentResponse.data));
        setSubDepartment(normalizeSubDepartment(subDepartmentResponse.data));
        setLines(nextLines);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          // One of the parent records does not exist; show not-found.
          setDepartment(null);
          setSubDepartment(null);
        } else {
          setError(
            err.response?.data?.detail ||
              "Unable to load lines from the server.",
          );
          console.error("Get lines API error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [deptId, subDeptId, reloadKey]);

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
            <Waypoints size={21} className="text-[#0d9488]" />
          </div>
          <h2 className="text-[15px] font-bold">Loading lines...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#fff0ee] border border-[#e74c3c]/20">
            <Waypoints size={21} className="text-[#e74c3c]" />
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

  if (!department || !subDepartment) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20">
            <Waypoints size={21} className="text-[#0d9488]" />
          </div>
          <h2 className="text-[15px] font-bold">Sub-Department not found</h2>
          <p className="mt-1 text-xs text-[#718096]">
            The selected sub-department could not be found.
          </p>
          <button
            onClick={() =>
              navigate(
                department
                  ? paths.subDepartments(deptId)
                  : paths.departments,
              )
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>
    );
  }

  /* ===================== DERIVED DATA ===================== */

  const orderedLines = lines.map((line, index) => ({
    ...line,
    displayId: index + 1,
  }));

  const filteredLines = orderedLines.filter((line) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      String(line.displayId).includes(query) ||
      String(line.name).toLowerCase().includes(query) ||
      (line.code || "").toLowerCase().includes(query)
    );
  });

  /* ===================== ADD LINE ===================== */

  const openAddModal = () => {
    setLineForm(emptyLineForm);
    setAddModal(true);
  };

  const saveLine = async () => {
    if (saving) return;

    const name = lineForm.name.trim();

    if (!name) {
      showToast("Please enter line name.");
      return;
    }

    const isDuplicate = lines.some(
      (line) => String(line.name).toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      showToast("Line already exists in this sub-department.");
      return;
    }

    setSaving(true);
    try {
      const response = await LinesApi.createLine({
        subDepartmentId: Number(subDeptId) || subDeptId,
        lineName: name,
      });
      const created = normalizeLine(response.data);

      if (created.id === undefined || created.id === null) {
        const refreshed = await LinesApi.getLinesBySubDepartment(subDeptId);
        setLines(getList(refreshed.data).map(normalizeLine));
      } else {
        setLines((prev) => [...prev, created]);
      }

      showToast("Line added successfully.");
      setAddModal(false);
    } catch (err) {
      showToast(
        `Failed to add line: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Create line API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== EDIT LINE ===================== */

  const openEditModal = (line) => {
    setEditTarget(line);
    setEditForm({
      name: line.name || "",
      code: line.code || "",
      leaders: line.leaders || "",
      mentor: line.mentor || "",
      requirement: line.requirement || "",
      description: line.description || "",
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editTarget || saving) return;

    const name = editForm.name.trim();

    if (!name) {
      showToast("Please enter line name.");
      return;
    }

    setSaving(true);
    try {
      const response = await LinesApi.updateLine(editTarget.id, {
        lineName: name,
      });
      const updated = normalizeLine({
        ...editTarget,
        ...response.data,
        lineName: response.data?.lineName ?? name,
      });

      setLines((prev) =>
        prev.map((line) =>
          String(line.id) === String(editTarget.id)
            ? { ...updated, machines: editTarget.machines || [] }
            : line,
        ),
      );

      showToast("Line updated successfully.");
      setEditModal(false);
    } catch (err) {
      showToast(
        `Failed to update line: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Update line API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== DELETE LINE ===================== */

  const askDelete = (line) => {
    setDeleteTarget(line);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || saving) return;

    // Check the backend for dependent machines before deleting, so the guard
    // uses current server data.
    setSaving(true);
    try {
      const response = await LinesApi.getMachinesByLine(deleteTarget.id);
      const dependentMachines = getList(response?.data);
      if (dependentMachines.length > 0) {
        showToast(
          `Cannot delete Line "${deleteTarget.name}" because it has associated machines.`,
        );
        return;
      }

      await LinesApi.deleteLine(deleteTarget.id);
      setLines((prev) =>
        prev.filter((line) => String(line.id) !== String(deleteTarget.id)),
      );
      showToast("Line deleted successfully.");
      setDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to delete line. Please try again.",
      );
      console.error("Delete line API error:", err);
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
          <Link
            to={paths.subDepartments(deptId)}
            className="hover:text-[#0d9488] hover:underline"
          >
            {subDepartment.name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#26364d]">Lines</span>
        </div>

        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
                <Waypoints size={20} className="text-[#0d9488]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">
                  Lines: {subDepartment.name}
                </h1>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  Manage lines within this sub-department
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(paths.subDepartments(deptId))}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-4 text-xs font-semibold text-[#64748b] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] sm:flex-none shadow-xs"
              >
                <ArrowLeft size={15} />
                Back to Sub-Departments
              </button>

              <button
                onClick={openAddModal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:flex-none"
              >
                <Plus size={15} />
                Add Line
              </button>
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Sub-Department Name
              </p>
              <p className="mt-1 text-lg font-bold text-[#0f172a]">
                {subDepartment.name}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Lines Count
              </p>
              <p className="mt-1 text-2xl font-bold text-[#26364d]">
                {lines.length} Lines
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
                placeholder="Search lines..."
                className="h-9 w-full rounded-xl border border-[#e2edf2] bg-white pl-9 pr-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />
            </div>

            <p className="text-xs text-[#718096]">
              Showing{" "}
              <span className="font-semibold text-[#26364d]">
                {filteredLines.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#26364d]">
                {lines.length}
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
                      Line Name
                    </th>
                    <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                      Machines
                    </th>
                    <th className="px-3 py-3 text-right text-[12px] font-bold uppercase text-[#3b4b62] sm:px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Waypoints size={42} className="mb-3 opacity-40" />
                          <p className="mb-4 text-sm">No lines found.</p>
                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            <Plus size={15} />
                            Add Line
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLines.map((line) => {
                      return (
                        <tr
                          key={line.id}
                          className="border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
                        >
                          <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                            <span className="inline-flex rounded-full bg-[#e6f7f5] border border-[#0d9488]/20 px-2.5 py-1 text-[12px] font-semibold text-[#0d9488]">
                              #{line.displayId}
                            </span>
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] font-semibold text-[#344760] last:border-r-0 sm:px-4">
                            {line.name}
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                            <span className="inline-flex rounded-full bg-[#eef7ff] px-2.5 py-1 text-[12px] font-semibold text-[#3182ce]">
                              {line.machines?.length || 0} Machines
                            </span>
                          </td>

                          <td className="px-3 py-3 sm:px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    paths.machines(deptId, subDeptId, line.id),
                                  )
                                }
                                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all"
                              >
                                Machines
                                <ArrowRight size={13} />
                              </button>

                              <button
                                title="Edit line"
                                onClick={() => openEditModal(line)}
                                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2edf2] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                title="Delete line"
                                onClick={() => askDelete(line)}
                                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#fff0ee] text-[#e74c3c] transition hover:bg-[#ffe3df]"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ADD LINE MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Add Line</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Line Name
              </label>
              <input
                autoFocus
                value={lineForm.name}
                onChange={(event) =>
                  setLineForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                onKeyDown={(event) => event.key === "Enter" && saveLine()}
                placeholder="Enter line name"
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
                  onClick={saveLine}
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

      {/* EDIT LINE MODAL */}

      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Edit Line</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Line Name
              </label>
              <input
                autoFocus
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                onKeyDown={(event) => event.key === "Enter" && saveEdit()}
                placeholder="Enter line name"
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
                <strong className="text-gray-900">"{deleteTarget?.name}"</strong>
                ? It can only be deleted once it has no machines.
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
