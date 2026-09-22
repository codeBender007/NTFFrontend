import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CirclePlus,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  Users as UsersIcon,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import Filters from "../../../components/Filters";
import {
  USERS_STORAGE_KEY,
  createId,
  filterUsers,
  getUserDepartmentOptions,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  USER_COLUMNS,
  USER_DATE_KEYS,
  loadUsers,
} from "../utils/userUtils";
import { formatDate } from "../utils/operatorUtils";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d5d9df] px-3 text-sm outline-none transition focus:border-[#6F4AE7]";

const Users = ({ users: propUsers, setUsers: propSetUsers }) => {
  const navigate = useNavigate();

  const [localUsers, setLocalUsers] = useState(loadUsers);

  const users = propUsers ?? localUsers;
  const setUsers = propSetUsers ?? setLocalUsers;

  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState("");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_USER_FORM);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ===================== UPLOAD EXCEL ===================== */

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

      if (!rows.length) {
        showToast("No data rows found in the Excel file.");
        return;
      }

      const normalizeHeader = (value) =>
        String(value)
          .toLowerCase()
          .replace(/\s+/g, "");

      const headerAliases = new Map(
        USER_COLUMNS.map((column) => [
          normalizeHeader(column.label),
          column.key,
        ]),
      );

      const parsedUsers = rows
        .map((row) => {
          const user = { ...EMPTY_USER_FORM };

          Object.keys(row).forEach((header) => {
            const key = headerAliases.get(normalizeHeader(header));

            if (key) user[key] = row[header] ?? "";
          });

          return user;
        })
        .filter((user) => String(user.empName || "").trim());

      if (!parsedUsers.length) {
        showToast("No valid employee rows found in the Excel file.");
        return;
      }

      const baseSno = users.length;
      const next = [
        ...users,
        ...parsedUsers.map((user, index) => ({
          ...user,
          id: createId("user"),
          sno: baseSno + index + 1,
        })),
      ];

      setUsers(next);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      showToast(`${parsedUsers.length} user(s) imported successfully.`);
    } catch {
      showToast(
        "Failed to read the Excel file. Please upload a valid .xlsx or .xls file.",
      );
    } finally {
      event.target.value = "";
    }
  };

  /* ===================== TABLE DATA ===================== */

  const departmentOptions = getUserDepartmentOptions(users);

  const tableRows = filterUsers(users, {
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
    setEditingUser(null);

    const formWithSno = {
      ...EMPTY_USER_FORM,
      sno: users.length + 1,
      empName: "",
      email: "",
    };

    setForm(formWithSno);
    setFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm(user);
    setFormModalOpen(true);
  };

  const handleViewUser = (user) => {
    navigate(`/lms/user/${user.id}`);
  };

  const handleSubmit = () => {
    const empName = form.empName?.trim();
    const email = form.email?.trim();

    if (!empName) {
      showToast("Please enter employee name.");
      return;
    }

    if (editingUser) {
      const next = users.map((user) =>
        user.id === editingUser.id
          ? { ...user, ...form, empName, email }
          : user,
      );

      setUsers(next);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      showToast("User updated successfully.");
    } else {
      const next = [
        ...users,
        { id: createId("user"), ...form, sno: users.length + 1, empName, email },
      ];

      setUsers(next);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      showToast("User added successfully.");
    }

    setFormModalOpen(false);
  };

  /* ===================== DELETE ===================== */

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    const next = users.filter((user) => user.id !== deleteTarget.id);

    setUsers(next);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
    showToast("User deleted successfully.");

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const renderFormField = (field) => {
    const value = form[field.key] || "";

    if (field.type === "select") {
      const options = field.department ? departmentOptions : field.options;

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
        <div className="overflow-hidden rounded-[17px] border border-[#e3e6eb] bg-white shadow-sm">
          {/* PAGE HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#edf0f3] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
            <div className="flex items-center gap-3">
              <div className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-xl bg-[#6F4AE7] text-white">
                <ManageAccountsOutlinedIcon sx={{ fontSize: 21 }} />
              </div>

              <div className="min-w-0">
                <h1 className="text-[15px] font-bold">Users Management</h1>

                <p className="mt-0.5 text-xs text-[#718096]">
                  Manage users, access and account status
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D5D9DF] bg-white px-4 py-2.5 text-xs font-semibold text-[#344054] transition hover:bg-[#F9FAFB] sm:w-auto"
              >
                <UploadCloud size={16} />
                Upload Excel
              </button>

              <button
                onClick={openAddModal}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6F4AE7] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5A38D6] sm:w-auto"
              >
                <CirclePlus size={16} />
                Add User
              </button>
            </div>
          </div>

          {/* FILTERS */}

          <div className="m-4 sm:m-5">
            <Filters
              values={filterValues}
              onChange={setFilterValues}
              departmentOptions={departmentOptions}
              subDepartmentOptions={["Sub 1", "Sub 2", "Sub 3"]}
              lineOptions={["Line 1", "Line 2", "Line 3"]}
              machineOptions={["Morning", "Evening", "Night"]}
              machineLabel="Shift"
            />
          </div>

          {/* TABLE */}

          <div className="mx-4 mb-4 overflow-hidden rounded-[14px] border border-[#e3e6eb] sm:mx-5 sm:mb-5">
            {/* TABLE TOOLBAR */}

            <div className="flex flex-col gap-3 border-b border-[#edf0f3] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#26364d]">Users</h3>
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
                  className="h-9 w-full rounded-lg border border-[#d5d9df] bg-[#f7f8fa] pl-9 pr-3 text-[13px] outline-none transition focus:border-[#6F4AE7] focus:bg-white"
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
                          <UsersIcon size={42} className="mb-3 opacity-40" />

                          <p className="mb-4 text-sm">No users found.</p>

                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-lg bg-[#6F4AE7] px-4 py-2 text-xs font-semibold text-white"
                          >
                            <CirclePlus size={15} />
                            Add User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((user, index) => (
                      <tr
                        key={user.id}
                        className="group border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
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
                                onClick={() => handleViewUser(user)}
                                className="font-semibold text-[#344760] transition hover:text-[#6F4AE7] hover:underline"
                              >
                                {user[column.key]}
                              </button>
                            ) : USER_DATE_KEYS.includes(column.key) ? (
                              formatDate(user[column.key])
                            ) : (
                              user[column.key] || "-"
                            )}
                          </td>
                        ))}

                        <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                          <div className="flex gap-2">
                            <button
                              title="Edit user"
                              onClick={() => openEditModal(user)}
                              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f0ecff] text-[#6F4AE7] transition hover:bg-[#e6dfff]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              title="Delete user"
                              onClick={() => openDeleteModal(user)}
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
                {editingUser ? "Edit User" : "Add User"}
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
                  className="rounded-lg bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="rounded-lg bg-[#6F4AE7] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#5A38D6]"
                >
                  {editingUser ? "Save Changes" : "Save"}
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
        <div className="fixed bottom-4 right-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-lg border-l-4 border-[#5A38D6] bg-[#6F4AE7] px-5 py-3 text-xs font-medium text-white shadow-xl sm:bottom-6 sm:right-6">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Users;