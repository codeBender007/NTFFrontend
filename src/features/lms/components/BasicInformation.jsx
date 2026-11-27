import { useRef, useState, useEffect } from "react";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DepartmentApi from "../services/DepartmentApi";
import SubDepartmentApi from "../services/SubDepartmentApi";
import LinesApi from "../services/LinesApi";
import MachinesApi from "../services/MachinesApi";

const extractArray = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

const getItemId = (item) =>
  String(
    item?.id ??
      item?._id ??
      item?.departmentId ??
      item?.subDepartmentId ??
      item?.lineId ??
      item?.machineId ??
      "",
  );

const getDepartmentName = (d) =>
  d?.departmentName ?? d?.department_name ?? d?.name ?? "";

const getSubDepartmentName = (s) =>
  s?.subDepartmentName ?? s?.sub_department_name ?? s?.name ?? "";

const getLineName = (l) => l?.lineName ?? l?.line_name ?? l?.name ?? "";

const getMachineName = (m) =>
  m?.machineName ?? m?.machine_name ?? m?.name ?? "";

const inputClass =
  "w-full h-10 rounded-lg border border-slate-200 px-3.5 text-sm outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15 transition";

const selectClass =
  "w-full h-10 appearance-none rounded-lg border border-slate-200 px-3.5 pr-9 text-sm outline-none bg-white text-slate-900 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15 transition";

const textareaClass =
  "w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15 transition";
const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";
const hintClass = "mt-1 text-[11px] text-slate-400";

