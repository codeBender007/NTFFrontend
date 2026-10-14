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
    <div className="text-[#26364d]">
      <section className="p-4 sm:p-[30px_25px]">
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
                <Factory size={20} className="text-[#0d9488]" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">
                  Plant
                </h1>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  Manage plants and drill into their departments
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:w-auto"
            >
              <CirclePlus size={16} />
              Add Plant
            </button>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Total Plants
              </p>
              <p className="mt-1 text-2xl font-bold text-[#26364d]">
                {plants.length}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#e3e6eb] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa3af]">
                Total Departments
              </p>
              <p className="mt-1 text-2xl font-bold text-[#0f172a]">
                {departments.length}
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
                placeholder="Search by ID or plant name..."
                className="h-9 w-full rounded-xl border border-[#e2edf2] bg-white pl-9 pr-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
              />
            </div>

            <p className="text-xs text-[#718096]">
              Showing{" "}
              <span className="font-semibold text-[#26364d]">
                {filteredPlants.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#26364d]">
                {plants.length}
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
                      Plant Name
                    </th>
                    <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                      Departments
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
                          <p className="text-sm">Loading plants...</p>
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
                  ) : filteredPlants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Factory size={42} className="mb-3 opacity-40" />
                          <p className="mb-4 text-sm">No plants found.</p>
                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
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
                        className="border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
                      >
                        <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                          <span className="inline-flex rounded-full bg-[#e6f7f5] border border-[#0d9488]/20 px-2.5 py-1 text-[12px] font-semibold text-[#0d9488]">
                            #{plant.displayId}
                          </span>
                        </td>

                        <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] font-semibold text-[#344760] last:border-r-0 sm:px-4">
                          {plant.name}
                        </td>

                        <td className="border-r border-[#edf0f2] px-3 py-3 last:border-r-0 sm:px-4">
                          <span className="inline-flex rounded-full bg-[#eef7ff] px-2.5 py-1 text-[12px] font-semibold text-[#3182ce]">
                            {plant.departmentCount} Depts
                          </span>
                        </td>

                        <td className="px-3 py-3 sm:px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPlantDepartments(plant)}
                              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all"
                            >
                              Departments
                              <ArrowRight size={13} />
                            </button>

                            <button
                              title="Edit plant"
                              onClick={() => openEditModal(plant)}
                              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2edf2] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              title="Delete plant"
                              onClick={() => askDelete(plant)}
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

      {/* ADD PLANT MODAL */}

      {addModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Add Plant</h2>
              <button
                onClick={() => setAddModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Plant Name
              </label>
              <input
                autoFocus
                value={plantName}
                onChange={(event) => setPlantName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && savePlant()}
                placeholder="Enter plant name"
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
                  onClick={savePlant}
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

      {/* EDIT PLANT MODAL */}

      {editModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditModal(false);
          }}
        >
          <div className="max-h-full w-full max-w-[480px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Edit Plant</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-semibold">
                Plant Name
              </label>
              <input
                autoFocus
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveEdit()}
                placeholder="Enter plant name"
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
                ? It can only be deleted once it has no departments.
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
