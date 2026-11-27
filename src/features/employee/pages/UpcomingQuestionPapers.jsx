import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PlayCircle,
  ArrowRight,
  LogOut,
  User,
  ClipboardList,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { clearSession, getUser } from "@/features/auth/utils/authStorage.js";
import ntfLogo from "@/assets/images/NTF_logo_black.png";
import Day1QuestionPaper from "@/features/lms/components/Day1QuestionPaper.jsx";
import Day2QuestionPaper from "@/features/lms/components/Day2QuestionPaper.jsx";
import TrainingSchedule from "@/features/lms/components/TrainingSchedule.jsx";
import {
  fetchEmployeeJoiningDate,
  getTrainingDayNumber,
  formatDisplayDate,
  getSubmittedPapers,
  savePaperSubmission,
  setEmployeeJoiningDate,
  resetPaperSubmissions,
} from "../utils/questionPaperStorage.js";
import { saveTrainingSchedule, resetTrainingSchedule } from "../utils/trainingStorage.js";

export default function UpcomingQuestionPapers() {
  const navigate = useNavigate();
  const user = getUser();
  const userEmail = user?.email || "emp123@gmail.com";

  // Joining date & training day calculation
  const [joiningDate, setJoiningDate] = useState("");
  const [trainingDay, setTrainingDay] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active attempted paper: null | 'day1' | 'day2'
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Workflow step for Day 1: 'paper' | 'schedule'
  const [currentStep, setCurrentStep] = useState("paper");
  const [pendingAnswers, setPendingAnswers] = useState({});

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState({
    title: "",
    message: "",
  });

  // Submissions map
  const [submittedMap, setSubmittedMap] = useState({});

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const loadData = async () => {
    setLoading(true);
    const dateStr = await fetchEmployeeJoiningDate(user);
    setJoiningDate(dateStr);
    const dayNum = getTrainingDayNumber(dateStr);
    setTrainingDay(dayNum);
    setSubmittedMap(getSubmittedPapers(userEmail));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userEmail]);

  // When Day 1 Question Paper Submit button is clicked:
  // Open the Training Schedule sheet next!
  const handleDay1Submit = (answers) => {
    setPendingAnswers(answers);
    setCurrentStep("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // When Training Schedule Sheet Save button is clicked:
  const handleSaveSchedule = (scheduleData) => {
    const isDay2 = selectedPaper === "day2";
    const paperType = isDay2 ? "day2" : "day1";
    const paperLabel = isDay2 ? "Day 2" : "Day 1";

    // 1. Save question paper submission
    savePaperSubmission(paperType, pendingAnswers, userEmail);

    // 2. Save training schedule sheet
    saveTrainingSchedule(userEmail, scheduleData);

    // 3. Update state & trigger success popup
    setSubmittedMap(getSubmittedPapers(userEmail));
    setSuccessInfo({
      title: "Submitted Successfully!",
      message: `Your ${paperLabel} Question Paper and Training Schedule Sheet have been successfully submitted and recorded.`,
    });
    setShowSuccessModal(true);
  };

  // When Day 2 Paper is submitted:
  // Open the Training Schedule sheet next!
  const handleDay2Submit = (answers) => {
    setPendingAnswers(answers);
    setCurrentStep("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedPaper(null);
    setCurrentStep("paper");
    setPendingAnswers({});
    loadData();
  };

  // Helper for quick testing toggle
  const handleSimulateJoiningDate = (daysAgo) => {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    const isoStr = target.toISOString().slice(0, 10);
    setEmployeeJoiningDate(userEmail, isoStr);
    setJoiningDate(isoStr);
    setTrainingDay(daysAgo + 1);
  };

  // Helper to reset submission state back to initial pre-submission state for demo
  const handleResetDemo = () => {
    resetPaperSubmissions(userEmail);
    resetTrainingSchedule(userEmail);
    setSelectedPaper(null);
    setCurrentStep("paper");
    setPendingAnswers({});
    loadData();
  };

  // Check which papers remain in Upcoming (not yet submitted)
  const isDay1Submitted = Boolean(submittedMap.day1?.submitted);
  const isDay2Submitted = Boolean(submittedMap.day2?.submitted);

  // Both papers submitted check
  const allPapersSubmitted = isDay1Submitted && isDay2Submitted;

  // View: Attempting Day 1 or Day 2 Question Paper / Training Schedule
  if (selectedPaper) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-12">
        {/* Top bar with back button */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedPaper(null);
                setCurrentStep("paper");
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Return to list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Question Papers</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-base font-bold text-[#0f1f38]">
              {selectedPaper === "day1"
                ? currentStep === "schedule"
                  ? "Training Schedule Sheet (Day 1)"
                  : "Day 1 Question Paper"
                : currentStep === "schedule"
                ? "Training Schedule Sheet (Day 2)"
                : "Day 2 Question Paper"}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
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
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                {userEmail}
              </span>
            </div>
          </div>
        </header>

        {/* Informative Guidance Banner when on Schedule Sheet */}
        {currentStep === "schedule" && (
          <div className="max-w-5xl mx-auto px-4 pt-6 w-full">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>
                    {selectedPaper === "day2" ? "Day 2" : "Day 1"} Question Paper submitted!
                  </strong>{" "}
                  Please fill the Training Schedule sheet below and click <strong>Save</strong> to complete your submission.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Paper & Schedule Container */}
        <main className="max-w-5xl mx-auto px-4 py-6 w-full">
          {selectedPaper === "day1" && currentStep === "paper" && (
            <Day1QuestionPaper
              initialAnswers={pendingAnswers}
              onSubmitSuccess={handleDay1Submit}
            />
          )}

          {selectedPaper === "day1" && currentStep === "schedule" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <TrainingSchedule
                onSave={handleSaveSchedule}
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
              initialAnswers={pendingAnswers}
              onSubmitSuccess={handleDay2Submit}
            />
          )}

          {selectedPaper === "day2" && currentStep === "schedule" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <TrainingSchedule
                onSave={handleSaveSchedule}
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
        </main>

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

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-5 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Participant:</span>
                  <span className="font-semibold text-slate-700">{userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-700">Completed & Recorded</span>
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
            Current & Upcoming Question Papers
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
        {/* Status / Joining Date Context Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
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
                  trainingDay === 1
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : trainingDay === 2
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {trainingDay === 1
                  ? "Day 1 (Joining Date)"
                  : trainingDay === 2
                  ? "Day 2 (1 Day After Joining)"
                  : trainingDay && trainingDay > 2
                  ? `Day ${trainingDay} (Induction Completed)`
                  : "Scheduled"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Question paper action buttons unlock dynamically based on your training day.
            </p>
          </div>

          {/* Demonstration Date Switcher & Demo Reset Action */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 self-stretch sm:self-auto justify-end text-xs">
            <span className="text-[11px] text-slate-500 font-medium px-1">Test Day:</span>
            <button
              type="button"
              onClick={() => handleSimulateJoiningDate(0)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                trainingDay === 1
                  ? "bg-[#0d254c] text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
              title="Simulate today as joining date (Day 1)"
            >
              Day 1
            </button>
            <button
              type="button"
              onClick={() => handleSimulateJoiningDate(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                trainingDay === 2
                  ? "bg-[#0d254c] text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
              title="Simulate joined yesterday (Day 2)"
            >
              Day 2
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-2xs transition-all cursor-pointer inline-flex items-center space-x-1"
              title="Reset submitted papers back to initial pre-submission state for demo"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset for Demo</span>
            </button>
          </div>
        </div>

        {/* All Papers Submitted Notice */}
        {allPapersSubmitted ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              All Scheduled Question Papers Completed!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You have completed both Day 1 and Day 2 question papers. They have been moved to your Past Question Papers repository.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/employee/past-papers")}
                className="py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <span>View Past Question Papers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                className="py-2.5 px-4 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 font-semibold text-xs rounded-xl shadow-2xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                title="Reset for demo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset for Demo</span>
              </button>
            </div>
          </div>
        ) : (
          /* Structured Row List Layout */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {/* ROW 1: DAY 1 QUESTION PAPER (Visible if not yet submitted) */}
            {!isDay1Submitted && (
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#edf3fb] flex items-center justify-center text-[#2563eb] shrink-0 mt-0.5">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        Day 1 Question Paper
                      </h3>
                      {trainingDay === 1 ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available Today (Day 1)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {trainingDay > 1 ? "Day 1 Period Passed" : "Available on Day 1"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      NTF Company History, Overview, 5S, Kaizen, and General Plant Safety.
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-medium">
                      <span>20 Multiple Choice Questions</span>
                      <span>•</span>
                      <span>Duration: 30 Mins</span>
                    </div>
                  </div>
                </div>

                {/* Conditional Action Button: Only visible when trainingDay === 1 */}
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  {trainingDay === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaper("day1");
                        setCurrentStep("paper");
                      }}
                      className="w-full sm:w-auto py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 stroke-[2]" />
                      <span>Attempt Day 1 Paper</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium italic px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      Available on Day 1 only
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ROW 2: DAY 2 QUESTION PAPER (Visible if not yet submitted) */}
            {!isDay2Submitted && (
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#edf3fb] flex items-center justify-center text-[#2563eb] shrink-0 mt-0.5">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0f1f38]">
                        Day 2 Question Paper
                      </h3>
                      {trainingDay === 2 ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available Today (Day 2)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {trainingDay === 1 ? "Unlocks Tomorrow (Day 2)" : "Available on Day 2"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      Quality Standards, PPE Guidelines, Defect Types, and Process Discipline.
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-medium">
                      <span>20 Multiple Choice Questions</span>
                      <span>•</span>
                      <span>Duration: 30 Mins</span>
                    </div>
                  </div>
                </div>

                {/* Conditional Action Button: Only visible when trainingDay === 2 */}
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  {trainingDay === 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaper("day2");
                        setCurrentStep("paper");
                      }}
                      className="w-full sm:w-auto py-2.5 px-5 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 stroke-[2]" />
                      <span>Attempt Day 2 Paper</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium italic px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      Available on Day 2 only
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
