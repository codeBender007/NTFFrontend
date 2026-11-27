import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Eye,
  Calendar,
  LogOut,
  User,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { clearSession, getUser } from "@/features/auth/utils/authStorage.js";
import ntfLogo from "@/assets/images/NTF_logo_black.png";
import Day1QuestionPaper from "@/features/lms/components/Day1QuestionPaper.jsx";
import Day2QuestionPaper from "@/features/lms/components/Day2QuestionPaper.jsx";
import { getSubmittedPapers, resetPaperSubmissions } from "../utils/questionPaperStorage.js";
import { resetTrainingSchedule } from "../utils/trainingStorage.js";

export default function PastQuestionPapers() {
  const navigate = useNavigate();
  const user = getUser();
  const userEmail = user?.email || "emp123@gmail.com";

  // Submissions map
  const [submittedMap, setSubmittedMap] = useState({});

  // Active viewing paper: null | 'day1' | 'day2'
  const [viewingPaper, setViewingPaper] = useState(null);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const handleResetDemo = () => {
    resetPaperSubmissions(userEmail);
    resetTrainingSchedule(userEmail);
    setSubmittedMap({});
    setViewingPaper(null);
  };

  useEffect(() => {
    setSubmittedMap(getSubmittedPapers(userEmail));
  }, [userEmail]);

  const day1Submission = submittedMap.day1;
  const day2Submission = submittedMap.day2;
  const hasAnyPastPapers = Boolean(day1Submission?.submitted || day2Submission?.submitted);

  // View: Viewing Submitted Day 1 or Day 2 Question Paper
  if (viewingPaper) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-12">
        {/* Top bar with back button */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setViewingPaper(null)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Return to list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Past Papers</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#0f1f38]">
                {viewingPaper === "day1" ? "Day 1 Question Paper (Submitted)" : "Day 2 Question Paper (Submitted)"}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Completed
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-slate-500">
              {userEmail}
            </span>
          </div>
        </header>

        {/* Paper Container - Reusing exact Admin LMS / Dojo component in submitted state */}
        <main className="max-w-5xl mx-auto px-4 py-6 w-full">
          {viewingPaper === "day1" && (
            <Day1QuestionPaper
              initialAnswers={day1Submission?.answers}
              isAlreadySubmitted={true}
              initialInfo={{
                name: user?.name || userEmail.split("@")[0],
                designation: user?.designation || "Trainee Operator",
                date: day1Submission?.submittedAt || "",
                unit: user?.unit || "Plant 1",
              }}
            />
          )}

          {viewingPaper === "day2" && (
            <Day2QuestionPaper
              initialAnswers={day2Submission?.answers}
              isAlreadySubmitted={true}
              initialInfo={{
                name: user?.name || userEmail.split("@")[0],
                qualification: user?.designation || "Trainee Operator",
                date: day2Submission?.submittedAt || "",
                unit: user?.unit || "Plant 1",
              }}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate("/employee")}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Employee Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={ntfLogo}
            alt="NTF"
            className="h-8 w-auto object-contain mix-blend-multiply"
          />
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <h1 className="text-base sm:text-lg font-bold text-[#0f1f38]">
            Past Question Papers
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">
              {userEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-[#0f1f38]">
              Completed Training Question Papers
            </h2>
            <p className="text-xs text-slate-500">
              All question papers you have submitted are stored here for your review and records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasAnyPastPapers && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-2xs transition-all cursor-pointer inline-flex items-center space-x-1"
                title="Reset submitted papers back to initial pre-submission state for demo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset for Demo</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {hasAnyPastPapers ? "Submissions Available" : "0 Completed"}
            </span>
          </div>
        </div>

        {/* Row List or Empty State */}
        {!hasAnyPastPapers ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Past Question Papers Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              You haven't completed any question papers yet. When you complete Day 1 or Day 2 training and submit your paper, it will move here automatically.
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
            {/* ROW: DAY 1 SUBMITTED */}
            {day1Submission?.submitted && (
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/80 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        Day 1 Question Paper
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Submitted
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Company Overview, 5S & Kaizen Induction Evaluation.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Submitted on {day1Submission.submittedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewingPaper("day1")}
                    className="w-full sm:w-auto py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Submitted Paper</span>
                  </button>
                </div>
              </div>
            )}

            {/* ROW: DAY 2 SUBMITTED */}
            {day2Submission?.submitted && (
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/80 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        Day 2 Question Paper
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Submitted
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Quality Standards, PPE Guidelines & Process Discipline.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Submitted on {day2Submission.submittedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewingPaper("day2")}
                    className="w-full sm:w-auto py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Submitted Paper</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
