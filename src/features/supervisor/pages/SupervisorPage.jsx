import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getUser } from "@/features/auth/utils/authStorage.js";
import QuestionPaperPage from "@/features/lms/components/QuestionPaperPage.jsx";
import QuestionPaperTable from "@/features/lms/components/QuestionPaperTable.jsx";
import QuestionPaperPreview from "@/features/lms/components/QuestionPaperPreview.jsx";
import QuestionPaperApi, {
  getApiErrorMessage,
  mapApiResponseToPaper,
} from "@/features/lms/services/QuestionPaperApi.js";
import OperatorAssignmentPanel from "../components/OperatorAssignmentPanel.jsx";
import SubmittedPapersPanel from "../components/SubmittedPapersPanel.jsx";

/**
 * Supervisor Portal Route Views (rendered inside persistent SupervisorLayout):
 * - mode="create"  : /supervisor/create           -> POST /api/v1/lms/question-papers/
 * - mode="edit"    : /supervisor/edit/:id         -> GET & PUT /api/v1/lms/question-papers/{paper_id}
 * - mode="list"    : /supervisor/saved-papers     -> GET & DELETE /api/v1/lms/question-papers/
 * - mode="preview" : /supervisor/preview/:id      -> GET /api/v1/lms/question-papers/{paper_id}
 * - mode="assign"  : /supervisor/assign-operators -> Assign saved papers to Operators
 */
