import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Cpu,
  Droplets,
  ExternalLink,
  Factory,
  FileCheck2,
  FileText,
  Hash,
  HeartPulse,
  Layers,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import profileBg from "../../../assets/images/profile-bg.png";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return initials || "OP";
};

const getSkillLevelNumber = (level = "") => {
  const str = String(level).toLowerCase();
  if (str.includes("4") || str.includes("expert") || str.includes("master")) return 4;
  if (str.includes("3") || str.includes("skilled") || str.includes("senior")) return 3;
  if (str.includes("2") || str.includes("semi")) return 2;
  if (str.includes("1") || str.includes("trainee") || str.includes("beginner")) return 1;
  return 2;
};

const OperatorProfileDetails = ({ operator }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("station");
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

  if (!operator) {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-10">
        <div className="rounded-3xl border border-[#e2edf2] bg-white/90 p-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f9f8] text-[#0d9488]">
            <Wrench size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#0f172a]">Operator Record Not Found</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            The operator profile you are searching for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/lms/operators")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition hover:from-[#0f766e] hover:to-[#0d9488]"
          >
            <ArrowLeft size={16} />
            Back to Operators List
          </button>
        </div>
      </div>
    );
  }

  const initials = getInitials(operator.name);
  const isActive = String(operator.status || "").toLowerCase() === "active";
  const isDojo = String(operator.isDojo || "").toLowerCase() === "yes";
  const skillNum = getSkillLevelNumber(operator.level);

  const tabs = [
    { id: "station", label: "Workstation & Hierarchy", icon: Factory },
    { id: "skills", label: "Skill Matrix & Dojo", icon: Award },
    { id: "personal", label: "Personal Information", icon: User },
    { id: "employment", label: "Employment & Contact", icon: Wallet },
  ];

  const hierarchyLevels = [
    { label: "Plant", value: operator.plant || "Plant 1", icon: Factory, note: operator.plantLocation || "Manufacturing Plant" },
    { label: "Department", value: operator.department || "Production", icon: Building2, note: "Shop Floor Department" },
    { label: "Sub-Department", value: operator.subDepartment || "General", icon: Layers, note: "Operational Division" },
    { label: "Line", value: operator.line || "Line 1", icon: Hash, note: "Production Line" },
    { label: "Machine Station", value: operator.machine || "Machine 01", icon: Cpu, note: `Shift: ${operator.shift || "Morning"}` },
  ];

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ===================== TOP NAVIGATION & BREADCRUMB ===================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/lms/operators")}
            className="flex h-9 items-center gap-2 rounded-xl border border-[#e2edf2] bg-white px-3.5 text-xs font-semibold text-[#0f172a] shadow-xs transition hover:border-[#0d9488] hover:bg-[#f0f9f8] hover:text-[#0d9488]"
          >
            <ArrowLeft size={15} />
            Back to Operators
          </button>
          <div className="hidden items-center gap-2 text-xs text-[#94a3b8] sm:flex">
            <span>LMS</span>
            <span>/</span>
            <button
              onClick={() => navigate("/lms/operators")}
              className="text-[#64748b] hover:text-[#0d9488]"
            >
              Operators
            </button>
            <span>/</span>
            <span className="font-semibold text-[#0f172a]">{operator.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => navigate("/lms/operator-observance")}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#0d9488]/30 bg-[#e6f7f5] px-3.5 text-xs font-semibold text-[#0d9488] shadow-xs transition hover:bg-[#d0f0ec]"
          >
            <FileText size={14} />
            Observance Sheet
          </button>
          <button
            type="button"
            onClick={() => handleCopy(`${operator.name} | PayCode: ${operator.employeeId} | Line: ${operator.line} | Machine: ${operator.machine}`, "Operator details")}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 text-xs font-semibold text-[#64748b] shadow-xs transition hover:border-[#0d9488] hover:text-[#0d9488]"
          >
            {copiedKey === "Operator details" ? <Check size={14} className="text-[#0d9488]" /> : <Copy size={14} />}
            Copy Info
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

      {/* ===================== HERO OPERATOR CARD ===================== */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e2edf2] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)] md:rounded-3xl">
        {/* Ambient Cover Banner */}
        <div
          className="relative h-36 w-full bg-cover bg-center sm:h-44"
          style={{ backgroundImage: `url(${profileBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-[#0d9488]/45 to-transparent backdrop-blur-[1px]" />
          <div className="absolute right-4 top-4 hidden items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md sm:flex">
            <Cpu size={13} className="text-[#5eead4]" />
            Shop Floor LMS Operator
          </div>
        </div>

        {/* Operator Info Header */}
        <div className="relative -mt-14 px-5 pb-6 sm:-mt-16 sm:px-8 sm:pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar with Status Glow */}
              <div className="relative h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-gradient-to-br from-[#0d9488] to-[#14b8a6] p-1 shadow-lg shadow-[#0d9488]/20 sm:h-28 sm:w-28 md:rounded-3xl">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-2xl font-bold text-white sm:text-3xl">
                  {initials}
                </div>
                <span
                  title={isActive ? "Active on Shift" : "Off Duty / Left"}
                  className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ${isActive ? "bg-emerald-500 ring-2 ring-emerald-400/40" : "bg-rose-500 ring-2 ring-rose-400/40"
                    }`}
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </div>

              {/* Title & Identifiers */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl md:text-3xl">
                    {operator.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isActive
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    {operator.status || (isActive ? "Active" : "Inactive")}
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <span className="text-[#94a3b8]">Pay Code:</span>
                    <strong className="font-semibold text-[#0f172a]">{operator.employeeId || "—"}</strong>
                  </span>
                  <span className="hidden text-gray-300 sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#94a3b8]">Card No:</span>
                    <strong className="font-semibold text-[#0f172a]">{operator.cardNo || "—"}</strong>
                  </span>
                  <span className="hidden text-gray-300 sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#94a3b8]">Station:</span>
                    <strong className="font-semibold text-[#0d9488]">{operator.machine || "General Station"}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Badges / Chips */}
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              {operator.shift && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-2xs">
                  <Clock size={13} />
                  {operator.shift} Shift
                </span>
              )}
              {operator.line && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#0f172a] shadow-2xs">
                  <Hash size={13} className="text-[#0d9488]" />
                  {operator.line}
                </span>
              )}
              {isDojo && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-[#e6f7f5] px-3 py-1.5 text-xs font-semibold text-[#0d9488] shadow-2xs">
                  <ShieldCheck size={13} />
                  Dojo Certified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KPI STATS ROW ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Machine & Line */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
            <Cpu size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Assigned Machine</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {operator.machine || "Station 01"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">Line: {operator.line || "Line 1"}</p>
          </div>
        </div>

        {/* Shift & Dept */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Operating Shift</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {operator.shift ? `${operator.shift} Shift` : "Regular Shift"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">{operator.department || "Production"}</p>
          </div>
        </div>

        {/* Skill Rating */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600">
            <Award size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Skill Matrix Rating</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {operator.level || `Level ${skillNum}`}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">Grade: {operator.grade || "Standard"}</p>
          </div>
        </div>

        {/* Dojo Qualification */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e2edf2] bg-white/85 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-[#e6f7f5] text-[#0d9488]">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#64748b]">Dojo Qualification</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0f172a]">
              {isDojo ? "Dojo Qualified" : "Standard Operator"}
            </p>
            <p className="truncate text-[11px] text-[#94a3b8]">{isDojo ? "Station Verified" : "Assessment Pending"}</p>
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
      {/* 1. WORKSTATION & HIERARCHY */}
      {activeTab === "station" && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">Shop Floor Station Hierarchy</h3>
                <p className="text-xs text-[#64748b]">
                  Full production mapping: Plant → Department → Sub-Department → Line → Machine
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d9488]/20 bg-[#e6f7f5] px-3 py-1 text-xs font-semibold text-[#0d9488]">
                <Cpu size={13} />
                Active Station: {operator.machine || "Machine 01"}
              </span>
            </div>

            {/* Stepper / Hierarchy Chain */}
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

          {/* Station Work Details Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
              <h4 className="border-b border-[#f0f4f7] pb-3 text-sm font-bold text-[#0f172a]">
                Workstation Parameters
              </h4>
              <div className="divide-y divide-[#f1f5f8] py-1">
                <OperatorRow label="Company" value={operator.companyName} />
                <OperatorRow label="Plant Location" value={operator.plantLocation} />
                <OperatorRow label="Line Assignment" value={operator.line} />
                <OperatorRow label="Machine Station" value={operator.machine} />
                <OperatorRow label="Operating Shift" value={operator.shift} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
              <h4 className="border-b border-[#f0f4f7] pb-3 text-sm font-bold text-[#0f172a]">
                Observance & Quality Monitoring
              </h4>
              <p className="mt-3 text-xs leading-relaxed text-[#64748b]">
                Operators are routinely evaluated for standard work adherence, safety compliance, and defect prevention.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/lms/operator-observance")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition hover:from-[#0f766e] hover:to-[#0d9488]"
                >
                  <FileCheck2 size={16} />
                  Open Observance Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SKILL MATRIX & DOJO */}
      {activeTab === "skills" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Skill Matrix Breakdown */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Operator Skill Matrix</h3>
                <p className="text-[11px] text-[#64748b]">Skill level classification</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e2edf2] bg-[#f8fafc] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Assigned Skill Rating</p>
                  <h4 className="mt-1 text-2xl font-bold text-[#0f172a]">{operator.level || `Level ${skillNum}`}</h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#14b8a6] text-xl font-bold text-white shadow-md shadow-[#0d9488]/20">
                  {`L${skillNum}`}
                </div>
              </div>

              {/* Visual 4-Level Gauge */}
              <div className="mt-5 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((step) => {
                    const isPassed = step <= skillNum;
                    return (
                      <div
                        key={step}
                        className={`h-2 rounded-full transition-all ${isPassed ? "bg-[#0d9488]" : "bg-[#e2edf2]"
                          }`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-[#64748b]">
                  <span>L1 (Trainee)</span>
                  <span>L2 (Semi-Skilled)</span>
                  <span>L3 (Skilled)</span>
                  <span>L4 (Expert)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3.5">
                <p className="text-[11px] text-[#64748b]">Operator Grade</p>
                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{operator.grade || "Standard"}</p>
              </div>
              <div className="rounded-xl border border-[#e2edf2] bg-[#f8fafc] p-3.5">
                <p className="text-[11px] text-[#64748b]">Designation</p>
                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{operator.designation || "Operator"}</p>
              </div>
            </div>
          </div>

          {/* Dojo Center Training Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-200 bg-[#e6f7f5] text-[#0d9488]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Dojo Training Center Qualification</h3>
                <p className="text-[11px] text-[#64748b]">Shop-floor training standards</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e2edf2] bg-[#f8fafc] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Status</p>
                  <h4 className="mt-1 text-lg font-bold text-[#0f172a]">
                    {isDojo ? "Dojo Certified Technician" : "General Shop-floor Operator"}
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isDojo
                      ? "border border-teal-200 bg-[#e6f7f5] text-[#0d9488]"
                      : "border border-gray-200 bg-gray-100 text-gray-600"
                    }`}
                >
                  <CheckCircle2 size={13} />
                  {isDojo ? "Certified" : "Not Certified"}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748b]">
                {isDojo
                  ? "Operator has passed practical assessments in the Dojo training center, including standard cycle times, machine safety protocols, and 5S principles."
                  : "Operator is undergoing standard factory onboarding. Dojo center verification pending."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PERSONAL INFORMATION */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600">
                <User size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Personal Details</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] py-2">
              <OperatorRow label="Full Name" value={operator.name} />
              <OperatorRow label="Father / Husband Name" value={operator.fatherHusband} />
              <OperatorRow label="Gender" value={operator.gender} />
              <OperatorRow label="Date of Birth" value={operator.dob} />
              <OperatorRow label="Blood Group" value={operator.bloodGroup} />
              <OperatorRow label="Marital Status" value={operator.maritalState} />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
                <Phone size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Communication & Identifiers</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] py-2">
              <OperatorRow
                label="Contact Number"
                value={operator.phone}
                action={
                  operator.phone ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(operator.phone, "Phone")}
                      className="text-[#0d9488] hover:text-[#0f766e]"
                      title="Copy phone"
                    >
                      {copiedKey === "Phone" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  ) : null
                }
              />
              <OperatorRow
                label="Email Address"
                value={operator.email}
                action={
                  operator.email ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(operator.email, "Email")}
                      className="text-[#0d9488] hover:text-[#0f766e]"
                      title="Copy email"
                    >
                      {copiedKey === "Email" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  ) : null
                }
              />
              <OperatorRow label="Pay Code" value={operator.employeeId} />
              <OperatorRow label="Card Number" value={operator.cardNo} />
            </div>
          </div>
        </div>
      )}

      {/* 4. EMPLOYMENT & TIMELINE */}
      {activeTab === "employment" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488]">
                <Calendar size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Tenure & Service Record</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] py-2">
              <OperatorRow label="Joining Date" value={operator.joiningDate} />
              <OperatorRow label="First Of Date" value={operator.firstOfDate} />
              <OperatorRow label="Leaving Date" value={operator.leavingDate || "Currently Active"} />
              <OperatorRow label="Service Status" value={operator.status} />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e2edf2] bg-white/90 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-[#f0f4f7] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
                <Wallet size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">Compensation & Category</h3>
            </div>
            <div className="divide-y divide-[#f1f5f8] py-2">
              <OperatorRow label="Salary / Scale" value={operator.salary ? `₹ ${operator.salary}` : "—"} />
              <OperatorRow label="Pay Code" value={operator.employeeId} />
              <OperatorRow label="Card Number" value={operator.cardNo} />
              <OperatorRow label="Worker Category" value={operator.category} />
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

const OperatorRow = ({ label, value, action }) => (
  <div className="flex items-center justify-between py-2.5 text-xs">
    <span className="font-medium text-[#64748b]">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-semibold text-[#0f172a]">{value || "—"}</span>
      {action}
    </div>
  </div>
);

export default OperatorProfileDetails;
