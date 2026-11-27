import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  FilePlus,
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import ntfLogo from "@/assets/images/NTF_logo_black.png";
import { clearSession, getUser } from "@/features/auth/utils/authStorage.js";
import QuestionPaperPage from "@/features/lms/components/QuestionPaperPage.jsx";
import QuestionPaperTable from "@/features/lms/components/QuestionPaperTable.jsx";
import QuestionPaperPreview from "@/features/lms/components/QuestionPaperPreview.jsx";
import {
  saveSupervisorPaper,
  getSupervisorPapers,
  getActiveSupervisorPaper,
  setActiveSupervisorPaper,
  deleteSupervisorPaper,
} from "../utils/supervisorStorage.js";

/**
 * Supervisor Portal: Test Paper Management & Creation View
 * Reuses the existing LMS -> Dojo Hiring Test Paper module in an isolated Supervisor portal layout.
 */
export default function SupervisorPage() {
  const navigate = useNavigate();
  const user = getUser();
  const supervisorName = user?.name || user?.username || "Supervisor";

  // Views: 'create' (Editor) | 'list' (Table) | 'preview' (Paper Preview)
  const [activeTab, setActiveTab] = useState("create");
  const [editingPaper, setEditingPaper] = useState(null);
  const [selectedPaperForPreview, setSelectedPaperForPreview] = useState(null);
  const [savedPapers, setSavedPapers] = useState(() => getSupervisorPapers());
  const [activePaper, setActivePaper] = useState(() => getActiveSupervisorPaper());
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setSavedPapers(getSupervisorPapers());
  }, [activeTab]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const handlePaperSaved = (savedData) => {
    // 1. Persist into supervisor storage & mark active
    const saved = saveSupervisorPaper(savedData);
    const updatedList = getSupervisorPapers();
    setSavedPapers(updatedList);
    setActivePaper(saved || savedData);
    setActiveSupervisorPaper(saved || savedData);
    setEditingPaper(null);

    const paperTitle = saved?.title || savedData?.title || "Test Paper";
    setToastMessage(`"${paperTitle}" saved successfully! It is now visible in the table.`);
    setShowSavedToast(true);

    // 2. Automatically navigate to the table view so the newly saved paper is immediately visible
    setActiveTab("list");
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      setShowSavedToast(false);
    }, 4500);
  };

  const handleEditPaper = (paper) => {
    setEditingPaper(paper);
    setSelectedPaperForPreview(null);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePaper = (paper) => {
    if (paper?.id) {
      deleteSupervisorPaper(paper.id);
      const updated = getSupervisorPapers();
      setSavedPapers(updated);
      if (editingPaper?.id === paper.id) {
        setEditingPaper(null);
      }
      setToastMessage(`"${paper.title || "Question Paper"}" deleted successfully.`);
      setShowSavedToast(true);
      setTimeout(() => {
        setShowSavedToast(false), 3500;
      });
    }
  };

  const handleViewPreview = (paper) => {
    setSelectedPaperForPreview(paper);
    setActiveTab("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-12">
      {/* ── Top Header Bar ── */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
          {/* Left: Branding & Role Title */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <img
              src={ntfLogo}
              alt="NTF Group"
              className="h-8 sm:h-9 w-auto object-contain shrink-0"
            />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none truncate">
                  Supervisor Portal
                </h1>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <ShieldCheck className="w-3 h-3 text-sky-600" />
                  <span>Supervisor</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-1 truncate">
                DOJO Hiring &bull; Test Paper Creation Module
              </p>
            </div>
          </div>

          {/* Center / Navigation Switcher Tabs */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 space-x-1">
            <button
              type="button"
              onClick={() => {
                setEditingPaper(null);
                setActiveTab("create");
                setSelectedPaperForPreview(null);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-white text-[#0b295c] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Create Test Paper</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("list");
                setSelectedPaperForPreview(null);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "list"
                  ? "bg-white text-[#0b295c] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Saved Test Papers</span>
              {savedPapers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 font-bold">
                  {savedPapers.length}
                </span>
              )}
            </button>
          </div>

          {/* Right: Supervisor Profile & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div className="w-6 h-6 rounded-full bg-[#0b295c] text-white flex items-center justify-center font-bold text-[10px]">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-800">{supervisorName}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-1.5 py-2 px-3 sm:px-3.5 bg-rose-50 hover:bg-rose-100/90 text-rose-700 border border-rose-200/90 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-center border-t border-slate-100 py-2 space-x-2">
          <button
            type="button"
            onClick={() => {
              setEditingPaper(null);
              setActiveTab("create");
              setSelectedPaperForPreview(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "create"
                ? "bg-[#0b295c] text-white shadow-xs"
                : "text-slate-600 bg-slate-100"
            }`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create Test Paper</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("list");
              setSelectedPaperForPreview(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-[#0b295c] text-white shadow-xs"
                : "text-slate-600 bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Saved Papers ({savedPapers.length})</span>
          </button>
        </div>
      </header>

      {/* ── Active Saved Toast Notification ── */}
      {showSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Workspace Content ── */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* ── VIEW 1: Test Paper Creator / Editor ── */}
        {activeTab === "create" && (
          <div className="space-y-4">
            <QuestionPaperPage
              key={editingPaper?.id || "create_new_paper"}
              level="L0"
              initialPaper={editingPaper}
              bannerTitle={
                editingPaper
                  ? `Edit Question Paper: ${editingPaper.title || ""}`
                  : "Supervisor Test Paper Creator"
              }
              onSaveSuccess={handlePaperSaved}
              onPreview={() => {
                const active = getActiveSupervisorPaper();
                if (active) {
                  setSelectedPaperForPreview(active);
                }
                setActiveTab("preview");
              }}
              onBack={() => {
                setEditingPaper(null);
                setActiveTab("list");
              }}
            />
          </div>
        )}

        {/* ── VIEW 2: Saved Test Papers Table (Full View) ── */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <QuestionPaperTable
              onCreate={() => {
                setEditingPaper(null);
                setActiveTab("create");
                setSelectedPaperForPreview(null);
              }}
              onView={handleViewPreview}
              onEdit={handleEditPaper}
              onDelete={handleDeletePaper}
              customRows={savedPapers}
              title="Supervisor Test Papers"
              subtitle="All question and assessment papers saved in supervisor repository"
            />
          </div>
        )}

        {/* ── VIEW 3: Question Paper Preview ── */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <QuestionPaperPreview
              level="L0"
              paper={selectedPaperForPreview}
              onBack={() => setActiveTab("list")}
              onEdit={() => setActiveTab("create")}
            />
          </div>
        )}
      </main>
    </div>
  );
}
