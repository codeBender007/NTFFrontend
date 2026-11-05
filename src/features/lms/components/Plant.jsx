import { useEffect, useState } from "react";

import PlantApi from "../services/PlantApi";
import DepartmentApi from "../services/DepartmentApi";

import { useNavigate } from "react-router-dom";

import {
  Factory,
  CirclePlus,
  Pencil,
  Trash2,
  Search,
  X,
  ArrowRight,
} from "lucide-react";

// Map the backend response onto the flat shape the table renders.
const normalizePlant = (plant) => ({
  ...plant,
  id: plant?.id ?? plant?.plant_id ?? plant?.plantId,
  name: plant?.plantName ?? plant?.name ?? plant?.plant_name ?? "Unnamed plant",
});

const normalizeDepartment = (department) => ({
  ...department,
  id: department?.id ?? department?.department_id ?? department?.departmentId,
  plantId: department?.plantId ?? department?.plant_id,
});

// The list endpoints return a JSON array, but tolerate wrapped shapes too.
const getList = (data) => {
  if (Array.isArray(data)) return data;
  const nested = data?.data ?? data?.items ?? data?.results;
  return Array.isArray(nested) ? nested : [];
};

export default function Plant() {
  const navigate = useNavigate();

  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [plantName, setPlantName] = useState("");
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
        // Plants are the source of truth for the list; departments are only
        // needed to show a reliable per-plant count.
        const [plantsResponse, departmentsResponse] = await Promise.all([
          PlantApi.getPlants(),
          DepartmentApi.getDepartments(),
        ]);
        if (cancelled) return;
        setPlants(getList(plantsResponse.data).map(normalizePlant));
        setDepartments(getList(departmentsResponse.data).map(normalizeDepartment));
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.detail || "Unable to load plants from the server.",
        );
        console.error("Get plants API error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /* ===================== DERIVED DATA ===================== */

  const departmentCount = (plantId) =>
    departments.filter(
      (department) => String(department.plantId) === String(plantId),
    ).length;

  // Oldest first, keeping a stable display number (#N) tied to
  // the order plants are returned in.
  const orderedPlants = plants.map((plant, index) => ({
    ...plant,
    displayId: index + 1,
    departmentCount: departmentCount(plant.id),
  }));

  const filteredPlants = orderedPlants.filter((plant) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      String(plant.displayId).includes(query) ||
      String(plant.name).toLowerCase().includes(query)
    );
  });

  /* ===================== ADD PLANT ===================== */

  const openAddModal = () => {
    setPlantName("");
    setAddModal(true);
  };

  const savePlant = async () => {
    if (saving) return;

    const name = plantName.trim();
    if (!name) {
      showToast("Please enter plant name.");
      return;
    }

    const isDuplicate = plants.some(
      (plant) => String(plant.name).toLowerCase() === name.toLowerCase(),
    );
    if (isDuplicate) {
      showToast("Plant already exists.");
      return;
    }

    setSaving(true);
    try {
      const response = await PlantApi.createPlant({ plantName: name });
      const created = normalizePlant(response.data);

      if (created.id === undefined || created.id === null) {
        // The API did not return a complete record; refresh from the server.
        const refreshed = await PlantApi.getPlants();
        setPlants(getList(refreshed.data).map(normalizePlant));
      } else {
        setPlants((prev) => [...prev, created]);
      }

      showToast("Plant added successfully.");
      setAddModal(false);
      setPlantName("");
    } catch (err) {
      showToast(
        `Failed to add plant: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Create plant API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== EDIT PLANT ===================== */

  const openEditModal = (plant) => {
    setEditTarget(plant);
    setEditName(plant.name);
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editTarget || saving) return;

    const name = editName.trim();
    if (!name) {
      showToast("Please enter plant name.");
      return;
    }

    const isDuplicate = plants.some(
      (plant) =>
        String(plant.id) !== String(editTarget.id) &&
        String(plant.name).toLowerCase() === name.toLowerCase(),
    );
    if (isDuplicate) {
      showToast("Plant already exists.");
      return;
    }

    setSaving(true);
    try {
      const response = await PlantApi.updatePlant(editTarget.id, {
        plantName: name,
      });
      const updated = normalizePlant({
        ...editTarget,
        ...response.data,
        name: response.data?.plantName ?? response.data?.name ?? name,
      });

      setPlants((prev) =>
        prev.map((plant) =>
          String(plant.id) === String(editTarget.id) ? updated : plant,
        ),
      );
      showToast("Plant updated successfully.");
      setEditModal(false);
    } catch (err) {
      showToast(
        `Failed to update plant: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Update plant API error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== DELETE PLANT ===================== */

  const askDelete = (plant) => {
    setDeleteTarget(plant);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || saving) return;

    setSaving(true);
    try {
      await PlantApi.deletePlant(deleteTarget.id);
      setPlants((prev) =>
        prev.filter((plant) => String(plant.id) !== String(deleteTarget.id)),
      );
      showToast("Plant deleted successfully.");
      setDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        `Failed to delete plant: ${
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Please try again."
        }`,
      );
      console.error("Delete plant API error:", err);
    } finally {
      setSaving(false);
    }
  };

  const openPlantDepartments = (plant) => {
    navigate(`/lms/plant/${plant.id}/department`);
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            Plant Hierarchy
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-200/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200/80 text-[#0284c7] shadow-xs">
              <Factory size={20} className="text-[#0284c7]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900">
                Plant
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage plants and drill into their departments
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors sm:w-auto"
          >
            <CirclePlus size={16} />
            Add Plant
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Plants
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {plants.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Departments
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {departments.length}
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
              placeholder="Search by ID or plant name..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredPlants.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {plants.length}
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
                    Plant Name
                  </th>
                  <th className="border-r border-[#153e7e] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white sm:px-4">
                    Departments
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
                        <p className="text-sm">Loading plants...</p>
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
                ) : filteredPlants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Factory size={42} className="mb-3 opacity-40 text-slate-400" />
                        <p className="mb-4 text-sm">No plants found.</p>
                        <button
                          onClick={openAddModal}
                          className="flex items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                        >
                          <CirclePlus size={15} />
                          Add Plant
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPlants.map((plant) => (
                    <tr
                      key={plant.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                    >
                      <td className="border-r border-slate-100 px-4 py-3 sm:px-4">
                        <span className="inline-flex rounded-md bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-xs font-semibold text-[#0284c7]">
                          #{plant.displayId}
                        </span>
                      </td>

                      <td className="border-r border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900 sm:px-4">
                        {plant.name}
                      </td>

                      <td className="border-r border-slate-100 px-4 py-3 sm:px-4">
                        <span className="inline-flex rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {plant.departmentCount} Depts
                        </span>
                      </td>

                      <td className="px-4 py-3 sm:px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPlantDepartments(plant)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-sky-50/50 shadow-xs transition-colors"
                          >
                            Departments
                            <ArrowRight size={13} />
                          </button>

                          <button
                            title="Edit plant"
                            onClick={() => openEditModal(plant)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 transition hover:bg-sky-50 hover:text-[#0284c7] hover:border-sky-300"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            title="Delete plant"
                            onClick={() => askDelete(plant)}
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

      {/* ADD PLANT MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Add Plant</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Plant Name
              </label>
              <input
                autoFocus
                value={plantName}
                onChange={(event) => setPlantName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && savePlant()}
                placeholder="Enter plant name"
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
                  onClick={savePlant}
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

      {/* EDIT PLANT MODAL */}

      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">Edit Plant</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Plant Name
              </label>
              <input
                autoFocus
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveEdit()}
                placeholder="Enter plant name"
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
                ? It can only be deleted once it has no departments.
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
