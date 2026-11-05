import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
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

// Map the backend response shape onto the shape the UI already renders.
const normalizeMachine = (machine) => ({
  id: machine?.id,
  name: machine?.machineName ?? machine?.name ?? "Unnamed machine",
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

const normalizeLine = (line) => ({
  ...line,
  id: line?.id,
  name: line?.lineName ?? line?.name ?? "Unnamed line",
  plantId: line?.plantId,
  departmentId: line?.departmentId,
  subDepartmentId: line?.subDepartmentId,
});

// The list endpoints return a JSON array, but tolerate wrapped shapes too.
const getList = (data) => {
  if (Array.isArray(data)) return data;
  const nested = data?.data ?? data?.items ?? data?.results;
  return Array.isArray(nested) ? nested : [];
};

export default function Machine() {
  const navigate = useNavigate();
  const { plantId, deptId, subDeptId, lineId } = useParams();
  const paths = buildPaths(plantId);

  const [department, setDepartment] = useState(null);
  const [subDepartment, setSubDepartment] = useState(null);
  const [line, setLine] = useState(null);
  const [machines, setMachines] = useState([]);
  const [plantName, setPlantName] = useState(
    plantId ? `Plant #${plantId}` : "",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");

  const [addModal, setAddModal] = useState(false);
  const [machineForm, setMachineForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });

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
        const [
          departmentResponse,
          subDepartmentResponse,
          lineResponse,
          machinesResponse,
        ] = await Promise.all([
          DepartmentApi.getDepartment(deptId),
          SubDepartmentApi.getSubDepartment(subDeptId),
          LinesApi.getLine(lineId),
          MachinesApi.getMachinesByLine(lineId),
        ]);

        if (cancelled) return;
        setDepartment(normalizeDepartment(departmentResponse.data));
        setSubDepartment(normalizeSubDepartment(subDepartmentResponse.data));
        setLine(normalizeLine(lineResponse.data));
        setMachines(getList(machinesResponse.data).map(normalizeMachine));
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          // One of the parent records does not exist; show not-found.
          setDepartment(null);
          setSubDepartment(null);
          setLine(null);
        } else {
          setError(
            err.response?.data?.detail ||
              "Unable to load machines from the server.",
          );
          console.error("Get machines API error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [deptId, subDeptId, lineId, reloadKey]);

  // The plant name is only needed for the breadcrumb, so a failure here
  // should not block the page. Falls back to "Plant #<id>" when unavailable.
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
            <Cpu size={21} className="text-[#0d9488]" />
          </div>
          <h2 className="text-[15px] font-bold">Loading machines...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#fff0ee] border border-[#e74c3c]/20">
            <Cpu size={21} className="text-[#e74c3c]" />
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

  if (!department || !subDepartment || !line) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#F7F7F5] text-[#26364d]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20">
            <Cpu size={21} className="text-[#0d9488]" />
          </div>
          <h2 className="text-[15px] font-bold">Line not found</h2>
          <p className="mt-1 text-xs text-[#718096]">
            The selected line could not be found.
          </p>
          <button
            onClick={() =>
              navigate(
                department && subDepartment
                  ? paths.lines(deptId, subDeptId)
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

  const orderedMachines = machines.map((machine, index) => ({
    ...machine,
    displayId: index + 1,
  }));

  const filteredMachines = orderedMachines.filter((machine) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      String(machine.displayId).includes(query) ||
      String(machine.name).toLowerCase().includes(query)
    );
  });

  /* ===================== ADD MACHINE ===================== */

  const openAddModal = () => {
    setMachineForm({ name: "" });
    setAddModal(true);
  };

  const saveMachine = async () => {
    if (saving) return;

    const name = machineForm.name.trim();

    if (!name) {
      showToast("Please enter machine name.");
      return;
    }

    const isDuplicate = machines.some(
      (machine) => String(machine.name).toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      showToast("Machine already exists in this line.");
      return;
    }

    setSaving(true);
    try {
      const response = await MachinesApi.createMachine({
        lineId: Number(lineId) || lineId,
        machineName: name,
      });
      const created = normalizeMachine(response.data);

      if (created.id === undefined || created.id === null) {
        // The API did not return a complete record; refresh from the server.
        const refreshed = await MachinesApi.getMachinesByLine(lineId);
        setMachines(getList(refreshed.data).map(normalizeMachine));
      } else {
        setMachines((prev) => [...prev, created]);
      }

      showToast("Machine added successfully.");
      setAddModal(false);
    } catch (err) {
      showToast(
        `Failed to add machine: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Create machine API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== EDIT MACHINE ===================== */

  const openEditModal = (machine) => {
    setEditTarget(machine);
    setEditForm({ name: machine.name || "" });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editTarget || saving) return;

    const name = editForm.name.trim();

    if (!name) {
      showToast("Please enter machine name.");
      return;
    }

    setSaving(true);
    try {
      const response = await MachinesApi.updateMachine(editTarget.id, {
        machineName: name,
      });
      const updated = normalizeMachine({
        ...editTarget,
        ...response.data,
        machineName: response.data?.machineName ?? name,
      });

      setMachines((prev) =>
        prev.map((machine) =>
          String(machine.id) === String(editTarget.id) ? updated : machine,
        ),
      );

      showToast("Machine updated successfully.");
      setEditModal(false);
    } catch (err) {
      showToast(
        `Failed to update machine: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Update machine API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== DELETE MACHINE ===================== */

  const askDelete = (machine) => {
    setDeleteTarget(machine);
    setDeleteModal(true);
  };

  // Machine is the leaf of the hierarchy, so no child-existence check is needed.
  const confirmDelete = async () => {
    if (!deleteTarget || saving) return;

    setSaving(true);
    try {
      await MachinesApi.deleteMachine(deleteTarget.id);
      setMachines((prev) =>
        prev.filter(
          (machine) => String(machine.id) !== String(deleteTarget.id),
        ),
      );
      showToast("Machine deleted successfully.");
      setDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to delete machine. Please try again.",
      );
      console.error("Delete machine API error:", err);
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
            {line ? `Machines — ${line.name}` : "Machine Management"}
          </h2>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs px-4 py-2.5 text-xs text-slate-600 flex flex-wrap items-center gap-1.5 select-none">
        <Link
          to="/lms/plant"
          className="text-[#0284c7] hover:underline font-semibold"
        >
          Plants
        </Link>
        {plantName && (
          <>
            <span className="text-slate-400">/</span>
            <Link
              to={paths.departments}
              className="text-[#0284c7] hover:underline font-semibold"
            >
              {plantName}
            </Link>
          </>
        )}
        <span className="text-slate-400">/</span>
        <Link
          to={paths.departments}
          className="text-[#0284c7] hover:underline font-semibold"
        >
          {department.name}
        </Link>
        <span className="text-slate-400">/</span>
        <Link
          to={paths.subDepartments(deptId)}
          className="text-[#0284c7] hover:underline font-semibold"
        >
          {subDepartment.name}
        </Link>
        <span className="text-slate-400">/</span>
        <Link
          to={paths.lines(deptId, subDeptId)}
          className="text-[#0284c7] hover:underline font-semibold"
        >
          {line.name}
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-bold text-slate-900">Machines</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200/80 text-[#0284c7] shadow-xs">
              <Cpu size={20} className="text-[#0284c7]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900">
                Machines: {line.name}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage machines within this line
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(paths.lines(deptId, subDeptId))}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-[#0284c7] hover:text-[#0284c7] shadow-xs"
            >
              <ArrowLeft size={15} />
              Back to Lines
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus size={15} />
              Add Machine
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Line Name
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {line.name}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Machines Count
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {machines.length} Machines
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
              placeholder="Search machines..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredMachines.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {machines.length}
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
                    Machine Name
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white sm:px-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMachines.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-0">
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Cpu size={42} className="mb-3 opacity-40 text-slate-400" />
                        <p className="mb-4 text-sm">No machines found.</p>
                        <button
                          onClick={openAddModal}
                          className="flex items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                        >
                          <Plus size={15} />
                          Add Machine
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMachines.map((machine) => (
                    <tr
                      key={machine.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                    >
                      <td className="border-r border-slate-100 px-4 py-3 sm:px-4">
                        <span className="inline-flex rounded-md bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-xs font-semibold text-[#0284c7]">
                          #{machine.displayId}
                        </span>
                      </td>

                      <td className="border-r border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900 sm:px-4">
                        {machine.name}
                      </td>

                      <td className="px-4 py-3 sm:px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Edit machine"
                            onClick={() => openEditModal(machine)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 transition hover:bg-sky-50 hover:text-[#0284c7] hover:border-sky-300"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            title="Delete machine"
                            onClick={() => askDelete(machine)}
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

      {/* ADD MACHINE MODAL */}
      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Add Machine</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Machine Name
              </label>
              <input
                autoFocus
                value={machineForm.name}
                onChange={(event) =>
                  setMachineForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                onKeyDown={(event) => event.key === "Enter" && saveMachine()}
                placeholder="Enter machine name"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
              />

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setAddModal(false)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMachine}
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

      {/* EDIT MACHINE MODAL */}
      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Edit Machine</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Machine Name
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
                placeholder="Enter machine name"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
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
                ? This will also remove all of its shifts.
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
