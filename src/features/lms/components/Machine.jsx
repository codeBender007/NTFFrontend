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
    <div className="text-[#26364d]">
      <section className="p-4 sm:p-[30px_25px]">
        {/* BREADCRUMB */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-[#9aa3af]">
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
          <Link
            to={paths.lines(deptId, subDeptId)}
            className="hover:text-[#0d9488] hover:underline"
          >
            {line.name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#26364d]">Machines</span>
        </div>

        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
                <Cpu size={20} className="text-[#0d9488]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">
                  Machines: {line.name}
                </h1>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  Manage machines within this line
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(paths.lines(deptId, subDeptId))}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-4 text-xs font-semibold text-[#64748b] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] sm:flex-none shadow-xs"
              >
                <ArrowLeft size={15} />
                Back to Lines
              </button>

              <button
                onClick={openAddModal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:flex-none"
              >
                <Plus size={15} />
                Add Machine
              </button>
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Line Name
              </p>
              <p className="mt-1 text-lg font-bold text-[#0f172a]">
                {line.name}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Machines Count
              </p>
              <p className="mt-1 text-2xl font-bold text-[#26364d]">
                {machines.length} Machines
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
                placeholder="Search machines..."
                className="h-9 w-full rounded-xl border border-[#e2edf2] bg-white pl-9 pr-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />
            </div>

            <p className="text-xs text-[#718096]">
              Showing{" "}
              <span className="font-semibold text-[#26364d]">
                {filteredMachines.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#26364d]">
                {machines.length}
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
                      Machine Name
                    </th>
                    <th className="px-3 py-3 text-right text-[12px] font-bold uppercase text-[#3b4b62] sm:px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMachines.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Cpu size={42} className="mb-3 opacity-40" />
                          <p className="mb-4 text-sm">No machines found.</p>
                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            <Plus size={15} />
                            Add Machine
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMachines.map((machine) => {
                      return (
                        <tr
                          key={machine.id}
                          className="border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
                        >
                          <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                            <span className="inline-flex rounded-full bg-[#e6f7f5] border border-[#0d9488]/20 px-2.5 py-1 text-[12px] font-semibold text-[#0d9488]">
                              #{machine.displayId}
                            </span>
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] font-semibold text-[#344760] last:border-r-0 sm:px-4">
                            {machine.name}
                          </td>

                          <td className="px-3 py-3 sm:px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                title="Edit machine"
                                onClick={() => openEditModal(machine)}
                                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2edf2] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                title="Delete machine"
                                onClick={() => askDelete(machine)}
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

      {/* ADD MACHINE MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Add Machine</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
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
                  onClick={saveMachine}
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

      {/* EDIT MACHINE MODAL */}

      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Edit Machine</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
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
                ? This will also remove all of its shifts.
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
