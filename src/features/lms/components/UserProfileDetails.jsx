import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Factory,
  Hash,
  Layers,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return initials || "U";
};

const UserProfileDetails = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedKey, setCopiedKey] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const handleCopy = (text, key) => {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-10">
        <div className="rounded-xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-50 border border-sky-200/80 text-[#0284c7]">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">User Profile Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            The user record you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/lms/users")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Users List
          </button>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name);
  const isActive = String(user.status || "").toLowerCase() === "active";
  const isDojo = String(user.isDojo || "").toLowerCase() === "yes";

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "hierarchy", label: "Hierarchy Roadmap", icon: Factory },
    { id: "skills", label: "Skills & Qualifications", icon: Award },
    { id: "payroll", label: "Employment & Payroll", icon: Wallet },
  ];

  const hierarchyLevels = [
    { label: "Plant", value: user.plant || "—", icon: Factory, note: user.plantLocation || "—" },
    { label: "Department", value: user.department || "—", icon: Building2, note: "Core Department" },
    { label: "Sub-Department", value: user.subDepartment || "—", icon: Layers, note: "Operational Unit" },
    { label: "Line", value: user.line || "—", icon: Hash, note: "Assembly Line" },
    { label: "Machine", value: user.machine || "—", icon: MapPin, note: user.shift ? `Shift: ${user.shift}` : "—" },
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            User Profile — {user.name}
          </h2>
        </div>
      </div>

      {/* ===================== TOP NAVIGATION & BREADCRUMB ===================== */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white px-4 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/lms/users")}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#0284c7] hover:bg-slate-50 hover:text-[#0284c7]"
          >
            <ArrowLeft size={14} />
            Back to Users
          </button>
          <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <span>LMS</span>
            <span>/</span>
            <button
              onClick={() => navigate("/lms/users")}
              className="text-[#0284c7] font-semibold hover:underline"
            >
              Users
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900">{user.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleCopy(`${user.name} - ${user.employeeId} (${user.email || ""})`, "Profile summary")}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#0284c7] hover:bg-slate-50 hover:text-[#0284c7]"
          >
            {copiedKey === "Profile summary" ? <Check size={14} className="text-[#0284c7]" /> : <Copy size={14} />}
            Copy Summary
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#0284c7] hover:bg-slate-50 hover:text-[#0284c7]"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* ===================== HERO PROFILE CARD ===================== */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar with Status Dot */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#0b295c] text-2xl font-bold text-white shadow-xs sm:h-22 sm:w-22 sm:text-3xl">
                {initials}
              </div>
              <span
                title={isActive ? "Active User" : "Inactive / Left"}
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ${isActive
                    ? "bg-emerald-500 ring-2 ring-emerald-400/40"
                    : "bg-slate-400 ring-2 ring-slate-300"
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold ${isActive
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                  />
                  {user.status || (isActive ? "Active" : "Inactive")}
                </span>
                {user.role && (
                  <span className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                    {user.role}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                {user.designation || "Staff Specialist"}
                {user.department ? ` • ${user.department}` : ""}
                {user.companyName ? ` • ${user.companyName}` : ""}
              </p>

              {/* Meta Identifiers */}
              <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400">Pay Code:</span>
                  <strong className="font-semibold text-slate-900">
                    {user.employeeId || "—"}
                  </strong>
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400">Card No:</span>
                  <strong className="font-semibold text-slate-900">
                    {user.cardNo || "—"}
                  </strong>
                </span>
                {user.plant && (
                  <>
                    <span className="hidden text-slate-300 sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-400">Plant:</span>
                      <strong className="font-semibold text-slate-900">
                        Plant {user.plant}
                      </strong>
                    </span>
                  </>
                )}
                {user.shift && (
                  <>
                    <span className="hidden text-slate-300 sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-400">Shift:</span>
                      <strong className="font-semibold text-slate-900">
                        Shift {user.shift}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badges / Chips */}
          <div className="flex flex-wrap items-center gap-2 lg:self-center">
            {user.department && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Building2 size={14} className="text-[#0284c7]" />
                {user.department}
              </span>
            )}
            {user.level && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Award size={14} className="text-[#0284c7]" />
                Level {user.level}
              </span>
            )}
            {isDojo && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200/80 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-[#0284c7]">
                <ShieldCheck size={14} />
                Dojo Certified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===================== STATS / KPI ROW ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7] shadow-xs">
            <Factory size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plant & Facility</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              {user.plant ? `Plant ${user.plant}` : "—"}
            </p>
            <p className="truncate text-xs text-slate-500">{user.plantLocation || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7] shadow-xs">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Department & Sub-Dept</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              {user.department || "—"}
            </p>
            <p className="truncate text-xs text-slate-500">{user.subDepartment || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7] shadow-xs">
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Skill Rating & Grade</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              {user.level || "—"}
            </p>
            <p className="truncate text-xs text-slate-500">Grade: {user.grade || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7] shadow-xs">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Shift & Line</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              {user.shift ? `${user.shift} Shift` : "—"}
            </p>
            <p className="truncate text-xs text-slate-500">{user.line ? `Line: ${user.line}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* ===================== TAB NAVIGATION ===================== */}
      <div className="flex overflow-x-auto border-b border-slate-200 pb-px">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition ${isCurrent
                    ? "border-b-2 border-[#0b295c] bg-white text-[#0b295c] shadow-xs"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== TAB CONTENT PANELS ===================== */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Organization Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <Building2 size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Organization & Role</h3>
            </div>
            <div className="divide-y divide-slate-100 px-5 py-2">
              <ProfileRow label="Company" value={user.companyName} />
              <ProfileRow label="Department" value={user.department} />
              <ProfileRow label="Sub-Department" value={user.subDepartment} />
              <ProfileRow label="Designation" value={user.designation} />
              <ProfileRow label="Category" value={user.category} />
              <ProfileRow label="Grade" value={user.grade} />
              <ProfileRow label="Shift" value={user.shift} />
            </div>
          </div>

          {/* Personal Information */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <User size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
            </div>
            <div className="divide-y divide-slate-100 px-5 py-2">
              <ProfileRow label="Full Name" value={user.name} />
              <ProfileRow label="Father / Husband" value={user.fatherHusband} />
              <ProfileRow label="Gender" value={user.gender} />
              <ProfileRow label="Date of Birth" value={user.dob} />
              <ProfileRow label="Blood Group" value={user.bloodGroup} />
              <ProfileRow label="Marital Status" value={user.maritalState} />
            </div>
          </div>

          {/* Contact & Identifiers */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <Phone size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Contact & Identifiers</h3>
            </div>
            <div className="divide-y divide-slate-100 px-5 py-2">
              <ProfileRow
                label="Email"
                value={user.email}
                action={
                  user.email ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(user.email, "Email")}
                      className="text-[#0284c7] hover:text-[#0b295c]"
                      title="Copy email"
                    >
                      {copiedKey === "Email" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  ) : null
                }
              />
              <ProfileRow
                label="Phone Number"
                value={user.phone}
                action={
                  user.phone ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(user.phone, "Phone")}
                      className="text-[#0284c7] hover:text-[#0b295c]"
                      title="Copy phone"
                    >
                      {copiedKey === "Phone" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  ) : null
                }
              />
              <ProfileRow label="Pay Code" value={user.employeeId} />
              <ProfileRow label="Card Number" value={user.cardNo} />
              <ProfileRow label="Dojo Qualified" value={user.isDojo} />
              <ProfileRow label="Joining Date" value={user.joiningDate} />
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: HIERARCHY ROADMAP ===================== */}
      {activeTab === "hierarchy" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Organizational Hierarchy Placement</h3>
                <p className="text-xs text-slate-500">
                  Complete organizational chain mapping for {user.name}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0284c7]">
                <Factory size={13} />
                {user.plant ? `Plant ${user.plant} Facility` : "—"}
              </span>
            </div>

            {/* Stepper / Roadmap */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {hierarchyLevels.map((lvl, index) => {
                const Icon = lvl.icon;
                return (
                  <div
                    key={lvl.label}
                    className="relative flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:border-[#0284c7] hover:bg-white hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Level 0{index + 1}
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                          <Icon size={14} />
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{lvl.label}</p>
                      <h4 className="mt-0.5 text-sm font-bold text-slate-900">{lvl.value}</h4>
                    </div>
                    <div className="mt-3 border-t border-slate-200/80 pt-2 text-[10px] text-slate-500">
                      {lvl.note}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: SKILLS & QUALIFICATIONS ===================== */}
      {activeTab === "skills" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Skill Matrix Status */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Skill Matrix & Competency</h3>
                <p className="text-xs text-slate-500">Current verified skill rating</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Level</p>
                  <h4 className="mt-1 text-2xl font-bold text-slate-900">{user.level || "—"}</h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0b295c] text-xl font-bold text-white shadow-xs">
                  {user.level ? String(user.level).charAt(0) : "—"}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Proficiency Scale</span>
                  <span className="font-semibold text-[#0284c7]">{user.level || "—"}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[#0b295c]" style={{ width: "75%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Employee Grade</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{user.grade || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role Category</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{user.category || "—"}</p>
              </div>
            </div>
          </div>

          {/* Dojo Certification */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dojo Training Center Status</h3>
                <p className="text-xs text-slate-500">Technical & Dojo qualification</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certification Status</p>
                  <h4 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
                    {isDojo ? "Dojo Certified Operator" : "Standard Training Track"}
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${isDojo
                      ? "border border-sky-200/80 bg-sky-50 text-[#0284c7]"
                      : "border border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                >
                  <CheckCircle2 size={13} />
                  {isDojo ? "Active" : "Standard"}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {isDojo
                  ? "User has successfully completed all baseline Dojo center safety, ergonomics, and station qualification standards."
                  : "User is currently enrolled in general operational workflow. Dojo certification can be assigned upon station assessment."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: EMPLOYMENT & PAYROLL ===================== */}
      {activeTab === "payroll" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Timeline Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 -mx-5 -mt-5 px-5 py-3.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <Calendar size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Employment Timeline</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <ProfileRow label="Date of Joining" value={user.joiningDate} />
              <ProfileRow label="First Of Date" value={user.firstOfDate} />
              <ProfileRow label="Leaving Date" value={user.leavingDate || "Currently Employed"} />
              <ProfileRow label="Account Status" value={user.status} />
            </div>
          </div>

          {/* Payroll Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 -mx-5 -mt-5 px-5 py-3.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7]">
                <Wallet size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Compensation & Codes</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <ProfileRow label="Salary / Scale" value={user.salary ? `₹ ${user.salary}` : "—"} />
              <ProfileRow label="Pay Code" value={user.employeeId} />
              <ProfileRow label="Card Number" value={user.cardNo} />
              <ProfileRow label="Category" value={user.category} />
            </div>
          </div>
        </div>
      )}

      {/* ===================== TOAST ===================== */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900/95 text-white px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6">
          {toast}
        </div>
      )}
    </div>
  );
};

const ProfileRow = ({ label, value, action }) => (
  <div className="flex items-center justify-between py-2.5 text-xs">
    <span className="font-medium text-slate-500">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-semibold text-slate-900">{value || "—"}</span>
      {action}
    </div>
  </div>
);

export default UserProfileDetails;
