import { useMemo, useState } from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

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
    borderRadius: "10px",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#475569",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D9E0E8",
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C7D2FE",
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7C5CFC",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    height: "44px",
    boxSizing: "border-box",
    padding: "0 36px 0 13px",
    fontSize: "14px",
  },

  "& .MuiSelect-icon": {
    right: "8px",
    color: "#64748B",
    fontSize: "22px",
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      mt: 0.5,
      borderRadius: "10px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
      maxHeight: "240px",

      "& .MuiMenuItem-root": {
        fontSize: "14px",
        minHeight: "34px",
        padding: "7px 13px",
        color: "#475569",
        borderRadius: "6px",
        margin: "2px 5px",
      },

      "& .MuiMenuItem-root:hover": {
        backgroundColor: "#F5F3FF",
      },

      "& .MuiMenuItem-root.Mui-selected": {
        backgroundColor: "#F0EDFF",
        color: "#5B3FD1",
      },

      "& .MuiMenuItem-root.Mui-selected:hover": {
        backgroundColor: "#E9E5FF",
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

const Filters = ({
  values: externalValues,
  onChange: externalOnChange,

  plantOptions = ["UNIT-5"],

  departmentOptions = [
    "LB",
    "ACCESSORIES",
    "STORE",
    "PAINT SHOP",
    "TCM",
    "PIM",
    "QUALITY",
    "DISPATCH",
    "ADMIN",
    "YED LINE",
    "MAINTENANCE",
  ],

  subDepartmentOptions = [
    "LB",
    "ACCESSORIES",
    "STORE",
    "PAINT SHOP",
    "TCM",
    "PIM",
    "QUALITY",
    "DISPATCH",
    "ADMIN",
    "YED LINE",
    "MAINTENANCE",
    "DRIVER",
  ],

  lineOptions = [],
  machineOptions = [],
  shiftOptions = [],

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

  const [dateAnchor, setDateAnchor] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [hoverDate, setHoverDate] = useState(null);

  const values = externalValues ?? internalValues;

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
      "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] transition hover:bg-[#EDE9FE]";

    if (fromDate && iso === fromDate) {
      return "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold bg-[#7C5CFC] text-white hover:bg-[#6A44E8]";
    }

    if (hoveredToDate && iso === hoveredToDate && iso !== fromDate) {
      return "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold bg-[#7C5CFC] text-white hover:bg-[#6A44E8]";
    }

    if (
      fromDate &&
      hoveredToDate &&
      iso > fromDate &&
      iso < hoveredToDate
    ) {
      return "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[13px] bg-[#F0EDFF] text-[#5B3FD1] hover:bg-[#E9E5FF]";
    }

    return base;
  };

  const hasDate = Boolean(fromDate || selectedToDate);
  const displayLabel = fromDate
    ? `${formatDisplay(fromDate)}${selectedToDate ? ` - ${formatDisplay(selectedToDate)}` : ""}`
    : "Date";

  return (
    <div className="mb-4 w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex w-full flex-wrap items-center gap-3">

        {/* Filter */}
        <div className="flex h-[44px] shrink-0 items-center gap-2 px-1">
          <FilterAltOutlinedIcon
            sx={{
              fontSize: 22,
              color: "#334155",
            }}
          />

          <span className="whitespace-nowrap text-[15px] font-semibold text-[#334155]">
            Filters
          </span>
        </div>

        {/* Plant */}
        <div className="w-full sm:w-[130px] lg:flex-[0.9]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.plant}
              displayEmpty
              onChange={updateValue("plant")}
              MenuProps={menuProps}
              renderValue={(selected) => {
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
              {plantOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Department */}
        <div className="w-full sm:w-[150px] lg:flex-1">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.department}
              displayEmpty
              onChange={updateValue("department")}
              MenuProps={menuProps}
              renderValue={(selected) => {
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
              {departmentOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Sub Department */}
        <div className="w-full sm:w-[175px] lg:flex-[1.15]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.subDepartment}
              displayEmpty
              onChange={updateValue("subDepartment")}
              MenuProps={menuProps}
              renderValue={(selected) => {
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
              {subDepartmentOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Line */}
        <div className="w-full sm:w-[120px] lg:flex-[0.8]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.line}
              displayEmpty
              onChange={updateValue("line")}
              MenuProps={menuProps}
              renderValue={(selected) => {
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
              {lineOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Machine */}
        <div className="w-full sm:w-[120px] lg:flex-[0.8]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.machine}
              displayEmpty
              onChange={updateValue("machine")}
              MenuProps={menuProps}
              renderValue={(selected) => {
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
              {machineOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Shift */}
        <div className="w-full sm:w-[120px] lg:flex-[0.8]">
          <FormControl fullWidth size="small" sx={selectSx}>
            <Select
              value={values.shift}
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
              {shiftOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Date Range */}
        {showDates && (
          <div className="w-full sm:w-[220px] lg:flex-[1.4]">
            <div
              onClick={openDatePicker}
              className="flex h-[44px] cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#D9E0E8] bg-white px-3 transition hover:border-[#C7D2FE]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <CalendarDays
                  size={18}
                  className="shrink-0 text-[#64748B]"
                />

                <span
                  className={`truncate text-[14px] ${
                    hasDate ? "text-[#475569]" : "text-[#94A3B8]"
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
                  className="flex shrink-0 items-center rounded-full p-1 text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#334155]"
                  title="Clear date"
                >
                  <X size={15} />
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
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
                },
              }}
            >
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#334155]"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-[13px] font-semibold text-[#334155]">
                    Select Date
                  </span>

                  <button
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#334155]"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {shownMonths.map((month, index) => (
                    <div key={`${month.getFullYear()}-${month.getMonth()}`}>
                      <div className="mb-2 flex items-center justify-center text-[13px] font-semibold text-[#334155]">
                        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {WEEKDAYS.map((weekday) => (
                          <div
                            key={weekday}
                            className="flex h-9 items-center justify-center text-[11px] font-medium text-[#94A3B8]"
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
                                  ? "ring-1 ring-inset ring-[#C7D2FE]"
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

                <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                  <span className="text-[12px] text-[#64748B]">
                    {fromDate
                      ? `${formatDisplay(fromDate)}${selectedToDate ? ` - ${formatDisplay(selectedToDate)}` : " - Select end date"}`
                      : "Select start date"}
                  </span>

                  <button
                    onClick={clearDates}
                    className="text-[13px] font-semibold text-[#7C5CFC] transition hover:text-[#5B3FD1]"
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