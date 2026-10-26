import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Eye,
  EyeOff,
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
  filterUsers,
  getUserDepartmentOptions,
  EMPTY_USER_FORM,
  USER_FORM_FIELDS,
  USER_COLUMNS,
  USER_DATE_KEYS,
  toDateInputValue,
  isUserInactive,
  getUserDisplayStatus,
} from "../utils/userUtils";
import { formatDate } from "../utils/operatorUtils";
import DepartmentApi from "../services/DepartmentApi";
import SubDepartmentApi from "../services/SubDepartmentApi";
import LinesApi from "../services/LinesApi";
import MachinesApi from "../services/MachinesApi";
import PlantApi from "../services/PlantApi";
import UserApi from "../services/UserApi";
import { isAuthenticated, clearSession } from "../../auth/utils/authStorage";

const ITEMS_PER_PAGE = 10;
const MAX_USERS_PAGE = 1000;

const inputClass =
  "h-11 w-full rounded-xl border border-[#e2edf2] px-3 text-sm outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15";

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const errors = data?.errors || data?.detail;

  if (Array.isArray(errors) && errors.length) {
    const messages = errors
      .map((item) => {
        const field = Array.isArray(item?.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item?.msg}` : item?.msg;
      })
      .filter(Boolean);
    if (messages.length) return messages.join("; ");
  }

  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

  return data?.message || fallback;
};

const asNullable = (value) => {
  const text = typeof value === "string" ? value.trim() : value;
  return text === "" || text === undefined ? null : text;
};

// Map the backend user response onto the shape the table/form already use.
const mapUserFromApi = (user) => {
  const isInactive = isUserInactive(user);
  const status = getUserDisplayStatus(user);

  return {
    id: user.id,
    plantId: user.plantId ?? "",
    departmentId: user.departmentId ?? "",
    subDepartmentId: user.subDepartmentId ?? "",
    lineId: user.lineId ?? "",
    machineId: user.machineId ?? "",
    active: !isInactive,
    is_active: !isInactive,
    status,

    sno: user.sno ?? "",
    payCode: user.payCode ?? "",
    cardNo: user.cardNo ?? "",
    empName: user.empName ?? "",
    fatherName: user.fatherName ?? "",
    dob: user.dob ?? "",
    joiningDate: user.dateOfJoining ?? "",
    leavingDate: user.leavingDate ?? "",
    companyName: user.companyName ?? "",
    department: user.departmentName ?? "",
    subDepartment: user.subDepartmentName ?? "",
    line: user.lineName ?? "",
    machine: user.machineName ?? "",
    shift: user.shift ?? "",
    plant: user.plantId != null ? String(user.plantId) : "",
    plantLocation: user.plantLocation ?? "",
    grade: user.grade ?? "",
    designation: user.designation ?? "",
    category: user.category ?? "",
    gender: user.gender ?? "",
    bloodGroup: user.bloodGroup ?? "",
    maritalStatus: user.maritalStatus ?? "",
    email: user.email ?? "",
    number: user.mobileNo ?? "",
    isDojo: user.isDojo ? "Yes" : "No",
    firstOfDate: user.firstOfDay ?? "",
    skillLevel: user.skillLevel ?? "",
    salary: user.salary != null ? String(user.salary) : "",
  };
};

const mapUsersFromApi = (data) =>
  (Array.isArray(data) ? data : []).map(mapUserFromApi);

const USER_TABLE_COLUMNS = [
  { label: "SNo", key: "sno" },
  { label: "Status", key: "status" },
  ...USER_COLUMNS.filter((column) => column.key !== "sno" && column.key !== "status"),
];

const normalizeList = (data, nameKeys = ["name"]) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : [];

  return list
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const trimmed = item.trim();
        return trimmed ? { id: trimmed, name: trimmed, raw: item } : null;
      }
      let name = "";
      for (const key of nameKeys) {
        if (item[key]) {
          name = String(item[key]).trim();
          break;
        }
      }
      if (!name && item.id != null) name = `ID #${item.id}`;
      if (!name) return null;

      return {
        id: item.id ?? name,
        name,
        plantId: item.plantId ?? item.plant_id,
        departmentId: item.departmentId ?? item.department_id,
        subDepartmentId: item.subDepartmentId ?? item.sub_department_id,
        lineId: item.lineId ?? item.line_id,
        raw: item,
      };
    })
    .filter(Boolean);
};