export default function SupervisorPage({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const user = getUser();
  const supervisorName =
    user?.empName || user?.name || user?.username || "Supervisor";

  const [savedPapers, setSavedPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(
    mode === "list" || mode === "assign"
  );

  const [activePaper, setActivePaper] = useState(
    () => location.state?.selectedPaper || location.state?.paper || null
  );
  const [loadingDetail, setLoadingDetail] = useState(
    (mode === "edit" || mode === "preview") && !location.state?.paper
  );

  const [apiError, setApiError] = useState(null);
  const [toastMessage, setToastMessage] = useState(
    () => location.state?.toastMessage || ""
  );

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  }, []);

  useEffect(() => {
    if (location.state?.toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [location.state?.toastMessage]);

  // GET /api/v1/lms/question-papers/ for Saved Test Papers & Assign to Operators
  const fetchPapers = useCallback(async (signal) => {
    setLoadingPapers(true);
    setApiError(null);
    try {
      const res = await QuestionPaperApi.getQuestionPapers(
        {},
        signal ? { signal } : {}
      );
      const rawList = Array.isArray(res?.data) ? res.data : [];
      const mapped = rawList.map(mapApiResponseToPaper).filter(Boolean);
      setSavedPapers(mapped);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return;
      }
      setApiError(
        getApiErrorMessage(err, "Failed to load question papers from server.")
      );
    } finally {
      setLoadingPapers(false);
    }
  }, []);

  // GET /api/v1/lms/question-papers/{paper_id} for Edit & Preview
  const fetchPaperById = useCallback(
    async (paperId, signal) => {
      if (!paperId) return;
      setLoadingDetail(true);
      setApiError(null);
      try {
        const res = await QuestionPaperApi.getQuestionPaperById(
          paperId,
          signal ? { signal } : {}
        );
        const mapped = mapApiResponseToPaper(res.data);
        setActivePaper(mapped);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        setApiError(
          getApiErrorMessage(err, "Failed to load question paper details.")
        );
      } finally {
        setLoadingDetail(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    if (mode === "list" || mode === "assign") {
      fetchPapers(controller.signal);
    } else if ((mode === "edit" || mode === "preview") && id) {
      fetchPaperById(id, controller.signal);
    }

    return () => controller.abort();
  }, [mode, id, fetchPapers, fetchPaperById]);

  // DELETE /api/v1/lms/question-papers/{paper_id}
  const handleDeletePaper = async (paper) => {
    if (!paper?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${paper.title || "this question paper"}"?`
    );
    if (!confirmed) return;

    setApiError(null);
    try {
      await QuestionPaperApi.deleteQuestionPaper(paper.id);
      setSavedPapers((prev) => prev.filter((p) => p.id !== paper.id));
      showToast(`"${paper.title || "Question Paper"}" deleted successfully.`);
    } catch (err) {
      setApiError(
        getApiErrorMessage(
          err,
          "Failed to delete question paper. Please try again."
        )
      );
    }
  };

  const handlePaperSaved = (savedPaper) => {
    const paperTitle = savedPaper?.title || "Test Paper";
    navigate("/supervisor/assign-operators", {
      state: {
        selectedPaper: savedPaper,
        toastMessage: `"${paperTitle}" saved! Select Operators below to send it.`,
      },
    });
  };

  const handlePreviewFromEditor = (savedPaper) => {
    if (savedPaper?.id != null) {
      navigate(`/supervisor/preview/${savedPaper.id}`, {
        state: { paper: savedPaper },
      });
    } else {
      navigate("/supervisor/saved-papers");
    }
  };

  return (
    <div className="space-y-4 select-none pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* API Error Banner */}
      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: Create Question Paper */}
      {mode === "create" && (
        <QuestionPaperPage
          key="supervisor_create_paper"
          level="L0"
          bannerTitle="Create Question Paper"
          onSaveSuccess={handlePaperSaved}
          onPreview={handlePreviewFromEditor}
        />
      )}

      {/* VIEW 2: Edit Question Paper */}
      {mode === "edit" && (
        loadingDetail ? (
          <div className="bg-white rounded-xl border border-slate-200/90 p-12 flex flex-col items-center justify-center gap-3">
            <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Loading question paper...
            </p>
          </div>
        ) : (
          <QuestionPaperPage
            key={activePaper?.id || id || "edit_paper"}
            level={activePaper?.level || "L0"}
            initialPaper={activePaper}
            bannerTitle={
              activePaper?.title
                ? `Edit Question Paper: ${activePaper.title}`
                : "Edit Question Paper"
            }
            onSaveSuccess={handlePaperSaved}
            onPreview={handlePreviewFromEditor}
            onBack={() => navigate("/supervisor/saved-papers")}
          />
        )
      )}

      {/* VIEW 3: Saved Test Papers */}
      {mode === "list" && (
        <div className="space-y-4">
          <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white">
              Saved Test Papers
            </h2>
          </div>

          {loadingPapers && savedPapers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-12 flex flex-col items-center justify-center gap-3">
              <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500">
                Loading saved test papers...
              </p>
            </div>
          ) : (
            <QuestionPaperTable
              onCreate={() => navigate("/supervisor/create")}
              onView={(paper) =>
                navigate(`/supervisor/preview/${paper.id}`, {
                  state: { paper },
                })
              }
              onEdit={(paper) =>
                navigate(`/supervisor/edit/${paper.id}`, {
                  state: { paper },
                })
              }
              onDelete={handleDeletePaper}
              customRows={savedPapers}
              title="Saved Test Papers"
              subtitle="All question and assessment papers stored in the database"
            />
          )}
        </div>
      )}

      {/* VIEW 4: Assign to Operators */}
      {mode === "assign" && (
        <OperatorAssignmentPanel
          selectedPaper={activePaper || savedPapers[0] || null}
          savedPapers={savedPapers}
          onSelectPaper={(paper) => setActivePaper(paper)}
          supervisorName={supervisorName}
          onAssignmentComplete={({ summaryText }) => {
            showToast(summaryText);
          }}
          onBack={() => navigate("/supervisor/saved-papers")}
        />
      )}

      {/* VIEW 5: Submitted Papers / Evaluation */}
      {mode === "submitted" && (
        <SubmittedPapersPanel
          supervisorName={supervisorName}
          onGradeSaved={(summaryText) => {
            showToast(summaryText);
          }}
        />
      )}

      {/* VIEW 5: Question Paper Preview */}
      {mode === "preview" && (
        loadingDetail ? (
          <div className="bg-white rounded-xl border border-slate-200/90 p-12 flex flex-col items-center justify-center gap-3">
            <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Loading question paper preview...
            </p>
          </div>
        ) : (
          <QuestionPaperPreview
            level={activePaper?.level || "L0"}
            paper={activePaper}
            onBack={() => navigate("/supervisor/saved-papers")}
            onEdit={() => {
              if (activePaper?.id != null) {
                navigate(`/supervisor/edit/${activePaper.id}`, {
                  state: { paper: activePaper },
                });
              } else {
                navigate("/supervisor/create");
              }
            }}
          />
        )
      )}
    </div>
  );
}
