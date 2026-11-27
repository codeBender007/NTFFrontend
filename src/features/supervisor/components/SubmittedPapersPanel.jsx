import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Save,
  User,
  FileText,
} from "lucide-react";
import QuestionPaperApi, {
  extractSectionsForDisplay,
  getApiErrorMessage,
  mapApiResponseToPaper,
  mapApiSubmissionToModel,
} from "@/features/lms/services/QuestionPaperApi.js";
import { getDefaultDayPaper } from "@/features/lms/utils/defaultDayPapers.js";
import { getUser } from "@/features/auth/utils/authStorage.js";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
};

const isOptionCorrect = (question, option, idx) => {
  if (question.correctOption === null || question.correctOption === undefined) {
    return false;
  }
  return (
    String(idx) === String(question.correctOption) ||
    (option?.id != null && String(option.id) === String(question.correctOption)) ||
    (option?.label &&
      String(option.label).toUpperCase() ===
        String(question.correctOption).toUpperCase())
  );
};

const isOptionSelectedByEmployee = (answers, questionNumber, option, idx) => {
  const ans =
    answers?.[questionNumber] !== undefined
      ? answers[questionNumber]
      : answers?.[String(questionNumber)];
  if (ans === undefined || ans === null) return false;
  return (
    String(ans) === String(idx) ||
    (option?.id != null && String(ans) === String(option.id))
  );
};