const buildCreatePayload = (form, lookups = {}) => {
  const isInactive = isUserInactive(form);
  const payload = {
    payCode: String(form.payCode || "").trim(),
    cardNo: asNullable(form.cardNo),
    empName: String(form.empName || "").trim(),
    fatherName: asNullable(form.fatherName),
    dob: asNullable(form.dob),
    dateOfJoining: asNullable(form.joiningDate),
    leavingDate: asNullable(form.leavingDate),
    companyName: asNullable(form.companyName),
    departmentName: asNullable(form.department),
    subDepartmentName: asNullable(form.subDepartment),
    lineName: asNullable(form.line),
    machineName: asNullable(form.machine),
    shift: asNullable(form.shift),
    plantLocation: asNullable(form.plantLocation),
    grade: asNullable(form.grade),
    designation: asNullable(form.designation),
    category: asNullable(form.category),
    gender: asNullable(form.gender),
    bloodGroup: asNullable(form.bloodGroup),
    maritalStatus: asNullable(form.maritalStatus),
    mobileNo: asNullable(form.number),
    isDojo: form.isDojo === "Yes",
    firstOfDay: asNullable(form.firstOfDate),
    skillLevel: asNullable(form.skillLevel),
    salary: asNullable(form.salary) === null ? null : Number(form.salary),
    active: !isInactive,
  };

  const emailStr = String(form.email || "").trim();
  if (emailStr && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    payload.email = emailStr;
  }

  const plantId =
    form.plantId != null && form.plantId !== ""
      ? Number(form.plantId)
      : Number(form.plant);
  if (asNullable(form.plantId ?? form.plant) !== null && Number.isFinite(plantId)) {
    payload.plantId = plantId;
  } else if (form.plantLocation) {
    const matchedPlant = lookups.plants?.find(
      (p) =>
        String(p.id) === String(form.plantLocation) ||
        p.name === form.plantLocation ||
        p.raw?.plantName === form.plantLocation,
    );
    if (matchedPlant?.id != null && Number.isFinite(Number(matchedPlant.id))) {
      payload.plantId = Number(matchedPlant.id);
    }
  }

  const matchedPlantLoc = lookups.plants?.find(
    (p) =>
      String(p.id) === String(payload.plantId) ||
      String(p.id) === String(form.plantLocation) ||
      p.name === form.plantLocation ||
      p.raw?.plantName === form.plantLocation,
  );
  if (matchedPlantLoc) {
    payload.plantLocation =
      matchedPlantLoc.raw?.plantLocation || matchedPlantLoc.name;
  }

  const deptId =
    form.departmentId ??
    lookups.departments?.find((d) => d.name === form.department)?.id;
  if (deptId != null && Number.isFinite(Number(deptId))) {
    payload.departmentId = Number(deptId);
  }

  const subDeptId =
    form.subDepartmentId ??
    lookups.subDepartments?.find((sd) => sd.name === form.subDepartment)?.id;
  if (subDeptId != null && Number.isFinite(Number(subDeptId))) {
    payload.subDepartmentId = Number(subDeptId);
  }

  const lineId =
    form.lineId ??
    lookups.lines?.find((l) => l.name === form.line)?.id;
  if (lineId != null && Number.isFinite(Number(lineId))) {
    payload.lineId = Number(lineId);
  }

  const machineId =
    form.machineId ??
    lookups.machines?.find((m) => m.name === form.machine)?.id;
  if (machineId != null && Number.isFinite(Number(machineId))) {
    payload.machineId = Number(machineId);
  }

  const password = asNullable(form.password);
  if (password !== null) payload.password = password;

  return payload;
};

const buildUpdatePayload = (form, lookups = {}) => {
  const isInactive = isUserInactive(form);
  const payload = {
    payCode: asNullable(form.payCode),
    cardNo: asNullable(form.cardNo),
    empName: String(form.empName || "").trim(),
    fatherName: asNullable(form.fatherName),
    dob: asNullable(form.dob),
    dateOfJoining: asNullable(form.joiningDate),
    leavingDate: asNullable(form.leavingDate),
    companyName: asNullable(form.companyName),
    departmentName: asNullable(form.department),
    subDepartmentName: asNullable(form.subDepartment),
    lineName: asNullable(form.line),
    machineName: asNullable(form.machine),
    shift: asNullable(form.shift),
    plantLocation: asNullable(form.plantLocation),
    grade: asNullable(form.grade),
    designation: asNullable(form.designation),
    category: asNullable(form.category),
    gender: asNullable(form.gender),
    bloodGroup: asNullable(form.bloodGroup),
    maritalStatus: asNullable(form.maritalStatus),
    mobileNo: asNullable(form.number),
    isDojo: form.isDojo === "Yes",
    firstOfDay: asNullable(form.firstOfDate),
    skillLevel: asNullable(form.skillLevel),
    salary: asNullable(form.salary) === null ? null : Number(form.salary),
    active: !isInactive,
  };

  const emailStr = String(form.email || "").trim();
  if (emailStr && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    payload.email = emailStr;
  }

  const plantId =
    form.plantId != null && form.plantId !== ""
      ? Number(form.plantId)
      : Number(form.plant);
  if (asNullable(form.plantId ?? form.plant) !== null && Number.isFinite(plantId)) {
    payload.plantId = plantId;
  } else if (form.plantLocation) {
    const matchedPlant = lookups.plants?.find(
      (p) =>
        String(p.id) === String(form.plantLocation) ||
        p.name === form.plantLocation ||
        p.raw?.plantName === form.plantLocation,
    );
    if (matchedPlant?.id != null && Number.isFinite(Number(matchedPlant.id))) {
      payload.plantId = Number(matchedPlant.id);
    }
  }

  const matchedPlantLoc = lookups.plants?.find(
    (p) =>
      String(p.id) === String(payload.plantId) ||
      String(p.id) === String(form.plantLocation) ||
      p.name === form.plantLocation ||
      p.raw?.plantName === form.plantLocation,
  );
  if (matchedPlantLoc) {
    payload.plantLocation =
      matchedPlantLoc.raw?.plantLocation || matchedPlantLoc.name;
  }

  const deptId =
    form.departmentId ??
    lookups.departments?.find((d) => d.name === form.department)?.id;
  if (deptId != null && Number.isFinite(Number(deptId))) {
    payload.departmentId = Number(deptId);
  }

  const subDeptId =
    form.subDepartmentId ??
    lookups.subDepartments?.find((sd) => sd.name === form.subDepartment)?.id;
  if (subDeptId != null && Number.isFinite(Number(subDeptId))) {
    payload.subDepartmentId = Number(subDeptId);
  }

  const lineId =
    form.lineId ??
    lookups.lines?.find((l) => l.name === form.line)?.id;
  if (lineId != null && Number.isFinite(Number(lineId))) {
    payload.lineId = Number(lineId);
  }

  const machineId =
    form.machineId ??
    lookups.machines?.find((m) => m.name === form.machine)?.id;
  if (machineId != null && Number.isFinite(Number(machineId))) {
    payload.machineId = Number(machineId);
  }

  const password = asNullable(form.password);
  if (password !== null) payload.password = password;

  return payload;
};

