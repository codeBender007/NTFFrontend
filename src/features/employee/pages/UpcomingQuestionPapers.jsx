import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PlayCircle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { getUser } from "@/features/auth/utils/authStorage.js";
import Day1QuestionPaper from "@/features/lms/components/Day1QuestionPaper.jsx";
import Day2QuestionPaper from "@/features/lms/components/Day2QuestionPaper.jsx";
import DynamicDayQuestionPaper from "@/features/lms/components/DynamicDayQuestionPaper.jsx";
import TrainingSchedule from "@/features/lms/components/TrainingSchedule.jsx";
import QuestionPaperApi, {
  findCanonicalDayPaper,
  getApiErrorMessage,
  mapApiResponseToPaper,
  mapApiSubmissionToModel,
} from "@/features/lms/services/QuestionPaperApi.js";
import { getDefaultDayPaper } from "@/features/lms/utils/defaultDayPapers.js";
import { getAssignedPapersForOperator } from "@/features/supervisor/utils/supervisorAssignmentStorage.js";
import {
  fetchEmployeeJoiningDate,
  getCalendarDayDifference,
  formatDisplayDate,
  getEmployeeStorageKey,
  doesSubmissionBelongToEmployee,
} from "../utils/questionPaperStorage.js";

export default function UpcomingQuestionPapers() {
  const navigate = useNavigate();
  const user = getUser();
  const userKey = getEmployeeStorageKey(user);
  const displayName = user?.empName || user?.name || user?.username || "Employee";
  const displayPayCode = user?.payCode ? `(${user.payCode})` : "";

  // Joining date & calendar day difference calculation
  const [joiningDate, setJoiningDate] = useState("");
  const [diffDays, setDiffDays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Backend-fetched Day 1 & Day 2 papers (defaulting to canonical templates until DB papers arrive)
  const [day1Paper, setDay1Paper] = useState(() => getDefaultDayPaper("DAY_1"));
  const [day2Paper, setDay2Paper] = useState(() => getDefaultDayPaper("DAY_2"));

  // Backend-fetched submissions map { day1: submission, day2: submission } + submitted paper IDs
  const [submittedMap, setSubmittedMap] = useState({});
  const [submittedPaperIds, setSubmittedPaperIds] = useState(() => new Set());

  // Supervisor-assigned papers for this specific employee
  const [assignedPapers, setAssignedPapers] = useState([]);

  // Active attempted paper: null | 'day1' | 'day2' | 'assigned'
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [activePaperDetail, setActivePaperDetail] = useState(null);
  const [loadingPaperDetail, setLoadingPaperDetail] = useState(false);

  // Workflow step: 'paper' | 'schedule'
  const [currentStep, setCurrentStep] = useState("paper");
  const [pendingAnswers, setPendingAnswers] = useState({});
  const [pendingParticipantInfo, setPendingParticipantInfo] = useState({});
  const [pendingScoreSummary, setPendingScoreSummary] = useState(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState({
    title: "",
    message: "",
    submission: null,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const numericUserId =
        user?.id != null && !Number.isNaN(Number(user.id))
          ? Number(user.id)
          : undefined;

      const [dateStr, papersRes, submissionsRes] = await Promise.all([
        fetchEmployeeJoiningDate(user),
        QuestionPaperApi.getQuestionPapers({ is_active: true }),
        QuestionPaperApi.getSubmissions(
          numericUserId !== undefined ? { user_id: numericUserId } : {}
        ),
      ]);

      setJoiningDate(dateStr);
      setDiffDays(getCalendarDayDifference(dateStr));

      const rawPapers = Array.isArray(papersRes?.data) ? papersRes.data : [];
      const mappedPapers = rawPapers.map(mapApiResponseToPaper).filter(Boolean);

      const d1 = findCanonicalDayPaper(mappedPapers, "DAY_1");
      const d2 = findCanonicalDayPaper(mappedPapers, "DAY_2");
      setDay1Paper(d1 || getDefaultDayPaper("DAY_1"));
      setDay2Paper(d2 || getDefaultDayPaper("DAY_2"));

      const rawSubs = Array.isArray(submissionsRes?.data)
        ? submissionsRes.data
        : [];
      const employeeSubs = rawSubs
        .map(mapApiSubmissionToModel)
        .filter((s) => s && doesSubmissionBelongToEmployee(s, user));

      const nextSubmittedMap = {};
      const nextSubmittedIds = new Set();
      employeeSubs.forEach((sub) => {
        if (sub.questionPaperId != null) {
          nextSubmittedIds.add(String(sub.questionPaperId));
        }
        if (sub.dayType === "DAY_1" && !nextSubmittedMap.day1) {
          nextSubmittedMap.day1 = sub;
        } else if (sub.dayType === "DAY_2" && !nextSubmittedMap.day2) {
          nextSubmittedMap.day2 = sub;
        }
      });
      setSubmittedMap(nextSubmittedMap);
      setSubmittedPaperIds(nextSubmittedIds);

      // Load Supervisor-assigned papers strictly for this employee
      const rawAssigned = getAssignedPapersForOperator(user);
      const pendingAssigned = rawAssigned.filter(
        (ap) => !nextSubmittedIds.has(String(ap.paperId))
      );
      setAssignedPapers(pendingAssigned);
    } catch (err) {
      setLoadError(
        getApiErrorMessage(
          err,
          "Failed to load question papers and submission status from server."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open paper by fetching fresh full details via GET /api/v1/lms/question-papers/{paper_id}
  const handleAttemptPaper = async (paperKey, summaryPaper) => {
    setSelectedPaper(paperKey);
    setCurrentStep("paper");
    setSubmitError(null);
    setPendingAnswers({});
    setPendingParticipantInfo({});
    setPendingScoreSummary(null);

    if (summaryPaper?.id != null) {
      setLoadingPaperDetail(true);
      try {
        const res = await QuestionPaperApi.getQuestionPaperById(summaryPaper.id);
        setActivePaperDetail(mapApiResponseToPaper(res.data) || summaryPaper);
      } catch {
        setActivePaperDetail(summaryPaper);
      } finally {
        setLoadingPaperDetail(false);
      }
    } else {
      setActivePaperDetail(summaryPaper || null);
    }
  };

  // Open Supervisor-assigned paper by fetching full details via GET /api/v1/lms/question-papers/{paper_id}
  const handleAttemptAssignedPaper = async (assignedItem) => {
    setSelectedPaper("assigned");
    setCurrentStep("paper");
    setSubmitError(null);
    setPendingAnswers({});
    setPendingParticipantInfo({});
    setPendingScoreSummary(null);
    setLoadingPaperDetail(true);

    try {
      const res = await QuestionPaperApi.getQuestionPaperById(assignedItem.paperId);
      const mapped = mapApiResponseToPaper(res.data);
      setActivePaperDetail(mapped);
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(err, "Failed to load the assigned question paper.")
      );
      setActivePaperDetail(null);
    } finally {
      setLoadingPaperDetail(false);
    }
  };

  // Direct submission for Supervisor-assigned question paper -> POST /api/v1/lms/question-papers/{paper_id}/submit
  const handleSubmitAssignedPaper = async (answers, details = {}) => {
    if (submitting) return;
    const targetPaper = details.paper || activePaperDetail;
    if (!targetPaper?.id) {
      setSubmitError("Invalid question paper. Please go back and try again.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const numericUserId =
        user?.id != null && !Number.isNaN(Number(user.id))
          ? Number(user.id)
          : null;

      const scoreSummary = details.scoreSummary || {};
      const payload = {
        question_paper_id: targetPaper.id,
        user_id: numericUserId,
        day_type: targetPaper.raw?.day_type || targetPaper.dayType || "L0",
        answers: answers || {},
        participant_info: details.participantInfo || {},
        score: scoreSummary.score ?? null,
        max_score: scoreSummary.maxScore ?? null,
        percentage: scoreSummary.percentage ?? null,
        passed: scoreSummary.passed ?? null,
        status: "SUBMITTED",
      };

      const res = await QuestionPaperApi.submitQuestionPaperById(
        targetPaper.id,
        payload
      );
      let submissionModel = mapApiSubmissionToModel(res.data);

      if (submissionModel?.id != null) {
        try {
          const detailRes = await QuestionPaperApi.getSubmissionById(
            submissionModel.id
          );
          submissionModel =
            mapApiSubmissionToModel(detailRes.data) || submissionModel;
        } catch {
          // Retain POST response if follow-up GET fails
        }
      }

      setSuccessInfo({
        title: "Submitted Successfully!",
        message: `Your responses for "${targetPaper.title}" have been submitted and moved to Past Question Papers.`,
        submission: submissionModel,
      });
      setShowSuccessModal(true);
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(err, "Failed to submit question paper. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1 -> Step 2: Move from Question Paper to Training Schedule Sheet
  const handlePaperStepComplete = (answers, details = {}) => {
    setPendingAnswers(answers || {});
    setPendingParticipantInfo(details.participantInfo || {});
    setPendingScoreSummary(details.scoreSummary || null);
    if (details.paper) {
      setActivePaperDetail(details.paper);
    }
    setSubmitError(null);
    setCurrentStep("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Save: Submit Question Paper + Training Schedule to Backend API
  const handleSaveSchedule = async (scheduleData) => {
    if (submitting) return;

    const isDay2 = selectedPaper === "day2";
    const paperLabel = isDay2 ? "Day 2" : "Day 1";
    const targetPaper = activePaperDetail || (isDay2 ? day2Paper : day1Paper);
    const canonicalDayType = isDay2 ? "DAY_2" : "DAY_1";

    setSubmitting(true);
    setSubmitError(null);

    try {
      const numericUserId =
        user?.id != null && !Number.isNaN(Number(user.id))
          ? Number(user.id)
          : null;

      const payload = {
        question_paper_id: targetPaper?.id ?? null,
        user_id: numericUserId,
        day_type: targetPaper?.raw?.day_type || canonicalDayType,
        answers: pendingAnswers,
        participant_info: pendingParticipantInfo,
        training_schedule: scheduleData,
        score: pendingScoreSummary?.score ?? null,
        max_score: pendingScoreSummary?.maxScore ?? null,
        percentage: pendingScoreSummary?.percentage ?? null,
        passed: pendingScoreSummary?.passed ?? null,
        status: "SUBMITTED",
      };

      const res =
        targetPaper?.id != null
          ? await QuestionPaperApi.submitQuestionPaperById(targetPaper.id, payload)
          : await QuestionPaperApi.submitQuestionPaper(payload);

      let submissionModel = mapApiSubmissionToModel(res.data);

      // Fetch persisted submission details via GET /submissions/{submission_id}
      if (submissionModel?.id != null) {
        try {
          const detailRes = await QuestionPaperApi.getSubmissionById(
            submissionModel.id
          );
          submissionModel =
            mapApiSubmissionToModel(detailRes.data) || submissionModel;
        } catch {
          // Retain POST response if immediate follow-up GET fails
        }
      }

      setSuccessInfo({
        title: "Submitted Successfully!",
        message: `Your ${paperLabel} Question Paper and Training Schedule Sheet have been successfully submitted and saved to the database.`,
        submission: submissionModel,
      });
      setShowSuccessModal(true);
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(
          err,
          `Failed to submit ${paperLabel} Question Paper. Please try again.`
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedPaper(null);
    setActivePaperDetail(null);
    setCurrentStep("paper");
    setPendingAnswers({});
    setPendingParticipantInfo({});
    setPendingScoreSummary(null);
    setSubmitError(null);
    loadData();
  };

  // Check which papers have already been submitted (from backend DB)
  const isDay1Submitted = Boolean(submittedMap.day1);
  const isDay2Submitted = Boolean(submittedMap.day2);
  const allPapersSubmitted = isDay1Submitted && isDay2Submitted;

  // Strict Date-Comparison Rules (using joiningDate vs. Today's Date):
  // Case 1 — Joining Date is Today (diffDays === 0): Display ONLY Day 1 (if not yet submitted).
  // Case 2 — Joining Date is Yesterday (diffDays === 1): Display ONLY Day 2 (if not yet submitted).
  // Case 3 — Past or Future Joining Date: Display empty state.
  const showDay1 = diffDays === 0 && !isDay1Submitted && Boolean(day1Paper);
  const showDay2 = diffDays === 1 && !isDay2Submitted && Boolean(day2Paper);
  const missingDay1InDb = diffDays === 0 && !isDay1Submitted && !day1Paper;
  const missingDay2InDb = diffDays === 1 && !isDay2Submitted && !day2Paper;
  const hasAssignedPapers = assignedPapers.length > 0;
  const hasPaperToday = showDay1 || showDay2 || hasAssignedPapers;

  // View: Attempting Day 1 or Day 2 Question Paper / Training Schedule
  if (selectedPaper) {
    return (
      <div className="space-y-4 select-none pb-8">
        {/* Compact Action Bar inside EmployeeLayout */}
        <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedPaper(null);
                setActivePaperDetail(null);
                setCurrentStep("paper");
                setSubmitError(null);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Return to list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Question Papers</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h2 className="text-sm sm:text-base font-bold text-[#0f1f38]">
              {selectedPaper === "assigned"
                ? activePaperDetail?.title || "Assigned Question Paper"
                : selectedPaper === "day1"
                  ? currentStep === "schedule"
                    ? "Training Schedule Sheet (Day 1)"
                    : activePaperDetail?.title || "Day 1 Question Paper"
                  : currentStep === "schedule"
                    ? "Training Schedule Sheet (Day 2)"
                    : activePaperDetail?.title || "Day 2 Question Paper"}
            </h2>
          </div>

          {(selectedPaper === "day1" || selectedPaper === "day2") && (
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium">
              <span
                className={`px-2.5 py-1 rounded-md ${
                  currentStep === "paper"
                    ? "bg-[#0b295c] text-white font-bold"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                Step 1: Question Paper {currentStep === "schedule" && "✓"}
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-2.5 py-1 rounded-md ${
                  currentStep === "schedule"
                    ? "bg-[#0b295c] text-white font-bold"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                Step 2: Training Schedule Sheet
              </span>
            </div>
          )}
        </div>

        {/* Informative Guidance Banner when on Schedule Sheet */}
        {currentStep === "schedule" && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>
                    {selectedPaper === "day2" ? "Day 2" : "Day 1"} Question Paper answers recorded!
                  </strong>{" "}
                  Please fill the Training Schedule sheet below and click <strong>Save</strong> to complete your submission.
                </span>
              </div>
            </div>

            {submitError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-2 text-xs font-medium text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* Paper & Schedule Container */}
        <div className="w-full overflow-x-auto">
          {loadingPaperDetail ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
              <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500">
                Loading question paper...
              </p>
            </div>
          ) : (
            <>
              {selectedPaper === "assigned" && (
                <>
                  {submitError && (
                    <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-2 text-xs font-medium text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                  <DynamicDayQuestionPaper
                    dayType={activePaperDetail?.dayType || "L0"}
                    paper={activePaperDetail}
                    initialAnswers={pendingAnswers}
                    onSubmitSuccess={handleSubmitAssignedPaper}
                    initialInfo={{
                      name: displayName,
                      designation: user?.designation || "Trainee Operator",
                      qualification: user?.designation || "Trainee Operator",
                      date: formatDisplayDate(new Date()),
                      unit:
                        user?.plant ||
                        user?.plantLocation ||
                        user?.unit ||
                        "Plant 1",
                    }}
                  />
                </>
              )}

              {selectedPaper === "day1" && currentStep === "paper" && (
                <Day1QuestionPaper
                  paper={activePaperDetail}
                  initialAnswers={pendingAnswers}
                  onSubmitSuccess={handlePaperStepComplete}
                  initialInfo={{
                    name: displayName,
                    designation: user?.designation || "Trainee Operator",
                    date: formatDisplayDate(joiningDate || new Date()),
                    unit:
                      user?.plant || user?.plantLocation || user?.unit || "Plant 1",
                  }}
                />
              )}

              {selectedPaper === "day1" && currentStep === "schedule" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
                  <TrainingSchedule
                    onSave={handleSaveSchedule}
                    isSaving={submitting}
                    defaultDetails={{
                      title: "Day 1 Initial Plant Training",
                      trainer: "Line Leader",
                      date: formatDisplayDate(joiningDate || new Date()),
                      periodFrom: "09:00 AM",
                      periodTo: "05:00 PM",
                      internalExternal: "Internal",
                      venue: "Plant DOJO Center",
                    }}
                  />
                </div>
              )}

              {selectedPaper === "day2" && currentStep === "paper" && (
                <Day2QuestionPaper
                  paper={activePaperDetail}
                  initialAnswers={pendingAnswers}
                  onSubmitSuccess={handlePaperStepComplete}
                  initialInfo={{
                    name: displayName,
                    qualification: user?.designation || "Trainee Operator",
                    date: formatDisplayDate(new Date()),
                    unit:
                      user?.plant || user?.plantLocation || user?.unit || "Plant 1",
                  }}
                />
              )}

              {selectedPaper === "day2" && currentStep === "schedule" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
                  <TrainingSchedule
                    onSave={handleSaveSchedule}
                    isSaving={submitting}
                    defaultDetails={{
                      title: "Day 2 Technical & Safety Training",
                      trainer: "Line Leader",
                      date: formatDisplayDate(joiningDate || new Date()),
                      periodFrom: "09:00 AM",
                      periodTo: "05:00 PM",
                      internalExternal: "Internal",
                      venue: "Plant DOJO Center",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Pop-up Message Dialog on Successful Save */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <h3 className="text-lg font-bold text-[#0f1f38] mb-1.5">
                {successInfo.title || "Submitted Successfully!"}
              </h3>

              <p className="text-xs text-slate-600 mb-5 leading-relaxed max-w-sm mx-auto">
                {successInfo.message ||
                  "Your Question Paper and Training Schedule Sheet have been successfully submitted."}
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-5 text-[11px] text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Participant:</span>
                  <span className="font-semibold text-slate-700">
                    {displayName} {displayPayCode}
                  </span>
                </div>
                {successInfo.submission && (
                  <>
                    <div className="flex justify-between">
                      <span>Questions Answered:</span>
                      <span className="font-semibold text-slate-700">
                        {successInfo.submission.answeredCount} /{" "}
                        {successInfo.submission.totalQuestions}
                      </span>
                    </div>
                    {successInfo.submission.score != null &&
                      successInfo.submission.maxScore != null && (
                        <div className="flex justify-between">
                          <span>Score:</span>
                          <span className="font-semibold text-slate-700">
                            {successInfo.submission.score} /{" "}
                            {successInfo.submission.maxScore}
                            {successInfo.submission.percentage != null
                              ? ` (${successInfo.submission.percentage}%)`
                              : ""}
                          </span>
                        </div>
                      )}
                  </>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-700">
                    {successInfo.submission?.status || "Completed & Recorded"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="w-full py-2.5 px-4 bg-[#0b295c] hover:bg-[#123977] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Back to Question Papers
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none pb-8">
      {/* Banner matching Admin Portal */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white">
          Current Question Paper
        </h2>
      </div>

      <div className="space-y-5">
        {/* Status / Joining Date Context Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-[#0284c7]" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Joining Date:
              </span>
              <strong className="text-xs text-[#0f1f38] bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                {formatDisplayDate(joiningDate)}
              </strong>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Current Status:
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  diffDays === 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : diffDays === 1
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {diffDays === 0
                  ? "Day 1 (Joining Date)"
                  : diffDays === 1
                    ? "Day 2 (1 Day After Joining)"
                    : diffDays !== null && diffDays > 1
                      ? `Day ${diffDays + 1} (Induction Completed)`
                      : "Scheduled"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Question paper action buttons unlock dynamically based on your training day.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {loadError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-rose-700 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs flex flex-col items-center gap-3">
            <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Loading today&apos;s question papers...
            </p>
          </div>
        ) : hasPaperToday ? (
          /* Structured Row List Layout: strictly shows only today's eligible paper */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {/* ROW 1: DAY 1 QUESTION PAPER */}
            {showDay1 && (
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#edf3fb] flex items-center justify-center text-[#2563eb] shrink-0 mt-0.5">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        {day1Paper.title || "Day 1 Question Paper"}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Available Today (Day 1)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      {day1Paper.description ||
                        "NTF Company History, Overview, 5S, Kaizen, and General Plant Safety."}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-medium">
                      <span>{day1Paper.totalQuestions || 0} Questions</span>
                      <span>•</span>
                      <span>
                        Duration: {day1Paper.meta?.duration || 30} Mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAttemptPaper("day1", day1Paper)}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 stroke-[2]" />
                    <span>Attempt Day 1 Paper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ROW 2: DAY 2 QUESTION PAPER */}
            {showDay2 && (
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#edf3fb] flex items-center justify-center text-[#2563eb] shrink-0 mt-0.5">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        {day2Paper.title || "Day 2 Question Paper"}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Available Today (Day 2)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      {day2Paper.description ||
                        "Quality Standards, PPE Guidelines, Defect Types, and Process Discipline."}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-medium">
                      <span>{day2Paper.totalQuestions || 0} Questions</span>
                      <span>•</span>
                      <span>
                        Duration: {day2Paper.meta?.duration || 30} Mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAttemptPaper("day2", day2Paper)}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 stroke-[2]" />
                    <span>Attempt Day 2 Paper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {/* SUPERVISOR-ASSIGNED QUESTION PAPERS (Per-Employee Isolated) */}
            {assignedPapers.map((ap) => (
              <div
                key={ap.paperId}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] shrink-0 mt-0.5">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        {ap.title || "Assigned Question Paper"}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200">
                        Assigned by Supervisor
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      {ap.description ||
                        "Assessment paper assigned by your supervisor. Complete and submit your responses."}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-medium">
                      <span>{ap.totalQuestions || 0} Questions</span>
                      <span>•</span>
                      <span>{ap.totalMarks || 0} Marks</span>
                      <span>•</span>
                      <span>Duration: {ap.duration || 60} Mins</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAttemptAssignedPaper(ap)}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 stroke-[2]" />
                    <span>Attempt Paper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty / Notice State when no question paper is eligible for today */
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 border border-slate-200 mx-auto flex items-center justify-center">
              {allPapersSubmitted ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <ClipboardList className="w-7 h-7 text-slate-400" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-800">
              {allPapersSubmitted
                ? "All Scheduled Question Papers Completed!"
                : diffDays === 0 && isDay1Submitted
                  ? "Today's Day 1 Question Paper Completed!"
                  : diffDays === 1 && isDay2Submitted
                    ? "Today's Day 2 Question Paper Completed!"
                    : missingDay1InDb
                      ? "Day 1 Question Paper Not Published Yet"
                      : missingDay2InDb
                        ? "Day 2 Question Paper Not Published Yet"
                        : "No question papers available for today"}
            </h3>

            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {allPapersSubmitted
                ? "You have completed both Day 1 and Day 2 question papers. They have been moved to your Past Question Papers repository."
                : diffDays === 0 && isDay1Submitted
                  ? "You have already completed and submitted your Day 1 Question Paper today. Day 2 Question Paper will unlock tomorrow."
                  : diffDays === 1 && isDay2Submitted
                    ? "You have already completed and submitted your Day 2 Question Paper today. You can review your submission under Past Question Papers."
                    : missingDay1InDb
                      ? "No active Day 1 Question Paper is currently configured in the database. Please contact your trainer or administrator."
                      : missingDay2InDb
                        ? "No active Day 2 Question Paper is currently configured in the database. Please contact your trainer or administrator."
                        : diffDays !== null && diffDays > 1
                          ? "Induction question papers are scheduled strictly for Day 1 (joining date) and Day 2 (next day). Because your joining date has passed, there are no active question papers scheduled for today."
                          : diffDays !== null && diffDays < 0
                            ? `Your training begins on your official joining date (${formatDisplayDate(joiningDate)}). Your Day 1 Question Paper will unlock on that day.`
                            : "There are no question papers scheduled for today."}
            </p>

            {(isDay1Submitted || isDay2Submitted || submittedPaperIds.size > 0) && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/employee/past-papers")}
                  className="py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View Past Question Papers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