const BasicInformation = ({ onNext, initialData = {}, onChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    testTitle: initialData.testTitle || "SKILL EVALUATION TEST PAPER",
    description:
      initialData.description ||
      "Assessment module for technical skills & safety procedures.",
    headerTitle:
      initialData.headerTitle || "NTF TECHNICAL EVALUATION TEST PAPER",
    subTitle: initialData.subTitle || "New Manpower Technical Assessment",
    departments: initialData.departments || "",
    departmentId: initialData.departmentId || "",
    sections: initialData.sections || "",
    subDepartmentId: initialData.subDepartmentId || "",
    lines: initialData.lines || "",
    lineId: initialData.lineId || "",
    subSections: initialData.subSections || "",
    machines: initialData.machines || "",
    machineId: initialData.machineId || "",
    levels: initialData.levels || "",
    duration: initialData.duration || "",
    passPercentage: initialData.passPercentage || "",
  });

  const [departmentsList, setDepartmentsList] = useState([]);
  const [subDepartmentsList, setSubDepartmentsList] = useState([]);
  const [linesList, setLinesList] = useState([]);
  const [machinesList, setMachinesList] = useState([]);

  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingSubDepts, setLoadingSubDepts] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, []);

  // Fetch all departments from LMS -> Plant API
  useEffect(() => {
    let active = true;
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      try {
        const res = await DepartmentApi.getDepartments();
        if (!active) return;
        const list = extractArray(res)
          .map((d) => ({
            id: getItemId(d),
            name: getDepartmentName(d),
          }))
          .filter((d) => d.id && d.name);
        setDepartmentsList(list);

        // Resolve departmentId if initialData only had department name
        if (!formData.departmentId && formData.departments) {
          const matched = list.find(
            (d) =>
              d.name.toLowerCase() === formData.departments.toLowerCase() ||
              d.id === String(formData.departments),
          );
          if (matched) {
            setFormData((prev) => {
              const next = {
                ...prev,
                departments: matched.name,
                departmentId: matched.id,
              };
              if (onChange) onChange(next);
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        if (active) setDepartmentsList([]);
      } finally {
        if (active) setLoadingDepts(false);
      }
    };
    fetchDepartments();
    return () => {
      active = false;
    };
  }, []);

  // Fetch sub-departments dynamically (cascading by selected department)
  useEffect(() => {
    let active = true;
    const fetchSubDepartments = async () => {
      setLoadingSubDepts(true);
      try {
        const res = formData.departmentId
          ? await SubDepartmentApi.getSubDepartmentsByDepartment(
              formData.departmentId,
            )
          : await SubDepartmentApi.getSubDepartments();
        if (!active) return;
        const list = extractArray(res)
          .map((s) => ({
            id: getItemId(s),
            name: getSubDepartmentName(s),
            departmentId: String(s?.departmentId ?? s?.department_id ?? ""),
          }))
          .filter((s) => s.id && s.name);
        setSubDepartmentsList(list);

        if (!formData.subDepartmentId && formData.sections) {
          const matched = list.find(
            (s) =>
              s.name.toLowerCase() === formData.sections.toLowerCase() ||
              s.id === String(formData.sections),
          );
          if (matched) {
            setFormData((prev) => {
              const next = {
                ...prev,
                sections: matched.name,
                subDepartmentId: matched.id,
              };
              if (onChange) onChange(next);
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching sub-departments:", err);
        if (active) setSubDepartmentsList([]);
      } finally {
        if (active) setLoadingSubDepts(false);
      }
    };
    fetchSubDepartments();
    return () => {
      active = false;
    };
  }, [formData.departmentId]);

  // Fetch lines dynamically (cascading by selected sub-department or department)
  useEffect(() => {
    let active = true;
    const fetchLines = async () => {
      setLoadingLines(true);
      try {
        let res;
        if (formData.subDepartmentId) {
          res = await LinesApi.getLinesBySubDepartment(
            formData.subDepartmentId,
          );
        } else {
          const params = {};
          if (formData.departmentId) params.departmentId = formData.departmentId;
          res = await LinesApi.getLines(params);
        }
        if (!active) return;
        const list = extractArray(res)
          .map((l) => ({
            id: getItemId(l),
            name: getLineName(l),
            subDepartmentId: String(
              l?.subDepartmentId ?? l?.sub_department_id ?? "",
            ),
          }))
          .filter((l) => l.id && l.name);
        setLinesList(list);

        if (!formData.lineId && formData.lines) {
          const matched = list.find(
            (l) =>
              l.name.toLowerCase() === formData.lines.toLowerCase() ||
              l.id === String(formData.lines),
          );
          if (matched) {
            setFormData((prev) => {
              const next = {
                ...prev,
                lines: matched.name,
                lineId: matched.id,
              };
              if (onChange) onChange(next);
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching lines:", err);
        if (active) setLinesList([]);
      } finally {
        if (active) setLoadingLines(false);
      }
    };
    fetchLines();
    return () => {
      active = false;
    };
  }, [formData.departmentId, formData.subDepartmentId]);

  // Fetch machines dynamically (cascading by selected line, sub-department, or department)
  useEffect(() => {
    let active = true;
    const fetchMachines = async () => {
      setLoadingMachines(true);
      try {
        let res;
        if (formData.lineId) {
          res = await MachinesApi.getMachinesByLine(formData.lineId);
        } else {
          const params = {};
          if (formData.departmentId) params.departmentId = formData.departmentId;
          if (formData.subDepartmentId)
            params.subDepartmentId = formData.subDepartmentId;
          res = await MachinesApi.getMachines(params);
        }
        if (!active) return;
        const list = extractArray(res)
          .map((m) => ({
            id: getItemId(m),
            name: getMachineName(m),
            lineId: String(m?.lineId ?? m?.line_id ?? ""),
          }))
          .filter((m) => m.id && m.name);
        setMachinesList(list);

        if (!formData.machineId && formData.machines) {
          const matched = list.find(
            (m) =>
              m.name.toLowerCase() === formData.machines.toLowerCase() ||
              m.id === String(formData.machines),
          );
          if (matched) {
            setFormData((prev) => {
              const next = {
                ...prev,
                machines: matched.name,
                machineId: matched.id,
              };
              if (onChange) onChange(next);
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching machines:", err);
        if (active) setMachinesList([]);
      } finally {
        if (active) setLoadingMachines(false);
      }
    };
    fetchMachines();
    return () => {
      active = false;
    };
  }, [formData.departmentId, formData.subDepartmentId, formData.lineId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "departments") {
      const matched = departmentsList.find((d) => d.name === value);
      updated = {
        ...updated,
        departments: value,
        departmentId: matched?.id || "",
        sections: "",
        subDepartmentId: "",
        lines: "",
        lineId: "",
        machines: "",
        machineId: "",
      };
    } else if (name === "sections") {
      const matched = subDepartmentsList.find((s) => s.name === value);
      updated = {
        ...updated,
        sections: value,
        subDepartmentId: matched?.id || "",
        lines: "",
        lineId: "",
        machines: "",
        machineId: "",
      };
    } else if (name === "lines") {
      const matched = linesList.find((l) => l.name === value);
      updated = {
        ...updated,
        lines: value,
        lineId: matched?.id || "",
        machines: "",
        machineId: "",
      };
    } else if (name === "machines") {
      const matched = machinesList.find((m) => m.name === value);
      updated = {
        ...updated,
        machines: value,
        machineId: matched?.id || "",
      };
    }

    setFormData(updated);
    if (onChange) onChange(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNext) onNext(formData);
  };

  const requiredFields = [
    "departments",
    "sections",
    "lines",
    "machines",
    "levels",
    "duration",
    "passPercentage",
  ];

  const isComplete = requiredFields.every(
    (field) => formData[field] !== "" && formData[field] != null,
  );

  const handleUploadClick = () => {
    if (isComplete) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading paper config file:", file.name);
    }
    e.target.value = "";
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all">
      {/* Accordion Header Bar */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer bg-white hover:bg-slate-50 transition border-b border-slate-200/80"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200/80 text-[#0284c7] flex items-center justify-center shrink-0 shadow-xs">
            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Paper Details & Header Config
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-[#0284c7] border border-sky-200/80">
                {formData.departments ? `${formData.departments}` : "General"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formData.testTitle ||
                "Configure test header, duration, & parameters"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
        >
          {collapsed ? (
            <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 20 }} />
          ) : (
            <KeyboardArrowUpOutlinedIcon sx={{ fontSize: 20 }} />
          )}
        </button>
      </div>

      {/* Accordion Body */}
      {!collapsed && (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 bg-white space-y-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className={labelClass}>
                Test Paper Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="testTitle"
                value={formData.testTitle}
                onChange={handleChange}
                placeholder="e.g. CNC MANUAL SAFETY MODULE TEST PAPER"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-1">
              <label className={labelClass}>Paper Sub-Title / Module</label>
              <input
                type="text"
                name="subTitle"
                value={formData.subTitle}
                onChange={handleChange}
                placeholder="e.g. New Manpower Technical Assessment"
                className={inputClass}
              />
              <p className={hintClass}>
                Displayed below main paper title on the printed test sheet.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description / Notes</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter test description or candidate instructions overview..."
                rows={2}
                className={textareaClass}
              />
            </div>

            <div>
              <label className={labelClass}>Paper Printed Header Title</label>
              <input
                type="text"
                name="headerTitle"
                value={formData.headerTitle}
                onChange={handleChange}
                className={inputClass}
              />
              <p className={hintClass}>
                Official organization banner printed at the top center of the
                test sheet.
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="departments"
                  value={formData.departments}
                  onChange={handleChange}
                  disabled={loadingDepts}
                  className={selectClass}
                >
                  <option value="">
                    {loadingDepts ? "Loading departments..." : "Select Department"}
                  </option>
                  {formData.departments &&
                    !departmentsList.some((d) => d.name === formData.departments) && (
                      <option value={formData.departments}>
                        {formData.departments}
                      </option>
                    )}
                  {departmentsList.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  sx={{ fontSize: 18 }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Sub-Department</label>
              <div className="relative">
                <select
                  name="sections"
                  value={formData.sections}
                  onChange={handleChange}
                  disabled={loadingSubDepts}
                  className={selectClass}
                >
                  <option value="">
                    {loadingSubDepts
                      ? "Loading sub-departments..."
                      : "Select Sub-Department"}
                  </option>
                  {formData.sections &&
                    !subDepartmentsList.some((s) => s.name === formData.sections) && (
                      <option value={formData.sections}>
                        {formData.sections}
                      </option>
                    )}
                  {subDepartmentsList.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  sx={{ fontSize: 18 }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Line</label>
              <div className="relative">
                <select
                  name="lines"
                  value={formData.lines}
                  onChange={handleChange}
                  disabled={loadingLines}
                  className={selectClass}
                >
                  <option value="">
                    {loadingLines ? "Loading lines..." : "Select Line"}
                  </option>
                  {formData.lines &&
                    !linesList.some((l) => l.name === formData.lines) && (
                      <option value={formData.lines}>{formData.lines}</option>
                    )}
                  {linesList.map((line) => (
                    <option key={line.id} value={line.name}>
                      {line.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  sx={{ fontSize: 18 }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Machine</label>
              <div className="relative">
                <select
                  name="machines"
                  value={formData.machines}
                  onChange={handleChange}
                  disabled={loadingMachines}
                  className={selectClass}
                >
                  <option value="">
                    {loadingMachines ? "Loading machines..." : "Select Machine"}
                  </option>
                  {formData.machines &&
                    !machinesList.some((m) => m.name === formData.machines) && (
                      <option value={formData.machines}>
                        {formData.machines}
                      </option>
                    )}
                  {machinesList.map((machine) => (
                    <option key={machine.id} value={machine.name}>
                      {machine.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  sx={{ fontSize: 18 }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Levels</label>
              <div className="relative">
                <select
                  name="levels"
                  value={formData.levels}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select Level</option>
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  sx={{ fontSize: 18 }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Allowed Time (Minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="30"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Passing Score (%)</label>
              <input
                type="number"
                name="passPercentage"
                value={formData.passPercentage}
                onChange={handleChange}
                placeholder="80"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={!isComplete}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
              Upload
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default BasicInformation;