const Users = ({ users: propUsers, setUsers: propSetUsers }) => {
  const navigate = useNavigate();

  const [localUsers, setLocalUsers] = useState([]);

  const users = propUsers ?? localUsers;
  const setUsers = propSetUsers ?? setLocalUsers;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [filterValues, setFilterValues] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_USER_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [lines, setLines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [plants, setPlants] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [plantsError, setPlantsError] = useState("");

  /* ===================== LOAD DROPDOWNS FROM API ===================== */

  const fetchPlants = useCallback(async () => {
    setLoadingPlants(true);
    setPlantsError("");
    try {
      const res = await PlantApi.getPlants();
      const list = normalizeList(res?.data, [
        "plantLocation",
        "plantName",
        "name",
        "plant_name",
        "location",
      ]);
      setPlants(list);
      return list;
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load plants";
      setPlantsError(message);
      console.error("Failed to load plants:", err);
      return [];
    } finally {
      setLoadingPlants(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [deptRes, subDeptRes, lineRes, machRes, plantRes] =
          await Promise.allSettled([
            DepartmentApi.getDepartments(),
            SubDepartmentApi.getSubDepartments(),
            LinesApi.getLines(),
            MachinesApi.getMachines(),
            PlantApi.getPlants(),
          ]);

        if (!cancelled) {
          if (deptRes.status === "fulfilled") {
            setDepartments(
              normalizeList(deptRes.value?.data, [
                "departmentName",
                "name",
                "department_name",
              ]),
            );
          }
          if (subDeptRes.status === "fulfilled") {
            setSubDepartments(
              normalizeList(subDeptRes.value?.data, [
                "subDepartmentName",
                "name",
                "sub_department_name",
              ]),
            );
          }
          if (lineRes.status === "fulfilled") {
            setLines(
              normalizeList(lineRes.value?.data, [
                "lineName",
                "name",
                "line_name",
              ]),
            );
          }
          if (machRes.status === "fulfilled") {
            setMachines(
              normalizeList(machRes.value?.data, [
                "machineName",
                "name",
                "machine_name",
              ]),
            );
          }
          if (plantRes.status === "fulfilled") {
            setPlants(
              normalizeList(plantRes.value?.data, [
                "plantLocation",
                "plantName",
                "name",
                "plant_name",
                "location",
              ]),
            );
            setPlantsError("");
          } else {
            console.error("Failed to load plants:", plantRes.reason);
            setPlantsError(
              plantRes.reason?.response?.data?.detail ||
              plantRes.reason?.response?.data?.message ||
              "Failed to load plant locations",
            );
          }
        }
      } catch (err) {
        console.error("Failed to load form dropdown data:", err);
      } finally {
        if (!cancelled) {
          setLoadingDropdowns(false);
          setLoadingPlants(false);
        }
      }
    };

    fetchDropdowns();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch plants when form modal opens if they have not yet been loaded or if errored
  useEffect(() => {
    if (
      formModalOpen &&
      plants.length === 0 &&
      !loadingPlants &&
      !loadingDropdowns
    ) {
      fetchPlants();
    }
  }, [formModalOpen, plants.length, loadingPlants, loadingDropdowns, fetchPlants]);

  const shiftOptions = useMemo(() => {
    return shifts
      .map((s) => (typeof s === "string" ? s : s.name ?? s.shiftName ?? ""))
      .filter(Boolean);
  }, [shifts]);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ===================== LOAD USERS FROM API ===================== */

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await UserApi.getUsers({ limit: MAX_USERS_PAGE });
        if (!cancelled) setUsers(mapUsersFromApi(response.data));
      } catch (error) {
        if (!cancelled) {
          if (error?.response?.status === 401) {
            clearSession();
            setLoadError("Access Denied: You have to login first.");
            navigate("/");
            return;
          }
          setLoadError(
            getApiErrorMessage(error, "Unable to load users. Please try again."),
          );
        }
        console.error("Get users API error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, setUsers, navigate]);

  const refreshUsers = async (updatedOverride = null) => {
    try {
      const response = await UserApi.getUsers({ limit: MAX_USERS_PAGE });
      const apiUsers = mapUsersFromApi(response.data);

      if (updatedOverride && (updatedOverride.id != null || updatedOverride.payCode != null)) {
        const overrideId = updatedOverride.id != null ? String(updatedOverride.id) : null;
        const overridePayCode = updatedOverride.payCode ? String(updatedOverride.payCode) : null;

        const exists = apiUsers.some(
          (u) =>
            (overrideId && String(u.id) === overrideId) ||
            (overridePayCode && String(u.payCode) === overridePayCode),
        );

        if (exists) {
          setUsers(
            apiUsers.map((u) => {
              const isMatch =
                (overrideId && String(u.id) === overrideId) ||
                (overridePayCode && String(u.payCode) === overridePayCode);

              return isMatch
                ? {
                  ...u,
                  ...updatedOverride,
                  status: updatedOverride.status,
                  active: updatedOverride.active,
                  is_active: updatedOverride.is_active,
                }
                : u;
            }),
          );
        } else {
          setUsers([updatedOverride, ...apiUsers]);
        }
      } else {
        setUsers(apiUsers);
      }
    } catch (error) {
      console.error("Refresh users error:", error);
    }
  };

  /* ===================== UPLOAD EXCEL ===================== */

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!isAuthenticated()) {
      showToast("Access Denied: You have to login first.");
      navigate("/");
      return;
    }

    setUploading(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

      if (!rows.length) {
        showToast("No data rows found in the Excel file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await UserApi.uploadExcel(formData);
      const summary = response.data || {};

      await refreshUsers();
      showToast(
        `Import complete: ${summary.inserted ?? 0} added, ${summary.updated ?? 0
        } updated.`,
      );
    } catch (error) {
      if (error?.response?.status === 401) {
        clearSession();
        showToast(
          getApiErrorMessage(error, "Access Denied: You have to login first."),
        );
        setTimeout(() => navigate("/"), 1500);
      } else {
        showToast(
          getApiErrorMessage(error, "Failed to import the Excel file."),
        );
      }
      console.error("Excel upload API error:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  /* ===================== TABLE DATA & PAGINATION ===================== */

  const departmentOptions = getUserDepartmentOptions(users);

  const tableRows = filterUsers(users, {
    search,
    department: filterValues.department,
  });

  const totalPages = Math.max(1, Math.ceil(tableRows.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = tableRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    ];
  };

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
      status: "Active",
      active: true,
      department: "",
      departmentId: null,
      subDepartment: "",
      subDepartmentId: null,
      line: "",
      lineId: null,
      machine: "",
      machineId: null,
      shift: "",
      shiftId: null,
      plant: "",
      plantId: null,
      plantLocation: "",
    };

    setForm(formWithSno);
    setShowPassword(false);
    setFormModalOpen(true);
    if (plants.length === 0 && !loadingPlants && !loadingDropdowns) {
      fetchPlants();
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    const isInactive = isUserInactive(user);
    const currentStatus = isInactive ? "Inactive" : "Active";

    setForm({
      ...EMPTY_USER_FORM,
      ...user,
      dob: toDateInputValue(user.dob),
      joiningDate: toDateInputValue(user.joiningDate),
      leavingDate: toDateInputValue(user.leavingDate),
      firstOfDate: toDateInputValue(user.firstOfDate),
      status: currentStatus,
      active: !isInactive,
      is_active: !isInactive,
      departmentId: user.departmentId ?? null,
      subDepartmentId: user.subDepartmentId ?? null,
      lineId: user.lineId ?? null,
      machineId: user.machineId ?? null,
      shiftId: user.shiftId ?? null,
      plantId: user.plantId ?? null,
      plantLocation: user.plantLocation ?? "",
      password: "",
    });
    setShowPassword(false);
    setFormModalOpen(true);
    if (plants.length === 0 && !loadingPlants && !loadingDropdowns) {
      fetchPlants();
    }
  };

  const handleViewUser = (user) => {
    navigate(`/lms/user/${user.id}`);
  };

  const handleSubmit = async () => {
    if (saving) return;

    if (!isAuthenticated()) {
      showToast("Access Denied: You have to login first.");
      navigate("/");
      return;
    }

    const empName = form.empName?.trim();
    const payCode = form.payCode?.trim();
    const email = form.email?.trim();
    const nextForm = { ...form, empName, email, payCode };

    if (!empName) {
      showToast("Please enter employee name.");
      return;
    }

    if (!editingUser && !payCode) {
      showToast("Please enter pay code.");
      return;
    }

    setSaving(true);

    try {
      const lookups = {
        departments,
        subDepartments,
        lines,
        machines,
        plants,
        shifts,
      };

      if (editingUser) {
        const payload = buildUpdatePayload(nextForm, lookups);
        const response = await UserApi.updateUser(
          editingUser.id,
          payload,
        );

        // Derive unambiguous status & active values
        const isInactive = isUserInactive(nextForm);
        const finalStatus = isInactive ? "Inactive" : "Active";
        const finalActive = !isInactive;

        const apiUser = response?.data ? mapUserFromApi(response.data) : {};

        // Merge: original row -> nextForm edits -> mapped apiUser fields
        const updatedRow = {
          ...editingUser,
          ...nextForm,
          ...apiUser,
          id: editingUser.id,
          sno: editingUser.sno || nextForm.sno,
          empName: nextForm.empName || apiUser.empName || editingUser.empName,
          payCode: nextForm.payCode || apiUser.payCode || editingUser.payCode,
          cardNo: nextForm.cardNo ?? apiUser.cardNo ?? editingUser.cardNo,
          fatherName: nextForm.fatherName ?? apiUser.fatherName ?? editingUser.fatherName,
          dob: nextForm.dob ?? apiUser.dob ?? editingUser.dob,
          joiningDate: nextForm.joiningDate ?? apiUser.joiningDate ?? editingUser.joiningDate,
          leavingDate: nextForm.leavingDate ?? apiUser.leavingDate ?? editingUser.leavingDate,
          companyName: nextForm.companyName ?? apiUser.companyName ?? editingUser.companyName,
          department: nextForm.department ?? apiUser.department ?? editingUser.department,
          departmentId: nextForm.departmentId ?? apiUser.departmentId ?? editingUser.departmentId,
          subDepartment: nextForm.subDepartment ?? apiUser.subDepartment ?? editingUser.subDepartment,
          subDepartmentId: nextForm.subDepartmentId ?? apiUser.subDepartmentId ?? editingUser.subDepartmentId,
          line: nextForm.line ?? apiUser.line ?? editingUser.line,
          lineId: nextForm.lineId ?? apiUser.lineId ?? editingUser.lineId,
          machine: nextForm.machine ?? apiUser.machine ?? editingUser.machine,
          machineId: nextForm.machineId ?? apiUser.machineId ?? editingUser.machineId,
          shift: nextForm.shift ?? apiUser.shift ?? editingUser.shift,
          plant: nextForm.plant ?? apiUser.plant ?? editingUser.plant,
          plantLocation: nextForm.plantLocation ?? apiUser.plantLocation ?? editingUser.plantLocation,
          grade: nextForm.grade ?? apiUser.grade ?? editingUser.grade,
          designation: nextForm.designation ?? apiUser.designation ?? editingUser.designation,
          category: nextForm.category ?? apiUser.category ?? editingUser.category,
          gender: nextForm.gender ?? apiUser.gender ?? editingUser.gender,
          bloodGroup: nextForm.bloodGroup ?? apiUser.bloodGroup ?? editingUser.bloodGroup,
          maritalStatus: nextForm.maritalStatus ?? apiUser.maritalStatus ?? editingUser.maritalStatus,
          email: nextForm.email ?? apiUser.email ?? editingUser.email,
          number: nextForm.number ?? apiUser.number ?? editingUser.number,
          isDojo: nextForm.isDojo ?? apiUser.isDojo ?? editingUser.isDojo,
          firstOfDate: nextForm.firstOfDate ?? apiUser.firstOfDate ?? editingUser.firstOfDate,
          skillLevel: nextForm.skillLevel ?? apiUser.skillLevel ?? editingUser.skillLevel,
          salary: nextForm.salary ?? apiUser.salary ?? editingUser.salary,
          status: finalStatus,
          active: finalActive,
          is_active: finalActive,
        };

        // Immediately update React state with updated user object
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            const isMatch =
              (u.id != null && editingUser.id != null && String(u.id) === String(editingUser.id)) ||
              (u.payCode && editingUser.payCode && String(u.payCode) === String(editingUser.payCode));

            return isMatch ? updatedRow : u;
          }),
        );

        setFormModalOpen(false);
        showToast("User updated successfully.");

        // Fetch fresh server state while preserving our latest merged edits
        await refreshUsers(updatedRow);
      } else {
        const payload = buildCreatePayload(nextForm, lookups);
        const response = await UserApi.createUser(payload);
        const isInactive = isUserInactive(nextForm);
        const finalStatus = isInactive ? "Inactive" : "Active";
        const finalActive = !isInactive;

        const apiUser = response?.data ? mapUserFromApi(response.data) : {};
        const newUser = {
          ...nextForm,
          ...apiUser,
          id: apiUser.id ?? Date.now(),
          status: finalStatus,
          active: finalActive,
          is_active: finalActive,
        };

        setUsers((prevUsers) => [newUser, ...prevUsers]);
        setFormModalOpen(false);
        showToast("User added successfully.");
        await refreshUsers(newUser);
      }

      setFormModalOpen(false);
    } catch (error) {
      if (error?.response?.status === 401) {
        clearSession();
        showToast(
          getApiErrorMessage(error, "Access Denied: You have to login first."),
        );
        setTimeout(() => navigate("/"), 1500);
      } else {
        showToast(
          getApiErrorMessage(error, "Failed to save the user. Please try again."),
        );
      }
      console.error("Save user API error:", error);
    } finally {
      setSaving(false);
    }
  };

  /* ===================== DELETE ===================== */

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget || saving) return;

    if (!isAuthenticated()) {
      showToast("Access Denied: You have to login first.");
      navigate("/");
      return;
    }

    setSaving(true);

    try {
      const response = await UserApi.deleteUser(deleteTarget.id);

      // Immediately mark user as Inactive in local state so the table reflects the status right away
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          const isMatch =
            (u.id != null && deleteTarget.id != null && String(u.id) === String(deleteTarget.id)) ||
            (u.payCode && deleteTarget.payCode && String(u.payCode) === String(deleteTarget.payCode));

          return isMatch
            ? { ...u, active: false, is_active: false, status: "Inactive" }
            : u;
        }),
      );

      // Refresh authoritative list from backend to confirm database state
      await refreshUsers();
      showToast(response?.data?.message || "User deactivated successfully.");

      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      if (error?.response?.status === 401) {
        clearSession();
        showToast(
          getApiErrorMessage(error, "Access Denied: You have to login first."),
        );
        setTimeout(() => navigate("/"), 1500);
      } else {
        showToast(
          getApiErrorMessage(
            error,
            "Unable to delete the user. Please try again.",
          ),
        );
      }
      console.error("Delete user API error:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderFormField = (field) => {
    let value = form[field.key] ?? "";

    if (field.type === "date") {
      value = toDateInputValue(value);
    }

    if (field.key === "status") {
      const isInactive = isUserInactive(form);
      const statusValue = isInactive ? "Inactive" : "Active";
      return (
        <div className="relative">
          <select
            value={statusValue}
            onChange={(event) => {
              const val = event.target.value;
              const isNowInactive = val === "Inactive";
              setForm((previous) => ({
                ...previous,
                status: val,
                active: !isNowInactive,
                is_active: !isNowInactive,
              }));
            }}
            className={`${inputClass} appearance-none pr-9 font-medium text-[#0f172a] bg-white cursor-pointer`}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusValue === "Active"
                ? "bg-emerald-500 animate-pulse"
                : "bg-gray-400"
                }`}
            />
          </div>
        </div>
      );
    }

    if (field.key === "department") {
      const rawOptions = departments.map((d) => d.name);
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <div className="relative">
          <select
            value={value}
            onChange={(event) => {
              const selectedName = event.target.value;
              const deptObj = departments.find((d) => d.name === selectedName);
              setForm((previous) => {
                const next = {
                  ...previous,
                  department: selectedName,
                  departmentId: deptObj?.id ?? null,
                };
                if (
                  previous.subDepartment &&
                  deptObj?.id &&
                  subDepartments.some(
                    (sd) =>
                      sd.name === previous.subDepartment &&
                      sd.departmentId &&
                      String(sd.departmentId) !== String(deptObj.id),
                  )
                ) {
                  next.subDepartment = "";
                  next.subDepartmentId = null;
                  next.line = "";
                  next.lineId = null;
                  next.machine = "";
                  next.machineId = null;
                }
                return next;
              });
            }}
            className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer`}
          >
            <option value="">
              {loadingDropdowns && departments.length === 0
                ? "Loading departments..."
                : "Select department"}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            <ChevronDown size={16} />
          </div>
        </div>
      );
    }

    if (field.key === "subDepartment") {
      const selectedDept = departments.find((d) => d.name === form.department);
      const filtered = selectedDept?.id
        ? subDepartments.filter(
          (sd) =>
            !sd.departmentId ||
            String(sd.departmentId) === String(selectedDept.id),
        )
        : subDepartments;
      const activeList = filtered.length > 0 ? filtered : subDepartments;
      const rawOptions = activeList.map((sd) => sd.name);
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <div className="relative">
          <select
            value={value}
            onChange={(event) => {
              const selectedName = event.target.value;
              const subDeptObj = subDepartments.find(
                (sd) => sd.name === selectedName,
              );
              setForm((previous) => {
                const next = {
                  ...previous,
                  subDepartment: selectedName,
                  subDepartmentId: subDeptObj?.id ?? null,
                };
                if (subDeptObj?.departmentId && !previous.department) {
                  const parentDept = departments.find(
                    (d) => String(d.id) === String(subDeptObj.departmentId),
                  );
                  if (parentDept) {
                    next.department = parentDept.name;
                    next.departmentId = parentDept.id;
                  }
                }
                if (
                  previous.line &&
                  subDeptObj?.id &&
                  lines.some(
                    (l) =>
                      l.name === previous.line &&
                      l.subDepartmentId &&
                      String(l.subDepartmentId) !== String(subDeptObj.id),
                  )
                ) {
                  next.line = "";
                  next.lineId = null;
                  next.machine = "";
                  next.machineId = null;
                }
                return next;
              });
            }}
            className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer`}
          >
            <option value="">
              {loadingDropdowns && subDepartments.length === 0
                ? "Loading sub-departments..."
                : "Select sub-department"}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            <ChevronDown size={16} />
          </div>
        </div>
      );
    }

    if (field.key === "line") {
      const selectedSubDept = subDepartments.find(
        (sd) => sd.name === form.subDepartment,
      );
      const selectedDept = departments.find((d) => d.name === form.department);

      let filtered = lines;
      if (selectedSubDept?.id) {
        filtered = lines.filter(
          (l) =>
            !l.subDepartmentId ||
            String(l.subDepartmentId) === String(selectedSubDept.id),
        );
      } else if (selectedDept?.id) {
        filtered = lines.filter(
          (l) =>
            !l.departmentId ||
            String(l.departmentId) === String(selectedDept.id),
        );
      }

      const activeList = filtered.length > 0 ? filtered : lines;
      const rawOptions = activeList.map((l) => l.name);
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <div className="relative">
          <select
            value={value}
            onChange={(event) => {
              const selectedName = event.target.value;
              const lineObj = lines.find((l) => l.name === selectedName);
              setForm((previous) => {
                const next = {
                  ...previous,
                  line: selectedName,
                  lineId: lineObj?.id ?? null,
                };
                if (lineObj?.subDepartmentId && !previous.subDepartment) {
                  const parentSub = subDepartments.find(
                    (sd) => String(sd.id) === String(lineObj.subDepartmentId),
                  );
                  if (parentSub) {
                    next.subDepartment = parentSub.name;
                    next.subDepartmentId = parentSub.id;
                    if (parentSub.departmentId && !previous.department) {
                      const parentDept = departments.find(
                        (d) => String(d.id) === String(parentSub.departmentId),
                      );
                      if (parentDept) {
                        next.department = parentDept.name;
                        next.departmentId = parentDept.id;
                      }
                    }
                  }
                }
                if (
                  previous.machine &&
                  lineObj?.id &&
                  machines.some(
                    (m) =>
                      m.name === previous.machine &&
                      m.lineId &&
                      String(m.lineId) !== String(lineObj.id),
                  )
                ) {
                  next.machine = "";
                  next.machineId = null;
                }
                return next;
              });
            }}
            className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer`}
          >
            <option value="">
              {loadingDropdowns && lines.length === 0
                ? "Loading lines..."
                : "Select line"}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            <ChevronDown size={16} />
          </div>
        </div>
      );
    }

    if (field.key === "machine") {
      const selectedLine = lines.find((l) => l.name === form.line);
      const filtered = selectedLine?.id
        ? machines.filter(
          (m) =>
            !m.lineId || String(m.lineId) === String(selectedLine.id),
        )
        : machines;
      const activeList = filtered.length > 0 ? filtered : machines;
      const rawOptions = activeList.map((m) => m.name);
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <div className="relative">
          <select
            value={value}
            onChange={(event) => {
              const selectedName = event.target.value;
              const machObj = machines.find((m) => m.name === selectedName);
              setForm((previous) => {
                const next = {
                  ...previous,
                  machine: selectedName,
                  machineId: machObj?.id ?? null,
                };
                if (machObj?.lineId && !previous.line) {
                  const parentLine = lines.find(
                    (l) => String(l.id) === String(machObj.lineId),
                  );
                  if (parentLine) {
                    next.line = parentLine.name;
                    next.lineId = parentLine.id;
                    if (parentLine.subDepartmentId && !previous.subDepartment) {
                      const parentSub = subDepartments.find(
                        (sd) =>
                          String(sd.id) === String(parentLine.subDepartmentId),
                      );
                      if (parentSub) {
                        next.subDepartment = parentSub.name;
                        next.subDepartmentId = parentSub.id;
                        if (parentSub.departmentId && !previous.department) {
                          const parentDept = departments.find(
                            (d) =>
                              String(d.id) === String(parentSub.departmentId),
                          );
                          if (parentDept) {
                            next.department = parentDept.name;
                            next.departmentId = parentDept.id;
                          }
                        }
                      }
                    }
                  }
                }
                return next;
              });
            }}
            className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer`}
          >
            <option value="">
              {loadingDropdowns && machines.length === 0
                ? "Loading machines..."
                : "Select machine"}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            <ChevronDown size={16} />
          </div>
        </div>
      );
    }

    if (field.key === "shift") {
      const rawOptions = shifts
        .map((s) => (typeof s === "string" ? s : s.name ?? s.shiftName ?? s.id ?? ""))
        .filter(Boolean);
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <div className="relative">
          <select
            value={value}
            onChange={(event) => {
              const selectedName = event.target.value;
              const shiftObj = shifts.find(
                (s) =>
                  (typeof s === "string" && s === selectedName) ||
                  s.name === selectedName ||
                  String(s.id) === String(selectedName),
              );
              setForm((previous) => ({
                ...previous,
                shift: selectedName,
                shiftId: shiftObj?.id ?? null,
              }));
            }}
            className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer`}
          >
            <option value="">Select shift</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            <ChevronDown size={16} />
          </div>
        </div>
      );
    }

    if (field.key === "plantLocation") {
      let plantSelectValue = "";
      if (form.plantId != null && form.plantId !== "") {
        plantSelectValue = String(form.plantId);
      } else if (form.plantLocation) {
        const matched = plants.find(
          (p) =>
            String(p.id) === String(form.plantLocation) ||
            p.name === form.plantLocation ||
            p.raw?.plantName === form.plantLocation ||
            p.raw?.plantLocation === form.plantLocation,
        );
        if (matched) plantSelectValue = String(matched.id);
      } else if (form.plant) {
        const matched = plants.find(
          (p) => String(p.id) === String(form.plant) || p.name === form.plant,
        );
        if (matched) plantSelectValue = String(matched.id);
      }

      const isUnknownValue =
        plantSelectValue &&
        !plants.some((p) => String(p.id) === String(plantSelectValue));

      return (
        <div>
          <div className="relative">
            <select
              value={plantSelectValue}
              onChange={(event) => {
                const selectedId = event.target.value;
                if (!selectedId) {
                  setForm((previous) => ({
                    ...previous,
                    plantLocation: "",
                    plantId: null,
                    plant: "",
                  }));
                  return;
                }
                const matchedPlant = plants.find(
                  (p) => String(p.id) === String(selectedId),
                );
                const plantLabel =
                  matchedPlant?.raw?.plantLocation ||
                  matchedPlant?.name ||
                  matchedPlant?.raw?.plantName ||
                  `Plant #${selectedId}`;

                setForm((previous) => ({
                  ...previous,
                  plantLocation: plantLabel,
                  plantId: matchedPlant?.id ?? (Number(selectedId) || selectedId),
                  plant: String(matchedPlant?.id ?? selectedId),
                }));
              }}
              className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer ${plantsError
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : ""
                }`}
            >
              <option value="">
                {plantsError
                  ? "Failed to load plants — click to retry"
                  : (loadingDropdowns || loadingPlants) && plants.length === 0
                    ? "Loading plant locations..."
                    : "Select plant location"}
              </option>
              {plants.map((plant) => {
                const label =
                  plant.raw?.plantLocation ||
                  plant.name ||
                  plant.raw?.plantName ||
                  `Plant #${plant.id}`;
                return (
                  <option key={plant.id} value={plant.id}>
                    {label}
                  </option>
                );
              })}
              {isUnknownValue && (
                <option value={plantSelectValue}>
                  {form.plantLocation || `Plant #${plantSelectValue}`}
                </option>
              )}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              <ChevronDown size={16} />
            </div>
          </div>
          {plantsError && (
            <div className="mt-1.5 flex items-center justify-between text-xs text-rose-500">
              <span>{plantsError}</span>
              <button
                type="button"
                onClick={() => fetchPlants()}
                className="underline hover:text-rose-700 cursor-pointer font-medium"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      );
    }

    if (field.type === "select") {
      const rawOptions = field.options || [];
      const options =
        value && !rawOptions.includes(value)
          ? [value, ...rawOptions]
          : rawOptions;

      return (
        <div className="relative">
          <select
            value={value}
            onChange={setFormField(field.key)}
            className={`${inputClass} appearance-none pr-9 bg-white cursor-pointer`}
          >
            <option value="">Select {field.label.toLowerCase()}</option>

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            <ChevronDown size={16} />
          </div>
        </div>
      );
    }

    if (field.type === "password") {
      return (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={setFormField(field.key)}
            placeholder={
              editingUser
                ? "Leave blank to keep existing password"
                : field.placeholder
            }
            className={`${inputClass} pr-11`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f0f9f8] hover:text-[#0d9488]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
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
                <ManageAccountsOutlinedIcon sx={{ fontSize: 20, color: "#0d9488" }} />
              </div>

              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-[#0f172a]">Users Management</h1>

                <p className="mt-0.5 text-xs text-[#64748b]">
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
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e2edf2] bg-white px-4 py-2.5 text-xs font-semibold text-[#0f172a] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto shadow-xs"
              >
                <UploadCloud size={16} />
                Upload Excel
              </button>

              <button
                onClick={openAddModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:w-auto"
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
              onChange={(values) => {
                setFilterValues(values);
                setCurrentPage(1);
              }}
              departmentOptions={departments}
              subDepartmentOptions={subDepartments}
              lineOptions={lines}
              machineOptions={machines}
              shiftOptions={shiftOptions}
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
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
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
                      ...USER_TABLE_COLUMNS.map((column) => column.label),
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
                  {loading ? (
                    <tr>
                      <td colSpan={USER_TABLE_COLUMNS.length + 1} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <UsersIcon size={42} className="mb-3 animate-pulse opacity-40" />
                          <p className="text-sm">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={USER_TABLE_COLUMNS.length + 1} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <UsersIcon size={42} className="mb-3 opacity-40" />
                          <p className="mb-4 text-sm text-[#e74c3c]">{loadError}</p>
                          <button
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={USER_TABLE_COLUMNS.length + 1} className="p-0">
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <UsersIcon size={42} className="mb-3 opacity-40" />

                          <p className="mb-4 text-sm">No users found.</p>

                          <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all"
                          >
                            <CirclePlus size={15} />
                            Add User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((user, index) => {
                      const isInactive = isUserInactive(user);
                      const displayStatus = getUserDisplayStatus(user);

                      return (
                        <tr
                          key={user.id ?? user.payCode ?? index}
                          className={`group border-b border-[#edf0f2] last:border-0 transition-colors ${isInactive
                            ? "bg-[#f8f9fa] opacity-80 hover:bg-[#f1f3f5]"
                            : "hover:bg-[#fafaff]"
                            }`}
                        >
                          {USER_TABLE_COLUMNS.map((column) => (
                            <td
                              key={column.key}
                              className={`border-r border-[#edf0f2] px-3 py-3 text-[14px] last:border-r-0 sm:px-4 ${isInactive ? "text-[#8a99ad]" : "text-[#44556c]"
                                }`}
                            >
                              {column.key === "sno" ? (
                                startIndex + index + 1
                              ) : column.key === "status" ? (
                                isInactive ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 shadow-2xs">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                    Inactive
                                  </span>
                                ) : displayStatus === "Left" ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 shadow-2xs">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Left
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-2xs">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </span>
                                )
                              ) : column.key === "empName" ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewUser(user)}
                                    className={`font-semibold transition hover:underline ${isInactive
                                      ? "text-gray-500 hover:text-gray-700"
                                      : "text-[#0f172a] hover:text-[#0d9488]"
                                      }`}
                                  >
                                    {user[column.key]}
                                  </button>
                                  {isInactive && (
                                    <span className="rounded bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                      Inactive
                                    </span>
                                  )}
                                </div>
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
                                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#f8fafc] border border-[#e2edf2] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                title={isInactive ? "User is already inactive" : "Delete user"}
                                disabled={isInactive}
                                onClick={() => openDeleteModal(user)}
                                className={`flex h-[34px] w-[34px] items-center justify-center rounded-lg transition ${isInactive
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 opacity-60"
                                  : "bg-[#fff0ee] text-[#e74c3c] hover:bg-[#ffe3df]"
                                  }`}
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

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 border-t border-[#edf0f3] px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#64748b]">
                Showing{" "}
                <span className="font-semibold text-[#0f172a]">
                  {tableRows.length === 0 ? 0 : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[#0f172a]">
                  {Math.min(startIndex + ITEMS_PER_PAGE, tableRows.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#0f172a]">
                  {tableRows.length}
                </span>{" "}
                users
              </p>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage(Math.max(1, safeCurrentPage - 1))
                  }
                  className="flex h-8 items-center gap-1 rounded-lg border border-[#e2edf2] px-2.5 text-xs font-medium text-[#64748b] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-8 min-w-8 items-center justify-center px-1 text-xs text-[#94a3b8]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${safeCurrentPage === page
                        ? "bg-[#0d9488] text-white shadow-xs"
                        : "border border-[#e2edf2] text-[#64748b] hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488]"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))
                  }
                  className="flex h-8 items-center gap-1 rounded-lg border border-[#e2edf2] px-2.5 text-xs font-medium text-[#64748b] transition hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
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
                    <label className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span>
                        {field.label}
                        {field.key === "empName" && (
                          <span className="ml-0.5 text-[#e74c3c]">*</span>
                        )}
                      </span>
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
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
                Are you sure you want to deactivate{" "}
                <strong className="text-gray-900">
                  "{deleteTarget?.empName}"
                </strong>
                ? The user will be marked as inactive and retained for historical records.
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
                  disabled={saving}
                  className="rounded-lg bg-[#fff0ee] px-4 py-2.5 text-xs font-semibold text-[#e74c3c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Deactivate User
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

export default Users;
