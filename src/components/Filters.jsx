import { useCallback, useEffect, useMemo, useState } from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  RotateCw,
} from "lucide-react";

import PlantApi from "../features/lms/services/PlantApi";
import DepartmentApi from "../features/lms/services/DepartmentApi";
import SubDepartmentApi from "../features/lms/services/SubDepartmentApi";
import LinesApi from "../features/lms/services/LinesApi";
import MachinesApi from "../features/lms/services/MachinesApi";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDate = (iso) => {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getMonthCells = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    cells.push(new Date(year, month, 1 - offset + i));
  }

  return cells;
};

const formatDisplay = (iso) => {
  if (!iso) return "";

  const [year, month, day] = iso.split("-").map(Number);

  if (!year || !month || !day) return iso;

  return `${day} ${MONTH_SHORT[month - 1]} ${year}`;
};

const selectSx = {
  "& .MuiOutlinedInput-root": {
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    fontSize: "13px",
    color: "#0f172a",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2edf2",
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0d9488",
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0d9488",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    height: "44px",
    boxSizing: "border-box",
    padding: "0 34px 0 12px",
    fontSize: "13px",
  },

  "& .MuiSelect-icon": {
    right: "8px",
    color: "#666666",
    fontSize: "20px",
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      mt: 0.5,
      borderRadius: "8px",
      border: "1px solid #E5E5E5",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
      maxHeight: "240px",

      "& .MuiMenuItem-root": {
        fontSize: "13px",
        minHeight: "32px",
        padding: "6px 12px",
        color: "#171717",
        borderRadius: "6px",
        margin: "2px 4px",
      },

      "& .MuiMenuItem-root:hover": {
        backgroundColor: "#F7F7F5",
      },

      "& .MuiMenuItem-root.Mui-selected": {
        backgroundColor: "#e6f7f5",
        color: "#0f766e",
        fontWeight: 600,
      },

      "& .MuiMenuItem-root.Mui-selected:hover": {
        backgroundColor: "#ccf0eb",
      },
    },
  },

  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },

  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
};

const DEFAULT_SHIFT_OPTIONS = ["Shift A", "Shift B", "Shift C"];

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

