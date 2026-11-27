import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Send,
  CheckCircle2,
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import UserApi from "@/features/lms/services/UserApi.js";
import { SEED_EMPLOYEES } from "@/features/lms/utils/userSchema.js";
import {
  applyRoleDesignationOverrides,
  applyUserLocalOverrides,
} from "@/features/lms/utils/userUtils.js";
import {
  assignPaperToOperators,
  getAssignedOperatorKeysForPaper,
  getOperatorAssignmentKey,
} from "../utils/supervisorAssignmentStorage.js";

const formatJoiningDate = (dateVal) => {
  if (!dateVal) return "—";
  const str = String(dateVal).trim();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return str;
};

export default function OperatorAssignmentPanel({
  selectedPaper,
  savedPapers = [],
  onSelectPaper,
  supervisorName = "Supervisor",
  onAssignmentComplete,
  onBack,
}) {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [assignedKeys, setAssignedKeys] = useState(() =>
    getAssignedOperatorKeysForPaper(selectedPaper?.id)
  );
  const [lastSentSummary, setLastSentSummary] = useState(null);

  const activePaper = selectedPaper || savedPapers[0] || null;

  useEffect(() => {
    setAssignedKeys(getAssignedOperatorKeysForPaper(activePaper?.id));
    setSelectedKeys(new Set());
    setLastSentSummary(null);
  }, [activePaper?.id]);

  const fetchOperators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let rawList = [];
      try {
        const res = await UserApi.getUsers({ limit: 1000 });
        rawList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
      } catch (apiErr) {
        console.warn("Could not fetch users from UserApi:", apiErr?.message);
        setError(
          "Could not reach LMS Users API; showing available synced operators."
        );
      }

      let normalized = rawList.map((u) => ({
        id: u.id,
        empName: u.empName ?? u.name ?? u.username ?? "",
        payCode: u.payCode ?? u.paycode ?? "",
        department: u.departmentName ?? u.department ?? "",
        subDepartment: u.subDepartmentName ?? u.subDepartment ?? "",
        line: u.lineName ?? u.line ?? "",
        machine: u.machineName ?? u.machine ?? "",
        joiningDate: u.dateOfJoining ?? u.joiningDate ?? "",
        designation: u.designation ?? u.role ?? "",
        email: u.email ?? "",
      }));

      if (normalized.length === 0) {
        normalized = SEED_EMPLOYEES.map((u) => ({
          id: u.id,
          empName: u.empName ?? u.name ?? "",
          payCode: u.payCode ?? u.paycode ?? "",
          department: u.department ?? "",
          subDepartment: u.subDepartment ?? "",
          line: u.line ?? "",
          machine: u.machine ?? "",
          joiningDate: u.joiningDate ?? u.dateOfJoining ?? "",
          designation: u.designation ?? "",
          email: u.email ?? "",
        }));
      }

      // Sync with any LMS Users / Roles designation overrides
      const withLocal = applyUserLocalOverrides(normalized);
      const synced = applyRoleDesignationOverrides(withLocal);

      // Strictly filter for Designation === "Operator" (case-insensitive)
      const onlyOperators = synced.filter((u) => {
        const desig = String(u.designation || "").trim().toLowerCase();
        return desig === "operator";
      });

      setOperators(onlyOperators);
    } catch (err) {
      setError(err?.message || "Failed to load operators list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const filteredOperators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return operators;
    return operators.filter((op) => {
      const name = String(op.empName || "").toLowerCase();
      const payCode = String(op.payCode || "").toLowerCase();
      const dept = String(op.department || "").toLowerCase();
      const line = String(op.line || "").toLowerCase();
      return (
        name.includes(q) ||
        payCode.includes(q) ||
        dept.includes(q) ||
        line.includes(q)
      );
    });
  }, [operators, searchQuery]);

  const allFilteredSelected =
    filteredOperators.length > 0 &&
    filteredOperators.every((op) =>
      selectedKeys.has(getOperatorAssignmentKey(op))
    );

  const toggleSelectOne = (op) => {
    const key = getOperatorAssignmentKey(op);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        filteredOperators.forEach((op) =>
          next.delete(getOperatorAssignmentKey(op))
        );
        return next;
      });
    } else {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        filteredOperators.forEach((op) =>
          next.add(getOperatorAssignmentKey(op))
        );
        return next;
      });
    }
  };

  const executeSend = (targetOperators) => {
    if (!activePaper || targetOperators.length === 0) return;

    const result = assignPaperToOperators(
      activePaper,
      targetOperators,
      supervisorName
    );
    const updatedAssigned = getAssignedOperatorKeysForPaper(activePaper.id);
    setAssignedKeys(updatedAssigned);
    setSelectedKeys(new Set());

    const namesPreview = targetOperators
      .slice(0, 3)
      .map((op) => op.empName || op.payCode || "Operator")
      .join(", ");
    const extraCount =
      targetOperators.length > 3 ? ` +${targetOperators.length - 3} more` : "";

    const summaryText = `Sent "${activePaper.title}" to ${result.assignedCount} operator${
      result.assignedCount === 1 ? "" : "s"
    } (${namesPreview}${extraCount}).`;

    setLastSentSummary(summaryText);
    if (onAssignmentComplete) {
      onAssignmentComplete({
        ...result,
        summaryText,
      });
    }
  };

  const handleSendSelected = () => {
    const chosen = operators.filter((op) =>
      selectedKeys.has(getOperatorAssignmentKey(op))
    );
    executeSend(chosen);
  };

  const handleSendToAll = () => {
    executeSend(operators);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0b295c] text-white rounded-xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Assign Question Paper to Operators
            </h2>
            <p className="text-xs text-sky-100/80">
              Select individual operators or send to all operators from LMS Users
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOperators}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Operators</span>
        </button>
      </div>

      {/* Active Paper Selector Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Selected Test Paper to Send
            </p>
            {activePaper ? (
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {activePaper.title}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {activePaper.marks || `${activePaper.totalMarks ?? 0} Marks`}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {assignedKeys.size} Assigned
                </span>
              </div>
            ) : (
              <p className="text-xs text-rose-600 font-medium mt-0.5">
                No saved test paper selected. Please create and save a test paper first.
              </p>
            )}
          </div>
        </div>

        {savedPapers.length > 1 && onSelectPaper && (
          <div className="w-full md:w-72 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Switch Test Paper
            </label>
            <select
              value={activePaper?.id ?? ""}
              onChange={(e) => {
                const chosen = savedPapers.find(
                  (p) => String(p.id) === String(e.target.value)
                );
                if (chosen) onSelectPaper(chosen);
              }}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0284c7] cursor-pointer"
            >
              {savedPapers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.marks || `${p.totalMarks ?? 0} Marks`})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Confirmation Banner */}
      {lastSentSummary && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{lastSentSummary}</span>
        </div>
      )}

      {/* Warning / Error Banner */}
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchOperators}
            className="px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Operators List & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284c7]" />
              <h3 className="text-sm font-bold text-slate-900">
                Operators List
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200">
                {operators.length} Operators
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, paycode, dept..."
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#0284c7] transition"
              />
            </div>
          </div>

          {/* Send Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={!activePaper || operators.length === 0}
              onClick={handleSendToAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 px-3.5 text-xs font-semibold text-[#0284c7] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Send to All Operators ({operators.length})</span>
            </button>

            <button
              type="button"
              disabled={!activePaper || selectedKeys.size === 0}
              onClick={handleSendSelected}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 text-xs font-semibold text-white shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                Send Question Paper
                {selectedKeys.size > 0 ? ` (${selectedKeys.size})` : ""}
              </span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr className="bg-[#0b295c] text-white">
                <th className="w-12 px-4 py-2.5 text-center border-r border-[#153e7e]">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    disabled={filteredOperators.length === 0}
                    title="Select All Operators"
                    className="h-4 w-4 rounded accent-sky-400 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Employee Name
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Paycode
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Department / Line
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Joining Date
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs font-medium text-slate-500"
                  >
                    <div className="inline-flex items-center gap-2.5">
                      <span className="h-4 w-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                      <span>Loading operators from LMS Users...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredOperators.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs text-slate-400"
                  >
                    No operators found matching your criteria.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredOperators.map((op, idx) => {
                  const key = getOperatorAssignmentKey(op);
                  const isChecked = selectedKeys.has(key);
                  const isAlreadySent = assignedKeys.has(key);
                  const deptLine = [op.department, op.line]
                    .filter(Boolean)
                    .join(" / ");

                  return (
                    <tr
                      key={key}
                      onClick={() => toggleSelectOne(op)}
                      className={`border-b border-slate-100 transition cursor-pointer ${
                        isChecked
                          ? "bg-sky-50/70"
                          : idx % 2 === 1
                            ? "bg-slate-50/40 hover:bg-slate-50"
                            : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <td
                        className="px-4 py-3 text-center border-r border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(op)}
                          className="h-4 w-4 rounded accent-[#0b295c] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3 border-r border-slate-100">
                        <p className="text-xs font-semibold text-slate-800">
                          {op.empName || "—"}
                        </p>
                        {op.email && (
                          <p className="text-[11px] text-slate-400">{op.email}</p>
                        )}
                      </td>

                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          {op.payCode || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">
                        {deptLine || "—"}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">
                        {formatJoiningDate(op.joiningDate)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isAlreadySent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Not Sent
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
