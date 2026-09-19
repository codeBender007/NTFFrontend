import { useState } from "react";
import {
  CirclePlus,
  Pencil,
  Search,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import Filters from "../../../components/Filters";
import {
  SEED_USERS,
  USERS_STORAGE_KEY,
  createId,
  filterUsers,
  getUserDepartmentOptions,
  EMPTY_USER_FORM,
  ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "../utils/userUtils";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d5d9df] px-3 text-sm outline-none transition focus:border-[#6F4AE7]";

const loadUsers = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));

    if (Array.isArray(stored)) return stored;
    return SEED_USERS;
  } catch {
    return SEED_USERS;
  }
};

const Users = () => {
  const [users, setUsers] = useState(loadUsers);
  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState("");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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
    setForm(EMPTY_USER_FORM);
    setFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm(user);
    setFormModalOpen(true);
  };

  const handleSubmit = () => {
    const name = form.name?.trim();
    const email = form.email?.trim();

    if (!name) {
      showToast("Please enter user name.");
      return;
    }

    if (!email) {
      showToast("Please enter email address.");
      return;
    }

    const duplicate = users.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.id !== editingUser?.id,
    );

    if (duplicate) {
      showToast("Email already exists.");
      return;
    }

    if (editingUser) {
      const next = users.map((user) =>
        user.id === editingUser.id
          ? { ...user, ...form, name, email }
          : user,
      );

      setUsers(next);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      showToast("User updated successfully.");
    } else {
      const next = [
        ...users,
        { id: createId("user"), ...form, name, email },
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

            <button
              onClick={openAddModal}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6F4AE7] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5A38D6] sm:w-auto"
            >
              <CirclePlus size={16} />
              Add User
            </button>
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
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-[#f5f6f8]">
                    {[
                      "User Name",
                      "Email",
                      "Role",
                      "Department",
                      "Status",
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
                      <td colSpan={6} className="p-0">
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
                    tableRows.map((user) => {
                      const statusClasses =
                        user.status === "Active"
                          ? "bg-[#e6f7ef] text-[#0f9d58]"
                          : user.status === "Inactive"
                            ? "bg-[#eef0f3] text-[#6b7280]"
                            : user.status === "Pending"
                              ? "bg-[#fff4e0] text-[#e6920b]"
                              : user.status === "Locked"
                                ? "bg-[#fff0ee] text-[#e74c3c]"
                                : "bg-gray-100 text-gray-600";

                      const dotClasses =
                        user.status === "Active"
                          ? "bg-[#0f9d58]"
                          : user.status === "Inactive"
                            ? "bg-[#6b7280]"
                            : user.status === "Pending"
                              ? "bg-[#e6920b]"
                              : user.status === "Locked"
                                ? "bg-[#e74c3c]"
                                : "bg-gray-400";

                      return (
                        <tr
                          key={user.id}
                          className="group border-b border-[#edf0f2] last:border-0 hover:bg-[#fafaff]"
                        >
                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] font-semibold text-[#344760] last:border-r-0 sm:px-4">
                            <button
                              type="button"
                              className="font-semibold text-[#344760] transition hover:text-[#6F4AE7] hover:underline"
                            >
                              {user.name}
                            </button>
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                            {user.email}
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                            {user.role}
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                            {user.department}
                          </td>

                          <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${dotClasses}`}
                              />
                              {user.status || "-"}
                            </span>
                          </td>

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
                      );
                    })
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
          <div className="max-h-full w-full max-w-[520px] overflow-hidden rounded-[17px] bg-white shadow-2xl">
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
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    User Name
                    <span className="ml-0.5 text-[#e74c3c]">*</span>
                  </label>

                  <input
                    autoFocus
                    value={form.name || ""}
                    onChange={setFormField("name")}
                    placeholder="Enter user name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Email
                    <span className="ml-0.5 text-[#e74c3c]">*</span>
                  </label>

                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={setFormField("email")}
                    placeholder="Enter email address"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Role
                    <span className="ml-0.5 text-[#e74c3c]">*</span>
                  </label>

                  <select
                    value={form.role || ""}
                    onChange={setFormField("role")}
                    className={inputClass}
                  >
                    <option value="">Select role</option>

                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Department
                  </label>

                  <select
                    value={form.department || ""}
                    onChange={setFormField("department")}
                    className={inputClass}
                  >
                    <option value="">Select department</option>

                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Status
                  </label>

                  <select
                    value={form.status || "Active"}
                    onChange={setFormField("status")}
                    className={inputClass}
                  >
                    {USER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
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
                <strong className="text-gray-900">"{deleteTarget?.name}"</strong>
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