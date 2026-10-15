import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CirclePlus, Pencil, Search, Trash2, X } from "lucide-react";
import Filters from "../../../components/Filters";
import {
  OPERATORS_STORAGE_KEY,
  createId,
  filterOperators,
  getOperatorDepartmentOptions,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  USER_COLUMNS,
  USER_DATE_KEYS,
  loadOperators,
  formatDate,
} from "../utils/operatorUtils";

const inputClass =
  "h-11 w-full rounded-xl border border-[#e2edf2] px-3 text-sm outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15";

const Operators = ({ operators: propOperators, setOperators: propSetOperators }) => {
  const navigate = useNavigate();

  const [localOperators, setLocalOperators] = useState(loadOperators);

  const operators = propOperators ?? localOperators;
  const setOperators = propSetOperators ?? setLocalOperators;

  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState("");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [form, setForm] = useState(EMPTY_USER_FORM);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ===================== TABLE DATA ===================== */

  const departmentOptions = getOperatorDepartmentOptions(operators);

  const tableRows = filterOperators(operators, {
    search,
    department: filterValues.department,
  });

  /* ===================== FORM MODAL ===================== */

  const setFormField = (key) => (event) => {
    setForm((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  const openAddModal = () => {
    setEditingOperator(null);

    const formWithSno = {
      ...EMPTY_USER_FORM,
      sno: operators.length + 1,
      empName: "",
      email: "",
    };

    setForm(formWithSno);
    setFormModalOpen(true);
  };

  const openEditModal = (operator) => {
    setEditingOperator(operator);
    setForm(operator);
    setFormModalOpen(true);
  };

  const handleViewOperator = (operator) => {
    navigate(`/lms/operator/${operator.id}`);
  };

  const handleSubmit = () => {
    const empName = form.empName?.trim();
    const email = form.email?.trim();

    if (!empName) {
      showToast("Please enter employee name.");
      return;
    }

    if (editingOperator) {
      const next = operators.map((operator) =>
        operator.id === editingOperator.id
          ? { ...operator, ...form, empName, email }
          : operator,
      );

      setOperators(next);
      localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(next));
      showToast("Operator updated successfully.");
    } else {
      const next = [
        ...operators,
        {
          id: createId("operator"),
          ...form,
          sno: operators.length + 1,
          empName,
          email,
        },
      ];

      setOperators(next);
      localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(next));
      showToast("Operator added successfully.");
    }

    setFormModalOpen(false);
  };

  /* ===================== DELETE ===================== */

  const openDeleteModal = (operator) => {
    setDeleteTarget(operator);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    const next = operators.filter((operator) => operator.id !== deleteTarget.id);

    setOperators(next);
    localStorage.setItem(OPERATORS_STORAGE_KEY, JSON.stringify(next));
    showToast("Operator deleted successfully.");

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const renderFormField = (field) => {
    const value = form[field.key] || "";

    if (field.type === "select") {
      const rawOptions = (field.department ? departmentOptions : field.options) || [];
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <select
          value={value}
          onChange={setFormField(field.key)}
          className={inputClass}
        >
          <option value="">Select {field.label.toLowerCase()}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={value}
        onChange={setFormField(field.key)}
        placeholder={field.placeholder}
        className={inputClass}
      />
    );
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="text-[#26364d]">
      <section className="py-4">
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
          {/* PAGE HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
                <Building2 size={20} className="text-[#0d9488]" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">Operators</h1>

                <p className="mt-0.5 text-xs text-[#64748b]">
                  Manage operators and their details
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:w-auto"
            >
              <CirclePlus size={16} />
              Add Operator
            </button>
          </div>

          {/* FILTERS */}

          <div className="m-4 sm:m-5">
            <Filters
              values={filterValues}
              onChange={setFilterValues}
            />
          </div>

          {/* TABLE */}

          <div className="mx-4 mb-4 overflow-hidden rounded-[14px] border border-[#e3e6eb] sm:mx-5 sm:mb-5">
            {/* TABLE TOOLBAR */}

            <div className="flex flex-col gap-3 border-b border-[#edf0f3] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#26364d]">
                  Operators
                </h3>
              </div>

              <div className="relative w-full sm:w-auto sm:max-w-[300px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  className="h-9 w-full rounded-xl border border-[#e2edf2] bg-white pl-9 pr-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
                />
              </div>
            </div>

            {/* TABLE BODY */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[3200px] border-collapse">
                <thead>
                  <tr className="bg-[#f5f6f8]">
                    {[
                      ...USER_COLUMNS.map((column) => column.label),
                      "Actions",
                    ].map((column) => (
                      <th
                        key={column}
                        className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={USER_COLUMNS.length + 1} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Building2 size={42} className="mb-3 opacity-40" />

                          <p className="mb-4 text-sm">No operators found.</p>

                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            <CirclePlus size={15} />
                            Add Operator
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((operator, index) => (
                      <tr
                        key={operator.id}
                        className="group border-b border-[#edf0f2] last:border-0 hover:bg-[#F7F7F5]"
                      >
                        {USER_COLUMNS.map((column) => (
                          <td
                            key={column.key}
                            className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4"
                          >
                            {column.key === "sno" ? (
                              index + 1
                            ) : column.key === "empName" ? (
                              <button
                                type="button"
                                onClick={() => handleViewOperator(operator)}
                                className="font-semibold text-[#0f172a] transition hover:text-[#0d9488] hover:underline"
                              >
                                {operator[column.key]}
                              </button>
                            ) : USER_DATE_KEYS.includes(column.key) ? (
                              formatDate(operator[column.key])
                            ) : (
                              operator[column.key] || "-"
                            )}
                          </td>
                        ))}

                        <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                          <div className="flex gap-2">
                            <button
                              title="Edit operator"
                              onClick={() => openEditModal(operator)}
                              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#e2edf2] bg-[#f8fafc] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              title="Delete operator"
                              onClick={() => openDeleteModal(operator)}
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

      {/* ADD / EDIT MODAL */}

      {formModalOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFormModalOpen(false);
            }
          }}
        >
          <div className="max-h-full w-full max-w-[720px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">
                {editingOperator ? "Edit Operator" : "Add Operator"}
              </h2>

              <button
                onClick={() => setFormModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {USER_FORM_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block text-xs font-semibold">
                      {field.label}
                      {field.key === "empName" && (
                        <span className="ml-0.5 text-[#e74c3c]">*</span>
                      )}
                    </label>

                    {field.key === "empName" ? (
                      <input
                        autoFocus
                        value={form.empName || ""}
                        onChange={setFormField("empName")}
                        placeholder="Enter employee name"
                        className={inputClass}
                      />
                    ) : (
                      renderFormField(field)
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setFormModalOpen(false)}
                  className="rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] px-4 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#F2F2EF]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                >
                  {editingOperator ? "Save Changes" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#141928]/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteModalOpen(false);
            }
          }}
        >
          <div className="max-h-full w-full max-w-[520px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-5 py-[18px]">
              <h2 className="text-base font-bold">Confirm Delete</h2>

              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              <div className="text-sm leading-6 text-gray-600">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  "{deleteTarget?.empName}"
                </strong>
                ?
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e3e6eb] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
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
        <div className="fixed bottom-4 right-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-xl border-l-4 border-[#0d9488] bg-[#0f172a] px-5 py-3 text-xs font-medium text-white shadow-xl sm:bottom-6 sm:right-6">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Operators;