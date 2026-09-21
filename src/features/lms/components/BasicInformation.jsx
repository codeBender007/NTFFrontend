import { useRef, useState } from "react";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const inputClass =
  "w-full h-10 rounded-xl border border-gray-200 px-3.5 text-sm outline-none bg-gray-50/50 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

const selectClass =
  "w-full h-10 appearance-none rounded-xl border border-gray-200 px-3.5 pr-9 text-sm outline-none bg-gray-50/50 text-gray-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none bg-gray-50/50 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

const hintClass = "mt-1 text-[11px] text-gray-400";

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
    sections: initialData.sections || "",
    lines: initialData.lines || "",
    subSections: initialData.subSections || "",
    machines: initialData.machines || "",
    levels: initialData.levels || "",
    duration: initialData.duration || "",
    passPercentage: initialData.passPercentage || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
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
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden transition-all">
      {/* Accordion Header Bar */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer bg-white hover:bg-gray-50/50 transition border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">
                Paper Details & Header Config
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                {formData.departments ? `${formData.departments}` : "General"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {formData.testTitle ||
                "Configure test header, duration, & parameters"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
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
                  className={selectClass}
                >
                  <option value="">Select Department</option>
                  <option value="Production">Production</option>
                  <option value="Quality">Quality</option>
                  <option value="Technical">Technical</option>
                  <option value="Safety">Safety</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className={selectClass}
                >
                  <option value="">Select Section</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className={selectClass}
                >
                  <option value="">Select Line</option>
                  <option value="Line 1">Line 1</option>
                  <option value="Line 2">Line 2</option>
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className={selectClass}
                >
                  <option value="">Select Machine</option>
                  <option value="Machine 1">Machine 1</option>
                  <option value="Machine 2">Machine 2</option>
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                </select>
                <KeyboardArrowDownOutlinedIcon
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6F4AE7] to-[#7A5AF8] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#6F4AE7]/20 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
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
