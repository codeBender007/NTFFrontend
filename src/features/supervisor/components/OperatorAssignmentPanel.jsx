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
  Trash2,
} from "lucide-react";
import UserApi from "@/features/lms/services/UserApi.js";
import QuestionPaperApi, {
  getApiErrorMessage,
} from "@/features/lms/services/QuestionPaperApi.js";
import { getUser } from "@/features/auth/utils/authStorage.js";

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
  const currentUser = getUser();
  const activePaper = selectedPaper || savedPapers[0] || null;

  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [unassigningId, setUnassigningId] = useState(null);

  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // Map of operator_id (string) -> assignment object from GET /api/v1/lms/question-papers/assignments
  const [assignmentsByOperatorId, setAssignmentsByOperatorId] = useState({});
  const [lastSentSummary, setLastSentSummary] = useState(null);

  // 1. Fetch live Operators from LMS Users API (designation === "Operator")
  const fetchOperators = useCallback(async () => {
    setLoadingOperators(true);
    setError(null);
    try {
      const allUsers = await UserApi.getAllUsers();
      const onlyOperators = allUsers
        .filter((u) => {
          const desig = String(u?.designation || "").trim().toLowerCase();
          return desig === "operator";
        })
        .map((u) => ({
          id: u.id,
          empName: u.empName ?? u.name ?? u.username ?? "",
          payCode: u.payCode ?? u.paycode ?? "",
          department: u.departmentName ?? u.department ?? "",
          subDepartment: u.subDepartmentName ?? u.subDepartment ?? "",
          line: u.lineName ?? u.line ?? "",
          machine: u.machineName ?? u.machine ?? "",
          joiningDate: u.dateOfJoining ?? u.joiningDate ?? "",
          designation: u.designation ?? "Operator",
          email: u.email ?? "",
        }));

      setOperators(onlyOperators);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load operators list from LMS Users API.")
      );
    } finally {
      setLoadingOperators(false);
    }
  }, []);

  // 2. Fetch active assignments for the selected paper from GET /api/v1/lms/question-papers/assignments
  const fetchAssignments = useCallback(async (paperId) => {
    if (paperId == null) {
      setAssignmentsByOperatorId({});
      return;
    }
    setLoadingAssignments(true);
    try {
      const res = await QuestionPaperApi.getAssignments({
        question_paper_id: Number(paperId),
        is_active: true,
        limit: 1000,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      const map = {};
      list.forEach((a) => {
        if (a?.operator_id != null && a?.is_active !== false) {
          map[String(a.operator_id)] = a;
        }
      });
      setAssignmentsByOperatorId(map);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load existing paper assignments.")
      );
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  useEffect(() => {
    setSelectedIds(new Set());
    setLastSentSummary(null);
    fetchAssignments(activePaper?.id);
  }, [activePaper?.id, fetchAssignments]);

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
    filteredOperators.every((op) => selectedIds.has(String(op.id)));

  const toggleSelectOne = (op) => {
    const idKey = String(op.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idKey)) {
        next.delete(idKey);
      } else {
        next.add(idKey);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredOperators.forEach((op) => next.delete(String(op.id)));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredOperators.forEach((op) => next.add(String(op.id)));
        return next;
      });
    }
  };

  // POST /api/v1/lms/question-papers/assignments
  const executeAssign = async (targetOperators) => {
    if (!activePaper?.id || targetOperators.length === 0 || assigning) return;

    const operatorIds = targetOperators
      .map((op) => Number(op.id))
      .filter((id) => !Number.isNaN(id));

    if (operatorIds.length === 0) {
      setError("Selected operators do not have valid numeric user IDs.");
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      const supervisorId =
        currentUser?.id != null && !Number.isNaN(Number(currentUser.id))
          ? Number(currentUser.id)
          : null;

      await QuestionPaperApi.assignQuestionPapers({
        question_paper_id: Number(activePaper.id),
        operator_ids: operatorIds,
        assigned_by: supervisorId,
        assigned_by_name: supervisorName,
      });

      await fetchAssignments(activePaper.id);
      setSelectedIds(new Set());

      const namesPreview = targetOperators
        .slice(0, 3)
        .map((op) => op.empName || op.payCode || "Operator")
        .join(", ");
      const extraCount =
        targetOperators.length > 3 ? ` +${targetOperators.length - 3} more` : "";

      const summaryText = `Assigned "${activePaper.title}" to ${operatorIds.length} operator${
        operatorIds.length === 1 ? "" : "s"
      } (${namesPreview}${extraCount}).`;

      setLastSentSummary(summaryText);
      if (onAssignmentComplete) {
        onAssignmentComplete({
          assignedCount: operatorIds.length,
          assignedOperators: targetOperators,
          paper: activePaper,
          summaryText,
        });
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to assign question paper to operators.")
      );
    } finally {
      setAssigning(false);
    }
  };

  // DELETE /api/v1/lms/question-papers/assignments/{assignment_id}
  const handleUnassign = async (e, op, assignment) => {
    e.stopPropagation();
    if (!assignment?.id || unassigningId != null) return;

    const confirmed = window.confirm(
      `Unassign "${activePaper?.title || "this paper"}" from ${op.empName || op.payCode}?`
    );
    if (!confirmed) return;

    setUnassigningId(assignment.id);
    setError(null);
    try {
      await QuestionPaperApi.unassignQuestionPaper(assignment.id);
      setAssignmentsByOperatorId((prev) => {
        const next = { ...prev };
        delete next[String(op.id)];
        return next;
      });
      const msg = `Unassigned "${activePaper?.title}" from ${op.empName || op.payCode}.`;
      setLastSentSummary(msg);
      if (onAssignmentComplete) {
        onAssignmentComplete({ summaryText: msg });
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to unassign question paper.")
      );
    } finally {
      setUnassigningId(null);
    }
  };

  const handleSendSelected = () => {
    const chosen = operators.filter((op) => selectedIds.has(String(op.id)));
    executeAssign(chosen);
  };

  const handleSendToAll = () => {
    executeAssign(operators);
  };

  const assignedCount = Object.keys(assignmentsByOperatorId).length;
  const isLoading = loadingOperators || loadingAssignments;

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
              Assign or unassign test papers for live Operators via backend API
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchOperators();
            fetchAssignments(activePaper?.id);
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
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
              Selected Test Paper to Assign
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
                  {assignedCount} Assigned
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

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchOperators();
              fetchAssignments(activePaper?.id);
            }}
            className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-[11px] font-semibold cursor-pointer"
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
              disabled={!activePaper?.id || operators.length === 0 || assigning}
              onClick={handleSendToAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 px-3.5 text-xs font-semibold text-[#0284c7] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Send to All Operators ({operators.length})</span>
            </button>

            <button
              type="button"
              disabled={!activePaper?.id || selectedIds.size === 0 || assigning}
              onClick={handleSendSelected}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 text-xs font-semibold text-white shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {assigning ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    Send Question Paper
                    {selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
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
                  Assignment
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingOperators && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs font-medium text-slate-500"
                  >
                    <div className="inline-flex items-center gap-2.5">
                      <span className="h-4 w-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                      <span>Loading operators from LMS Users API...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loadingOperators && filteredOperators.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs text-slate-400"
                  >
                    No operators found matching your criteria.
                  </td>
                </tr>
              )}

              {!loadingOperators &&
                filteredOperators.map((op, idx) => {
                  const idKey = String(op.id);
                  const isChecked = selectedIds.has(idKey);
                  const assignment = assignmentsByOperatorId[idKey];
                  const isUnassigning = unassigningId === assignment?.id;
                  const deptLine = [op.department, op.line]
                    .filter(Boolean)
                    .join(" / ");

                  return (
                    <tr
                      key={idKey}
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
                        {assignment ? (
                          <div className="inline-flex items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{assignment.status || "Assigned"}</span>
                            </span>
                            <button
                              type="button"
                              disabled={isUnassigning}
                              onClick={(e) => handleUnassign(e, op, assignment)}
                              title="Unassign paper from this operator"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-40 cursor-pointer"
                            >
                              {isUnassigning ? (
                                <span className="block h-3.5 w-3.5 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Not Assigned
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