export default function SubmittedPapersPanel({
  supervisorName = "Supervisor",
  onGradeSaved,
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | GRADED

  // Active grading state
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewPaper, setReviewPaper] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Per-question marks & remarks during evaluation
  const [questionMarks, setQuestionMarks] = useState({});
  const [remarks, setRemarks] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await QuestionPaperApi.getSubmissions({ limit: 500 });
      const rawList = Array.isArray(res?.data) ? res.data : [];
      const mapped = rawList
        .map(mapApiSubmissionToModel)
        .filter(Boolean);
      setSubmissions(mapped);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load submitted question papers.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const reviewSections = useMemo(
    () => extractSectionsForDisplay(reviewPaper),
    [reviewPaper]
  );

  const allReviewQuestions = useMemo(
    () => reviewSections.flatMap((s) => s.questions || []),
    [reviewSections]
  );

  // Open a submission for Review & Grade
  const handleOpenReview = async (sub) => {
    setReviewingSubmission(sub);
    setReviewPaper(null);
    setReviewError(null);
    setLoadingReview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const [subRes, paperRes] = await Promise.all([
        QuestionPaperApi.getSubmissionById(sub.id),
        sub.questionPaperId != null
          ? QuestionPaperApi.getQuestionPaperById(sub.questionPaperId)
          : Promise.resolve(null),
      ]);

      const detailedSub = mapApiSubmissionToModel(subRes?.data) || sub;
      const detailedPaper = paperRes?.data
        ? mapApiResponseToPaper(paperRes.data)
        : getDefaultDayPaper(detailedSub.dayType || "DAY_1");

      setReviewingSubmission(detailedSub);
      setReviewPaper(detailedPaper);
      setRemarks(detailedSub.remarks || "");

      // Initialize per-question marks from saved supervisor grades or auto-graded correctness
      const extracted = extractSectionsForDisplay(detailedPaper);
      const initialMarks = {};
      extracted.forEach((sec) => {
        (sec.questions || []).forEach((q) => {
          const savedMark = detailedSub.questionMarks?.[q.number];
          if (savedMark !== undefined && savedMark !== null) {
            initialMarks[q.number] = Number(savedMark);
          } else if (
            q.correctOption !== null &&
            q.correctOption !== undefined &&
            q.options?.length > 0
          ) {
            const matchedCorrect = q.options.some(
              (opt, idx) =>
                isOptionSelectedByEmployee(
                  detailedSub.answers,
                  q.number,
                  opt,
                  idx
                ) && isOptionCorrect(q, opt, idx)
            );
            initialMarks[q.number] = matchedCorrect ? Number(q.marks) || 1 : 0;
          } else {
            initialMarks[q.number] = 0;
          }
        });
      });
      setQuestionMarks(initialMarks);
    } catch (err) {
      setReviewError(
        getApiErrorMessage(err, "Failed to load submission details for grading.")
      );
    } finally {
      setLoadingReview(false);
    }
  };

  const totalObtainedMarks = useMemo(() => {
    return allReviewQuestions.reduce((sum, q) => {
      const val = Number(questionMarks[q.number]);
      return sum + (Number.isNaN(val) ? 0 : val);
    }, 0);
  }, [allReviewQuestions, questionMarks]);

  const totalMaxMarks = useMemo(() => {
    if (allReviewQuestions.length > 0) {
      return allReviewQuestions.reduce(
        (sum, q) => sum + (Number(q.marks) || 1),
        0
      );
    }
    return Number(reviewPaper?.totalMarks || reviewingSubmission?.maxScore || 0);
  }, [allReviewQuestions, reviewPaper, reviewingSubmission]);

  const passPercentage = Number(
    reviewPaper?.meta?.passPercentage ??
      reviewPaper?.raw?.pass_percentage ??
      80
  );

  const computedPercentage =
    totalMaxMarks > 0
      ? Number(((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2))
      : 0;
  const computedPassed = computedPercentage >= passPercentage;

  const handleMarkChange = (qNum, maxMark, rawValue) => {
    if (rawValue === "") {
      setQuestionMarks((prev) => ({ ...prev, [qNum]: "" }));
      return;
    }
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(Number(maxMark) || 1, parsed));
    setQuestionMarks((prev) => ({ ...prev, [qNum]: clamped }));
  };

  // PUT /api/v1/lms/question-papers/submissions/{submission_id}/grade
  const handleSaveMarks = async () => {
    if (!reviewingSubmission || savingGrade) return;

    const cleanQuestionMarks = {};
    allReviewQuestions.forEach((q) => {
      const val = Number(questionMarks[q.number]);
      cleanQuestionMarks[String(q.number)] = Number.isNaN(val) ? 0 : val;
    });

    setSavingGrade(true);
    setReviewError(null);
    try {
      const currentUser = getUser();
      const gradedById =
        currentUser?.id != null && !Number.isNaN(Number(currentUser.id))
          ? Number(currentUser.id)
          : null;

      const payload = {
        question_marks: cleanQuestionMarks,
        score: totalObtainedMarks,
        max_score: totalMaxMarks,
        percentage: computedPercentage,
        passed: computedPassed,
        remarks: remarks.trim() || null,
        graded_by: gradedById,
        graded_by_name: supervisorName,
        status: "GRADED",
      };

      const res = await QuestionPaperApi.gradeSubmission(
        reviewingSubmission.id,
        payload
      );
      const updatedModel = mapApiSubmissionToModel(res.data);

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === reviewingSubmission.id
            ? updatedModel || item
            : item
        )
      );

      const empLabel =
        reviewingSubmission.userName ||
        reviewingSubmission.userPayCode ||
        "Employee";
      const msg = `Saved marks (${totalObtainedMarks}/${totalMaxMarks} — ${computedPercentage}%) for ${empLabel}.`;

      if (onGradeSaved) {
        onGradeSaved(msg);
      }

      setReviewingSubmission(null);
      setReviewPaper(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setReviewError(
        getApiErrorMessage(err, "Failed to save marks to the backend. Please try again.")
      );
    } finally {
      setSavingGrade(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return submissions.filter((sub) => {
      if (statusFilter === "PENDING" && sub.isGraded) return false;
      if (statusFilter === "GRADED" && !sub.isGraded) return false;
      if (!q) return true;
      const name = String(sub.userName || "").toLowerCase();
      const payCode = String(sub.userPayCode || "").toLowerCase();
      const title = String(sub.questionPaperTitle || "").toLowerCase();
      const day = String(sub.dayType || "").toLowerCase();
      return (
        name.includes(q) ||
        payCode.includes(q) ||
        title.includes(q) ||
        day.includes(q)
      );
    });
  }, [submissions, searchQuery, statusFilter]);

  const gradedCount = submissions.filter((s) => s.isGraded).length;
  const pendingCount = submissions.length - gradedCount;

  // =========================================================
  // VIEW: REVIEW & GRADE SINGLE SUBMISSION
  // =========================================================
  if (reviewingSubmission) {
    return (
      <div className="space-y-4">
        {/* Top Review Sticky Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs px-4 sm:px-5 py-3.5 sticky top-16 z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                setReviewingSubmission(null);
                setReviewPaper(null);
                setReviewError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Submitted Papers</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#0f1f38] truncate">
                {reviewingSubmission.questionPaperTitle}
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                {reviewingSubmission.userName || "Employee"}{" "}
                {reviewingSubmission.userPayCode
                  ? `(${reviewingSubmission.userPayCode})`
                  : ""}{" "}
                &bull; Submitted {formatTimestamp(reviewingSubmission.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Total Score:</span>
              <span className="font-bold text-[#0b295c]">
                {totalObtainedMarks} / {totalMaxMarks} ({computedPercentage}%)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  computedPassed
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {computedPassed ? "PASS" : "FAIL"}
              </span>
            </div>

            <button
              type="button"
              disabled={loadingReview || savingGrade}
              onClick={handleSaveMarks}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {savingGrade ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Marks</span>
                </>
              )}
            </button>
          </div>
        </div>

        {loadingReview ? (
          <div className="bg-white rounded-xl border border-slate-200/90 p-12 flex flex-col items-center justify-center gap-3">
            <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Loading employee submission &amp; question paper...
            </p>
          </div>
        ) : reviewError ? (
          <div className="bg-white rounded-xl border border-rose-200 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">{reviewError}</p>
            <button
              type="button"
              onClick={() => handleOpenReview(reviewingSubmission)}
              className="inline-flex h-9 items-center rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 text-xs font-semibold text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Employee & Submission Metadata Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Employee</p>
                  <p className="font-bold text-slate-800">
                    {reviewingSubmission.userName || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-medium">Paycode</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {reviewingSubmission.userPayCode || "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Questions Answered
                </p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {reviewingSubmission.answeredCount} /{" "}
                  {reviewingSubmission.totalQuestions || allReviewQuestions.length}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Passing Threshold
                </p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {passPercentage}% or Above
                </p>
              </div>
            </div>

            {/* Sections & Questions Grading List */}
            {reviewSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                <div className="bg-[#0b295c] text-white px-5 py-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {sec.name}
                  </h3>
                  <span className="text-[11px] text-sky-100/80 font-medium">
                    {sec.questions.length} Question
                    {sec.questions.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {sec.questions.map((q) => {
                    const empAnswerRaw =
                      reviewingSubmission.answers?.[q.number] !== undefined
                        ? reviewingSubmission.answers[q.number]
                        : reviewingSubmission.answers?.[String(q.number)];
                    const maxMark = Number(q.marks) || 1;
                    const currentMark =
                      questionMarks[q.number] !== undefined
                        ? questionMarks[q.number]
                        : 0;

                    return (
                      <div
                        key={q.number}
                        className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4"
                      >
                        <div className="flex-1 space-y-2.5">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                            <span className="text-[#0284c7] font-bold mr-1.5">
                              Q{q.number}.
                            </span>
                            {q.text}
                          </p>

                          {q.options && q.options.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                              {q.options.map((opt, idx) => {
                                const selected = isOptionSelectedByEmployee(
                                  reviewingSubmission.answers,
                                  q.number,
                                  opt,
                                  idx
                                );
                                const correct = isOptionCorrect(q, opt, idx);

                                let boxStyle =
                                  "border-slate-200 bg-slate-50/40 text-slate-600";
                                if (selected && correct) {
                                  boxStyle =
                                    "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
                                } else if (selected) {
                                  boxStyle =
                                    "border-blue-300 bg-blue-50 text-[#0b295c] font-semibold";
                                } else if (correct) {
                                  boxStyle =
                                    "border-emerald-200 bg-emerald-50/50 text-emerald-800";
                                }

                                return (
                                  <div
                                    key={opt.id ?? idx}
                                    className={`rounded-lg border px-3 py-2 text-xs flex items-center justify-between gap-2 ${boxStyle}`}
                                  >
                                    <div className="flex items-start gap-1.5">
                                      <span className="font-bold">
                                        ({ALPHABET[idx] || opt.label?.toLowerCase()})
                                      </span>
                                      <span>{opt.value}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {selected && (
                                        <span className="px-1.5 py-0.5 rounded bg-[#0b295c] text-white text-[10px] font-bold">
                                          Employee
                                        </span>
                                      )}
                                      {correct && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="pl-4">
                              <p className="text-[11px] font-semibold text-slate-500 mb-1">
                                Employee&apos;s Written Answer:
                              </p>
                              <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3.5 py-2.5 text-xs font-medium text-[#0b295c]">
                                {empAnswerRaw != null &&
                                String(empAnswerRaw).trim() !== "" ? (
                                  String(empAnswerRaw)
                                ) : (
                                  <span className="text-slate-400 italic">
                                    (No answer submitted)
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Per-Question Marks Input */}
                        <div className="lg:w-44 shrink-0 bg-slate-50 rounded-xl border border-slate-200 p-3 flex lg:flex-col items-center lg:items-stretch justify-between gap-2">
                          <label className="text-[11px] font-semibold text-slate-600">
                            Marks Awarded (Max {maxMark})
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={maxMark}
                              step="0.5"
                              value={currentMark}
                              onChange={(e) =>
                                handleMarkChange(q.number, maxMark, e.target.value)
                              }
                              className="w-20 h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
                            />
                            <span className="text-xs font-semibold text-slate-400">
                              / {maxMark}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Supervisor Remarks & Bottom Save Marks Button */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supervisor Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add feedback or evaluation notes for this employee..."
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-600">
                  Final Calculated Score:{" "}
                  <strong className="text-[#0b295c] text-sm">
                    {totalObtainedMarks} / {totalMaxMarks} ({computedPercentage}%)
                  </strong>
                </div>

                <button
                  type="button"
                  disabled={savingGrade}
                  onClick={handleSaveMarks}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-6 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {savingGrade ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>Saving Marks...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Marks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // VIEW: SUBMITTED PAPERS LIST TABLE
  // =========================================================
  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white">
          Submitted Papers
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-white/15 font-semibold">
            {submissions.length} Total
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 font-semibold">
            {pendingCount} Pending
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 font-semibold">
            {gradedCount} Graded
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchSubmissions}
            className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-[11px] font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Employee Test Submissions
              </h3>
              <p className="text-xs text-slate-500">
                Review employee answers and assign or update evaluation marks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee, paycode, paper..."
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#0284c7] transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0284c7] cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Review</option>
              <option value="GRADED">Graded</option>
            </select>

            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="bg-[#0b295c] text-white">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Employee Name &amp; Paycode
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Question Paper Title / Day
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Submitted Date &amp; Time
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Status
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider border-r border-[#153e7e]">
                  Marks Obtained / Total
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">
                  Action
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
                      <span>Loading submitted question papers...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredSubmissions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs text-slate-400"
                  >
                    No submitted question papers found.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredSubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                      idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 border-r border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">
                        {sub.userName || "Employee"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {sub.userPayCode || `ID #${sub.userId}`}
                      </p>
                    </td>

                    <td className="px-4 py-3 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">
                          {sub.questionPaperTitle}
                        </span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {sub.dayType || sub.rawDayType || "Test Paper"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">
                      {formatTimestamp(sub.submittedAt)}
                    </td>

                    <td className="px-4 py-3 text-center border-r border-slate-100">
                      {sub.isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Graded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center border-r border-slate-100">
                      {sub.score != null && sub.maxScore != null ? (
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            {sub.score} / {sub.maxScore}
                          </span>
                          {sub.percentage != null && (
                            <p className="text-[11px] font-semibold text-slate-500">
                              {sub.percentage}%
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          — / {sub.totalQuestions || 0}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(sub)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-3.5 text-[11px] font-semibold text-white shadow-xs transition cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>{sub.isGraded ? "Edit Marks" : "Review & Grade"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
