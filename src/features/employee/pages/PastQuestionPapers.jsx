import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Eye,
  Calendar,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { getUser } from "@/features/auth/utils/authStorage.js";
import Day1QuestionPaper from "@/features/lms/components/Day1QuestionPaper.jsx";
import Day2QuestionPaper from "@/features/lms/components/Day2QuestionPaper.jsx";
import DynamicDayQuestionPaper from "@/features/lms/components/DynamicDayQuestionPaper.jsx";
import QuestionPaperApi, {
  getApiErrorMessage,
  mapApiResponseToPaper,
  mapApiSubmissionToModel,
} from "@/features/lms/services/QuestionPaperApi.js";
import { getDefaultDayPaper } from "@/features/lms/utils/defaultDayPapers.js";
import {
  getEmployeeStorageKey,
  doesSubmissionBelongToEmployee,
} from "../utils/questionPaperStorage.js";

export default function PastQuestionPapers() {
  const navigate = useNavigate();
  const user = getUser();
  const userKey = getEmployeeStorageKey(user);
  const displayName = user?.empName || user?.name || user?.username || "Employee";
  const displayPayCode = user?.payCode ? `(${user.payCode})` : "";

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active viewing submission + fetched question paper
  const [viewingState, setViewingState] = useState(null); // { submission, paper }
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const numericUserId =
        user?.id != null && !Number.isNaN(Number(user.id))
          ? Number(user.id)
          : undefined;

      const res = await QuestionPaperApi.getOperatorPastPapers(
        numericUserId !== undefined ? { operator_id: numericUserId } : {}
      );
      const rawList = Array.isArray(res?.data) ? res.data : [];
      const mapped = rawList
        .map(mapApiSubmissionToModel)
        .filter((s) => s && doesSubmissionBelongToEmployee(s, user));

      setSubmissions(mapped);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load past question paper submissions.")
      );
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleViewSubmission = async (sub) => {
    if (!sub?.id) return;
    setLoadingDetail(true);
    setDetailError(null);
    setViewingState({ submission: sub, paper: null });

    try {
      const [subRes, paperRes] = await Promise.all([
        QuestionPaperApi.getSubmissionById(sub.id),
        sub.questionPaperId != null
          ? QuestionPaperApi.getQuestionPaperById(sub.questionPaperId)
          : Promise.resolve(null),
      ]);

      const detailedSubmission = mapApiSubmissionToModel(subRes?.data) || sub;
      const detailedPaper = paperRes?.data
        ? mapApiResponseToPaper(paperRes.data)
        : getDefaultDayPaper(detailedSubmission.dayType || "DAY_1");

      setViewingState({
        submission: detailedSubmission,
        paper: detailedPaper,
      });
    } catch (err) {
      setDetailError(
        getApiErrorMessage(err, "Failed to load submission details.")
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "Recently";
    const d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
  };

  // View: Viewing Submitted Question Paper (Read-only)
  if (viewingState) {
    const { submission, paper } = viewingState;
    return (
      <div className="space-y-4 select-none pb-8">
        <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setViewingState(null);
                setDetailError(null);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Return to list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Past Papers</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0f1f38]">
                {submission.questionPaperTitle} (Submitted)
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {submission.status || "Completed"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {loadingDetail ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
              <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500">
                Loading submitted paper details...
              </p>
            </div>
          ) : detailError ? (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-rose-700">{detailError}</p>
              <button
                type="button"
                onClick={() => handleViewSubmission(submission)}
                className="inline-flex h-9 items-center rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : submission.dayType === "DAY_2" ? (
            <Day2QuestionPaper
              paper={paper}
              paperId={submission.questionPaperId}
              initialAnswers={submission.answers}
              isAlreadySubmitted={true}
              readOnly={true}
              submission={submission}
              initialInfo={{
                name: displayName,
                qualification: user?.designation || "Trainee Operator",
                date: formatTimestamp(submission.submittedAt),
                unit:
                  user?.plant || user?.plantLocation || user?.unit || "Plant 1",
                ...(submission.participantInfo || {}),
              }}
            />
          ) : submission.dayType === "DAY_1" ? (
            <Day1QuestionPaper
              paper={paper}
              paperId={submission.questionPaperId}
              initialAnswers={submission.answers}
              isAlreadySubmitted={true}
              readOnly={true}
              submission={submission}
              initialInfo={{
                name: displayName,
                designation: user?.designation || "Trainee Operator",
                date: formatTimestamp(submission.submittedAt),
                unit:
                  user?.plant || user?.plantLocation || user?.unit || "Plant 1",
                ...(submission.participantInfo || {}),
              }}
            />
          ) : (
            <DynamicDayQuestionPaper
              dayType={submission.dayType || "L0"}
              paper={paper}
              paperId={submission.questionPaperId}
              initialAnswers={submission.answers}
              isAlreadySubmitted={true}
              readOnly={true}
              submission={submission}
              initialInfo={{
                name: displayName,
                designation: user?.designation || "Trainee Operator",
                qualification: user?.designation || "Trainee Operator",
                date: formatTimestamp(submission.submittedAt),
                unit:
                  user?.plant || user?.plantLocation || user?.unit || "Plant 1",
                ...(submission.participantInfo || {}),
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none pb-8">
      {/* Banner matching Admin Portal */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white">
          Past Question Paper
        </h2>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-[#0f1f38]">
              Completed Training Question Papers
            </h2>
            <p className="text-xs text-slate-500">
              All question papers you have submitted are stored in the database for your review and records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {submissions.length} Completed
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-rose-700 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchSubmissions}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading, Empty, or Submissions List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs flex flex-col items-center gap-3">
            <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Loading your submitted question papers...
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Past Question Papers Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              You haven&apos;t completed any question papers yet. When you complete Day 1 or Day 2 training and submit your paper, it will move here automatically.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate("/employee/upcoming-papers")}
                className="py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <span>View Current & Upcoming Papers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/80 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        {sub.questionPaperTitle}
                      </h3>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          sub.isGraded
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {sub.isGraded ? "Graded" : "Pending Review"}
                      </span>
                      {sub.passed !== null && sub.passed !== undefined && (
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            sub.passed
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {sub.passed ? "Passed" : "Needs Improvement"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                      <span>
                        Answered: <strong>{sub.answeredCount}</strong> /{" "}
                        {sub.totalQuestions}
                      </span>
                      {sub.score != null && sub.maxScore != null && (
                        <>
                          <span>•</span>
                          <span>
                            Score: <strong>{sub.score}</strong> / {sub.maxScore}
                            {sub.percentage != null ? ` (${sub.percentage}%)` : ""}
                          </span>
                        </>
                      )}
                    </div>
                    {sub.remarks && (
                      <p className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1 inline-block">
                        <strong>Supervisor Remarks:</strong> {sub.remarks}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Submitted on {formatTimestamp(sub.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleViewSubmission(sub)}
                    className="w-full sm:w-auto py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Submitted Paper</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