const Filters = ({
  values: externalValues,
  onChange: externalOnChange,

  plantOptions: propPlantOptions,
  departmentOptions: propDepartmentOptions,
  subDepartmentOptions: propSubDepartmentOptions,
  lineOptions: propLineOptions,
  machineOptions: propMachineOptions,
  shiftOptions: propShiftOptions,
  showMachineShift = true,

  showDates = true,
}) => {
  const [internalValues, setInternalValues] = useState({
    plant: "",
    department: "",
    subDepartment: "",
    line: "",
    machine: "",
    shift: "",
    fromDate: "",
    toDate: "",
  });

  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [lines, setLines] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState({
    plants: false,
    departments: false,
    subDepartments: false,
    lines: false,
    machines: false,
  });

  const [errors, setErrors] = useState({
    plants: null,
    departments: null,
    subDepartments: null,
    lines: null,
    machines: null,
  });

  const [reloadKey, setReloadKey] = useState(0);

  const [dateAnchor, setDateAnchor] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [hoverDate, setHoverDate] = useState(null);

  const fetchFilterData = useCallback(async () => {
    setLoading({
      plants: true,
      departments: true,
      subDepartments: true,
      lines: true,
      machines: true,
    });
    setErrors({
      plants: null,
      departments: null,
      subDepartments: null,
      lines: null,
      machines: null,
    });

    try {
      const [
        plantsResult,
        departmentsResult,
        subDepartmentsResult,
        linesResult,
        machinesResult,
      ] = await Promise.allSettled([
        PlantApi.getPlants(),
        DepartmentApi.getDepartments(),
        SubDepartmentApi.getSubDepartments(),
        LinesApi.getLines(),
        MachinesApi.getMachines(),
      ]);

      if (plantsResult.status === "fulfilled") {
        setPlants(
          normalizeList(plantsResult.value?.data, [
            "plantName",
            "name",
            "plant_name",
          ]),
        );
      } else {
        console.error("Failed to fetch plants:", plantsResult.reason);
        setErrors((prev) => ({
          ...prev,
          plants:
            plantsResult.reason?.response?.data?.detail ||
            "Failed to load plants",
        }));
      }

      if (departmentsResult.status === "fulfilled") {
        setDepartments(
          normalizeList(departmentsResult.value?.data, [
            "departmentName",
            "name",
            "department_name",
          ]),
        );
      } else {
        console.error("Failed to fetch departments:", departmentsResult.reason);
        setErrors((prev) => ({
          ...prev,
          departments:
            departmentsResult.reason?.response?.data?.detail ||
            "Failed to load departments",
        }));
      }

      if (subDepartmentsResult.status === "fulfilled") {
        setSubDepartments(
          normalizeList(subDepartmentsResult.value?.data, [
            "subDepartmentName",
            "name",
            "sub_department_name",
          ]),
        );
      } else {
        console.error(
          "Failed to fetch sub-departments:",
          subDepartmentsResult.reason,
        );
        setErrors((prev) => ({
          ...prev,
          subDepartments:
            subDepartmentsResult.reason?.response?.data?.detail ||
            "Failed to load sub-departments",
        }));
      }

      if (linesResult.status === "fulfilled") {
        setLines(
          normalizeList(linesResult.value?.data, [
            "lineName",
            "name",
            "line_name",
          ]),
        );
      } else {
        console.error("Failed to fetch lines:", linesResult.reason);
        setErrors((prev) => ({
          ...prev,
          lines:
            linesResult.reason?.response?.data?.detail ||
            "Failed to load lines",
        }));
      }

      if (machinesResult.status === "fulfilled") {
        setMachines(
          normalizeList(machinesResult.value?.data, [
            "machineName",
            "name",
            "machine_name",
          ]),
        );
      } else {
        console.error("Failed to fetch machines:", machinesResult.reason);
        setErrors((prev) => ({
          ...prev,
          machines:
            machinesResult.reason?.response?.data?.detail ||
            "Failed to load machines",
        }));
      }
    } finally {
      setLoading({
        plants: false,
        departments: false,
        subDepartments: false,
        lines: false,
        machines: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData, reloadKey]);

  const values = {
    plant: "",
    department: "",
    subDepartment: "",
    line: "",
    machine: "",
    shift: "",
    fromDate: "",
    toDate: "",
    ...(externalValues ?? internalValues),
  };

  const basePlants = useMemo(() => {
    return propPlantOptions && propPlantOptions.length > 0
      ? normalizeList(propPlantOptions, ["plantName", "name"])
      : plants;
  }, [propPlantOptions, plants]);

  const baseDepartments = useMemo(() => {
    return propDepartmentOptions && propDepartmentOptions.length > 0
      ? normalizeList(propDepartmentOptions, ["departmentName", "name"])
      : departments;
  }, [propDepartmentOptions, departments]);

  const baseSubDepartments = useMemo(() => {
    return propSubDepartmentOptions && propSubDepartmentOptions.length > 0
      ? normalizeList(propSubDepartmentOptions, ["subDepartmentName", "name"])
      : subDepartments;
  }, [propSubDepartmentOptions, subDepartments]);

  const baseLines = useMemo(() => {
    return propLineOptions && propLineOptions.length > 0
      ? normalizeList(propLineOptions, ["lineName", "name"])
      : lines;
  }, [propLineOptions, lines]);

  const baseMachines = useMemo(() => {
    return propMachineOptions && propMachineOptions.length > 0
      ? normalizeList(propMachineOptions, ["machineName", "name"])
      : machines;
  }, [propMachineOptions, machines]);

  const activeShiftOptions = useMemo(() => {
    if (propShiftOptions && propShiftOptions.length > 0) return propShiftOptions;
    return DEFAULT_SHIFT_OPTIONS;
  }, [propShiftOptions]);

  // Hierarchical cascading: if a parent value is selected, filter children when IDs match
  const activePlantOptions = basePlants;

  const activeDepartmentOptions = useMemo(() => {
    if (!values.plant) return baseDepartments;
    const selectedPlant = basePlants.find((p) => p.name === values.plant);
    if (!selectedPlant?.id) return baseDepartments;
    const filtered = baseDepartments.filter(
      (d) => !d.plantId || String(d.plantId) === String(selectedPlant.id),
    );
    return filtered.length > 0 ? filtered : baseDepartments;
  }, [values.plant, basePlants, baseDepartments]);

  const activeSubDepartmentOptions = useMemo(() => {
    if (!values.department) return baseSubDepartments;
    const selectedDept = baseDepartments.find((d) => d.name === values.department);
    if (!selectedDept?.id) return baseSubDepartments;
    const filtered = baseSubDepartments.filter(
      (sd) => !sd.departmentId || String(sd.departmentId) === String(selectedDept.id),
    );
    return filtered.length > 0 ? filtered : baseSubDepartments;
  }, [values.department, baseDepartments, baseSubDepartments]);

  const activeLineOptions = useMemo(() => {
    if (!values.subDepartment) return baseLines;
    const selectedSubDept = baseSubDepartments.find(
      (sd) => sd.name === values.subDepartment,
    );
    if (!selectedSubDept?.id) return baseLines;
    const filtered = baseLines.filter(
      (l) => !l.subDepartmentId || String(l.subDepartmentId) === String(selectedSubDept.id),
    );
    return filtered.length > 0 ? filtered : baseLines;
  }, [values.subDepartment, baseSubDepartments, baseLines]);

  const activeMachineOptions = useMemo(() => {
    if (!values.line) return baseMachines;
    const selectedLine = baseLines.find((l) => l.name === values.line);
    if (!selectedLine?.id) return baseMachines;
    const filtered = baseMachines.filter(
      (m) => !m.lineId || String(m.lineId) === String(selectedLine.id),
    );
    return filtered.length > 0 ? filtered : baseMachines;
  }, [values.line, baseLines, baseMachines]);

  const commitValues = (nextValues) => {
    if (externalOnChange) {
      externalOnChange(nextValues);
    } else {
      setInternalValues(nextValues);
    }
  };

  const updateValue = (key) => (event) => {
    commitValues({
      ...values,
      [key]: event.target.value,
    });
  };

  const isAnyLoading =
    loading.plants ||
    loading.departments ||
    loading.subDepartments ||
    loading.lines ||
    loading.machines;

  const openDatePicker = (event) => {
    setDateAnchor(event.currentTarget);

    const initial = toDate(values.fromDate) || new Date();
    setViewMonth(startOfMonth(initial));
  };

  const closeDatePicker = () => {
    setDateAnchor(null);
    setHoverDate(null);
  };

  const handleDayClick = (date) => {
    const iso = toISODate(date);
    const { fromDate, toDate: existingToDate } = values;

    if (!fromDate || (fromDate && existingToDate)) {
      commitValues({ ...values, fromDate: iso, toDate: "" });
    } else if (iso <= fromDate) {
      commitValues({ ...values, fromDate: iso });
    } else {
      commitValues({ ...values, toDate: iso });
      setDateAnchor(null);
      setHoverDate(null);
    }
  };

  const clearDates = () => {
    commitValues({ ...values, fromDate: "", toDate: "" });
    setHoverDate(null);
  };

  const shownMonths = useMemo(
    () => [viewMonth, addMonths(viewMonth, 1)],
    [viewMonth],
  );

  const monthCells = useMemo(
    () =>
      shownMonths.map((month) =>
        getMonthCells(month.getFullYear(), month.getMonth()),
      ),
    [shownMonths],
  );

  const { fromDate, toDate: selectedToDate } = values;
  const hoveredToDate = !selectedToDate && hoverDate ? toISODate(hoverDate) : selectedToDate;

  const getDayClass = (date) => {
    const iso = toISODate(date);
    const base =
      "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] transition hover:bg-[#e6f7f5] text-[#0f172a]";

    if (fromDate && iso === fromDate) {
      return "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold bg-[#0d9488] text-white hover:bg-[#0f766e]";
    }

    if (hoveredToDate && iso === hoveredToDate && iso !== fromDate) {
      return "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold bg-[#0d9488] text-white hover:bg-[#0f766e]";
    }

    if (
      fromDate &&
      hoveredToDate &&
      iso > fromDate &&
      iso < hoveredToDate
    ) {
      return "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] bg-[#e6f7f5] text-[#0d9488] hover:bg-[#ccfbf1]";
    }

    return base;
  };

  const hasDate = Boolean(fromDate || selectedToDate);
  const displayLabel = fromDate
    ? `${formatDisplay(fromDate)}${selectedToDate ? ` - ${formatDisplay(selectedToDate)}` : ""}`
    : "Date";

  return (
    <div className="mb-4 w-full rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md px-4 py-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
      <div className="flex w-full flex-wrap items-center gap-3">

        {/* Filter Title & Refresh Button */}
        <div className="flex h-[44px] shrink-0 items-center gap-2 px-1">
          <FilterAltOutlinedIcon
            sx={{
              fontSize: 20,
              color: "#0d9488",
            }}
          />

          <span className="whitespace-nowrap text-sm font-bold text-[#0f172a]">
            Filters
          </span>

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Refresh filter options from API"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
          >
            <RotateCw
              size={13}
              className={isAnyLoading ? "animate-spin text-[#0d9488]" : ""}
            />
          </button>
        </div>

        {/* Plant */}
        <div className="w-full sm:w-[130px] lg:flex-[0.9]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.plant || ""}
              displayEmpty
              disabled={loading.plants}
              onChange={updateValue("plant")}
              MenuProps={menuProps}
              renderValue={(selected) => {
                if (loading.plants) {
                  return (
                    <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                      <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                      Loading...
                    </span>
                  );
                }
                if (errors.plants) {
                  return (
                    <span
                      className="flex items-center gap-1 text-xs text-amber-600 truncate"
                      title={errors.plants}
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      Plant Error
                    </span>
                  );
                }
                if (!selected) {
                  return (
                    <span className="text-[#475569]">
                      Plant
                    </span>
                  );
                }

                return selected;
              }}
            >
              <MenuItem value="">
                <em>All Plants</em>
              </MenuItem>
              {loading.plants && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                    Loading plants...
                  </span>
                </MenuItem>
              )}
              {errors.plants && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle size={13} />
                    {errors.plants}
                  </span>
                </MenuItem>
              )}
              {!loading.plants && !errors.plants && activePlantOptions.length === 0 && (
                <MenuItem disabled>
                  <span className="text-xs text-slate-400">No plants available</span>
                </MenuItem>
              )}
              {activePlantOptions.map((opt) => (
                <MenuItem key={opt.id ?? opt.name} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Department */}
        <div className="w-full sm:w-[150px] lg:flex-1">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.department || ""}
              displayEmpty
              disabled={loading.departments}
              onChange={updateValue("department")}
              MenuProps={menuProps}
              renderValue={(selected) => {
                if (loading.departments) {
                  return (
                    <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                      <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                      Loading...
                    </span>
                  );
                }
                if (errors.departments) {
                  return (
                    <span
                      className="flex items-center gap-1 text-xs text-amber-600 truncate"
                      title={errors.departments}
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      Dept Error
                    </span>
                  );
                }
                if (!selected) {
                  return (
                    <span className="text-[#475569]">
                      Department
                    </span>
                  );
                }

                return selected;
              }}
            >
              <MenuItem value="">
                <em>All Departments</em>
              </MenuItem>
              {loading.departments && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                    Loading departments...
                  </span>
                </MenuItem>
              )}
              {errors.departments && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle size={13} />
                    {errors.departments}
                  </span>
                </MenuItem>
              )}
              {!loading.departments && !errors.departments && activeDepartmentOptions.length === 0 && (
                <MenuItem disabled>
                  <span className="text-xs text-slate-400">No departments available</span>
                </MenuItem>
              )}
              {activeDepartmentOptions.map((opt) => (
                <MenuItem key={opt.id ?? opt.name} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Sub Department */}
        <div className="w-full sm:w-[175px] lg:flex-[1.15]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.subDepartment || ""}
              displayEmpty
              disabled={loading.subDepartments}
              onChange={updateValue("subDepartment")}
              MenuProps={menuProps}
              renderValue={(selected) => {
                if (loading.subDepartments) {
                  return (
                    <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                      <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                      Loading...
                    </span>
                  );
                }
                if (errors.subDepartments) {
                  return (
                    <span
                      className="flex items-center gap-1 text-xs text-amber-600 truncate"
                      title={errors.subDepartments}
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      Sub-Dept Error
                    </span>
                  );
                }
                if (!selected) {
                  return (
                    <span className="text-[#475569]">
                      Sub Department
                    </span>
                  );
                }

                return selected;
              }}
            >
              <MenuItem value="">
                <em>All Sub Departments</em>
              </MenuItem>
              {loading.subDepartments && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                    Loading sub-departments...
                  </span>
                </MenuItem>
              )}
              {errors.subDepartments && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle size={13} />
                    {errors.subDepartments}
                  </span>
                </MenuItem>
              )}
              {!loading.subDepartments && !errors.subDepartments && activeSubDepartmentOptions.length === 0 && (
                <MenuItem disabled>
                  <span className="text-xs text-slate-400">No sub-departments available</span>
                </MenuItem>
              )}
              {activeSubDepartmentOptions.map((opt) => (
                <MenuItem key={opt.id ?? opt.name} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Line */}
        <div className="w-full sm:w-[120px] lg:flex-[0.8]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.line || ""}
              displayEmpty
              disabled={loading.lines}
              onChange={updateValue("line")}
              MenuProps={menuProps}
              renderValue={(selected) => {
                if (loading.lines) {
                  return (
                    <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                      <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                      Loading...
                    </span>
                  );
                }
                if (errors.lines) {
                  return (
                    <span
                      className="flex items-center gap-1 text-xs text-amber-600 truncate"
                      title={errors.lines}
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      Line Error
                    </span>
                  );
                }
                if (!selected) {
                  return (
                    <span className="text-[#475569]">
                      Line
                    </span>
                  );
                }

                return selected;
              }}
            >
              <MenuItem value="">
                <em>All Lines</em>
              </MenuItem>
              {loading.lines && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                    Loading lines...
                  </span>
                </MenuItem>
              )}
              {errors.lines && (
                <MenuItem disabled>
                  <span className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle size={13} />
                    {errors.lines}
                  </span>
                </MenuItem>
              )}
              {!loading.lines && !errors.lines && activeLineOptions.length === 0 && (
                <MenuItem disabled>
                  <span className="text-xs text-slate-400">No lines available</span>
                </MenuItem>
              )}
              {activeLineOptions.map((opt) => (
                <MenuItem key={opt.id ?? opt.name} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Machine */}
        {showMachineShift && (
          <div className="w-full sm:w-[120px] lg:flex-[0.8]">
            <FormControl fullWidth size="small" sx={selectSx}>
              <Select
                value={values.machine || ""}
                displayEmpty
                disabled={loading.machines}
                onChange={updateValue("machine")}
                MenuProps={menuProps}
                renderValue={(selected) => {
                  if (loading.machines) {
                    return (
                      <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                        <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                        Loading...
                      </span>
                    );
                  }
                  if (errors.machines) {
                    return (
                      <span
                        className="flex items-center gap-1 text-xs text-amber-600 truncate"
                        title={errors.machines}
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        Machine Error
                      </span>
                    );
                  }
                  if (!selected) {
                    return (
                      <span className="text-[#475569]">
                        Machine
                      </span>
                    );
                  }

                  return selected;
                }}
              >
                <MenuItem value="">
                  <em>All Machines</em>
                </MenuItem>
                {loading.machines && (
                  <MenuItem disabled>
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 size={13} className="animate-spin text-[#0d9488]" />
                      Loading machines...
                    </span>
                  </MenuItem>
                )}
                {errors.machines && (
                  <MenuItem disabled>
                    <span className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.machines}
                    </span>
                  </MenuItem>
                )}
                {!loading.machines && !errors.machines && activeMachineOptions.length === 0 && (
                  <MenuItem disabled>
                    <span className="text-xs text-slate-400">No machines available</span>
                  </MenuItem>
                )}
                {activeMachineOptions.map((opt) => (
                  <MenuItem key={opt.id ?? opt.name} value={opt.name}>
                    {opt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Shift */}
        {showMachineShift && (
          <div className="w-full sm:w-[120px] lg:flex-[0.8]">
            <FormControl fullWidth size="small" sx={selectSx}>
              <Select
                value={values.shift || ""}
                displayEmpty
                onChange={updateValue("shift")}
                MenuProps={menuProps}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span className="text-[#475569]">
                        Shift
                      </span>
                    );
                  }

                  return selected;
                }}
              >
                <MenuItem value="">
                  <em>All Shifts</em>
                </MenuItem>
                {activeShiftOptions.map((opt) => {
                  const val = typeof opt === "string" ? opt : opt.name;
                  return (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Date Range */}
        {showDates && (
          <div className="w-full sm:w-[220px] lg:flex-[1.4]">
            <div
              onClick={openDatePicker}
              className="flex h-[44px] cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#e2edf2] bg-white px-3 transition hover:border-[#0d9488] shadow-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <CalendarDays
                  size={16}
                  className="shrink-0 text-[#666666]"
                />

                <span
                  className={`truncate text-xs ${
                    hasDate ? "text-[#171717] font-medium" : "text-[#8A8A8A]"
                  }`}
                >
                  {displayLabel}
                </span>
              </div>

              {hasDate && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    clearDates();
                  }}
                  className="flex shrink-0 items-center rounded-full p-1 text-[#64748b] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                  title="Clear date"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Popover
              open={Boolean(dateAnchor)}
              anchorEl={dateAnchor}
              onClose={closeDatePicker}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                sx: {
                  mt: 0.5,
                  borderRadius: "16px",
                  border: "1px solid #e2edf2",
                  boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.1), 0 8px 10px -6px rgba(13, 148, 136, 0.1)",
                },
              }}
            >
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-xs font-bold text-[#0f172a]">
                    Select Date
                  </span>

                  <button
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {shownMonths.map((month, index) => (
                    <div key={`${month.getFullYear()}-${month.getMonth()}`}>
                      <div className="mb-2 flex items-center justify-center text-xs font-bold text-[#0f172a]">
                        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {WEEKDAYS.map((weekday) => (
                          <div
                            key={weekday}
                            className="flex h-9 items-center justify-center text-[11px] font-medium text-[#8A8A8A]"
                          >
                            {weekday}
                          </div>
                        ))}

                        {monthCells[index].map((day, dayIndex) => {
                          if (day.getMonth() !== month.getMonth()) {
                            return <div key={dayIndex} />;
                          }

                          const iso = toISODate(day);
                          const isToday =
                            iso === toISODate(new Date());

                          return (
                            <button
                              key={dayIndex}
                              type="button"
                              onClick={() => handleDayClick(day)}
                              onMouseEnter={() => setHoverDate(day)}
                              onMouseLeave={() => setHoverDate(null)}
                              className={`${getDayClass(day)} ${
                                isToday &&
                                !(
                                  (fromDate && iso === fromDate) ||
                                  (hoveredToDate &&
                                    iso === hoveredToDate)
                                )
                                  ? "ring-1 ring-inset ring-[#0d9488]"
                                  : ""
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#e2edf2] pt-3">
                  <span className="text-xs text-[#64748b]">
                    {fromDate
                      ? `${formatDisplay(fromDate)}${selectedToDate ? ` - ${formatDisplay(selectedToDate)}` : " - Select end date"}`
                      : "Select start date"}
                  </span>

                  <button
                    onClick={clearDates}
                    className="text-xs font-semibold text-[#0d9488] transition hover:text-[#0f766e] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;