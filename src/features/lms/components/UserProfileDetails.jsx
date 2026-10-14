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
        <div className="rounded-3xl border border-[#e2edf2] bg-white/90 p-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f9f8] text-[#0d9488]">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#0f172a]">User Profile Not Found</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            The user record you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/lms/users")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition hover:from-[#0f766e] hover:to-[#0d9488]"
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
    <div className="mx-auto max-w-[1360px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ===================== TOP NAVIGATION & BREADCRUMB ===================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/lms/users")}
            className="flex h-9 items-center gap-2 rounded-xl border border-[#e2edf2] bg-white px-3.5 text-xs font-semibold text-[#0f172a] shadow-xs transition hover:border-[#0d9488] hover:bg-[#f0f9f8] hover:text-[#0d9488]"
          >
            <ArrowLeft size={15} />
            Back to Users
          </button>
          <div className="hidden items-center gap-2 text-xs text-[#94a3b8] sm:flex">
            <span>LMS</span>
            <span>/</span>
            <button
              onClick={() => navigate("/lms/users")}
              className="text-[#64748b] hover:text-[#0d9488]"
            >
              Users
            </button>
            <span>/</span>
            <span className="font-semibold text-[#0f172a]">{user.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleCopy(`${user.name} - ${user.employeeId} (${user.email || ""})`, "Profile summary")}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 text-xs font-semibold text-[#64748b] shadow-xs transition hover:border-[#0d9488] hover:text-[#0d9488]"
          >
            {copiedKey === "Profile summary" ? <Check size={14} className="text-[#0d9488]" /> : <Copy size={14} />}
            Copy Summary
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 text-xs font-semibold text-[#64748b] shadow-xs transition hover:border-[#0d9488] hover:text-[#0d9488]"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* ===================== HERO PROFILE CARD ===================== */}
      <div className="rounded-2xl border border-[#e2edf2] bg-white p-6 shadow-sm md:rounded-3xl sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar with Status Dot */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-2xl font-bold text-white shadow-md shadow-[#0d9488]/20 sm:h-24 sm:w-24 sm:text-3xl">
                {initials}
              </div>
              <span
                title={isActive ? "Active User" : "Inactive / Left"}
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ${
                  isActive
                    ? "bg-emerald-500 ring-2 ring-emerald-400/40"
                    : "bg-gray-400 ring-2 ring-gray-300"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl md:text-3xl">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  {user.status || (isActive ? "Active" : "Inactive")}
                </span>
                {user.role && (
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                    {user.role}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm font-medium text-[#64748b]">
                {user.designation || "Staff Specialist"}
                {user.department ? ` • ${user.department}` : ""}
                {user.companyName ? ` • ${user.companyName}` : ""}
              </p>

              {/* Meta Identifiers */}
              <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#64748b]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#94a3b8]">Pay Code:</span>
                  <strong className="font-semibold text-[#0f172a]">
                    {user.employeeId || "—"}
                  </strong>
                </span>
                <span className="hidden text-gray-300 sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#94a3b8]">Card No:</span>
                  <strong className="font-semibold text-[#0f172a]">
                    {user.cardNo || "—"}
                  </strong>
                </span>
                {user.plant && (
                  <>
                    <span className="hidden text-gray-300 sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[#94a3b8]">Plant:</span>
                      <strong className="font-semibold text-[#0f172a]">
                        Plant {user.plant}
                      </strong>
                    </span>
                  </>
                )}
                {user.shift && (
                  <>
                    <span className="hidden text-gray-300 sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[#94a3b8]">Shift:</span>
                      <strong className="font-semibold text-[#0f172a]">
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
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#0f172a]">
                <Building2 size={14} className="text-[#0d9488]" />
                {user.department}
              </span>
            )}
            {user.level && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#0f172a]">
                <Award size={14} className="text-[#0d9488]" />
                Level {user.level}
              </span>
            )}
            {isDojo && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-[#e6f7f5] px-3.5 py-2 text-xs font-semibold text-[#0d9488]">
                <ShieldCheck size={14} />
                Dojo Certified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===================== STATS / KPI ROW ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
            <Factory size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Plant & Facility</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {user.plant || "—"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">{user.plantLocation || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
            <Layers size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Department & Sub-Dept</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {user.department || "—"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">{user.subDepartment || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600">
            <Award size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Skill Rating & Grade</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {user.level || "—"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">Grade: {user.grade || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Assigned Shift & Line</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {user.shift ? `${user.shift} Shift` : "—"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">{user.line ? `Line: ${user.line}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* ===================== TAB NAVIGATION ===================== */}
      <div className="flex overflow-x-auto border-b border-[#e2edf2] pb-px">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-xl px-4 py-3 text-xs font-semibold transition ${isCurrent
                  ? "border-b-2 border-[#0d9488] bg-white text-[#0d9488] shadow-2xs"
                  : "text-[#64748b] hover:bg-white/60 hover:text-[#0f172a]"
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== TAB CONTENT PANELS ===================== */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Organization Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
                <Building2 size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Organization & Role</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] px-5 py-2">
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
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600">
                <User size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Personal Information</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] px-5 py-2">
              <ProfileRow label="Full Name" value={user.name} />
              <ProfileRow label="Father / Husband" value={user.fatherHusband} />
              <ProfileRow label="Gender" value={user.gender} />
              <ProfileRow label="Date of Birth" value={user.dob} />
              <ProfileRow label="Blood Group" value={user.bloodGroup} />
              <ProfileRow label="Marital Status" value={user.maritalState} />
            </div>
          </div>

          {/* Contact & Identifiers */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
                <Phone size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Contact & Identifiers</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] px-5 py-2">
              <ProfileRow
                label="Email"
                value={user.email}
                action={
                  user.email ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(user.email, "Email")}
                      className="text-[#0d9488] hover:text-[#0f766e]"
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
                      className="text-[#0d9488] hover:text-[#0f766e]"
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
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">Organizational Hierarchy Placement</h3>
                <p className="text-xs text-[#64748b]">
                  Complete organizational chain mapping for {user.name}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d9488]/20 bg-[#e6f7f5] px-3 py-1 text-xs font-semibold text-[#0d9488]">
                <Factory size={13} />
                {user.plant ? `${user.plant} Facility` : "—"}
              </span>
            </div>

            {/* Stepper / Roadmap */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {hierarchyLevels.map((lvl, index) => {
                const Icon = lvl.icon;
                return (
                  <div
                    key={lvl.label}
                    className="relative flex flex-col justify-between rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-4 transition hover:border-[#0d9488] hover:bg-white hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                          Level 0{index + 1}
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
                          <Icon size={14} />
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] font-medium text-[#64748b]">{lvl.label}</p>
                      <h4 className="mt-0.5 text-sm font-bold text-[#0f172a]">{lvl.value}</h4>
                    </div>
                    <div className="mt-3 border-t border-[#edf2f6] pt-2 text-[10px] text-[#94a3b8]">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Skill Matrix Status */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Skill Matrix & Competency</h3>
                <p className="text-[11px] text-[#64748b]">Current verified skill rating</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e2edf2] bg-[#f8fafc] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Skill Level</p>
                  <h4 className="mt-1 text-2xl font-bold text-[#0f172a]">{user.level || "—"}</h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#14b8a6] text-xl font-bold text-white shadow-md shadow-[#0d9488]/20">
                  {user.level ? String(user.level).charAt(0) : "—"}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748b]">Proficiency Scale</span>
                  <span className="font-semibold text-[#0d9488]">{user.level || "—"}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2edf2]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6]" style={{ width: "75%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3.5">
                <p className="text-[11px] text-[#64748b]">Employee Grade</p>
                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{user.grade || "—"}</p>
              </div>
              <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3.5">
                <p className="text-[11px] text-[#64748b]">Role Category</p>
                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{user.category || "—"}</p>
              </div>
            </div>
          </div>

          {/* Dojo Certification */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-200 bg-[#e6f7f5] text-[#0d9488]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Dojo Training Center Status</h3>
                <p className="text-[11px] text-[#64748b]">Technical & Dojo qualification</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e2edf2] bg-[#f8fafc] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Certification Status</p>
                  <h4 className="mt-1 text-lg font-bold text-[#0f172a]">
                    {isDojo ? "Dojo Certified Operator" : "Standard Training Track"}
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isDojo
                    ? "border border-teal-200 bg-[#e6f7f5] text-[#0d9488]"
                    : "border border-gray-200 bg-gray-100 text-gray-600"
                    }`}
                >
                  <CheckCircle2 size={13} />
                  {isDojo ? "Active" : "Standard"}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748b]">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Timeline Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
                <Calendar size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Employment Timeline</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] py-2">
              <ProfileRow label="Date of Joining" value={user.joiningDate} />
              <ProfileRow label="First Of Date" value={user.firstOfDate} />
              <ProfileRow label="Leaving Date" value={user.leavingDate || "Currently Employed"} />
              <ProfileRow label="Account Status" value={user.status} />
            </div>
          </div>

          {/* Payroll Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
                <Wallet size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Compensation & Codes</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] py-2">
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#0d9488] bg-[#0f172a] px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          <Check size={14} className="text-[#0d9488]" />
          {toast}
        </div>
      )}
    </div>
  );
};

const ProfileRow = ({ label, value, action }) => (
  <div className="flex items-center justify-between py-2.5 text-xs">
    <span className="font-medium text-[#64748b]">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-semibold text-[#0f172a]">{value || "—"}</span>
      {action}
    </div>
  </div>
);

export default UserProfileDetails;
