import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import QuestionPaperPage from "../components/QuestionPaperPage";
import QuestionPaperApi, {
  getApiErrorMessage,
  mapApiResponseToPaper,
} from "../services/QuestionPaperApi";

const EditQuestionPaper = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaper = useCallback(
    async (signal) => {
      if (!id) {
        setError("Invalid question paper ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await QuestionPaperApi.getQuestionPaperById(
          id,
          signal ? { signal } : {}
        );
        const mapped = mapApiResponseToPaper(response.data);
        setPaper(mapped);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        setError(
          getApiErrorMessage(err, "Failed to load question paper for editing.")
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPaper(controller.signal);
    return () => controller.abort();
  }, [fetchPaper]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Loading question paper editor...
          </p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl border border-slate-200/90 shadow-xs p-8 max-w-md w-full space-y-4">
          <div className="mx-auto h-11 w-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 22 }} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {error || "Question paper not found."}
          </p>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => fetchPaper()}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => navigate("/lms/dojo-hiring")}
              className="inline-flex h-9 items-center rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              Back to DOJO Hiring
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionPaperPage
      key={paper.id}
      level={paper.level || "L0"}
      initialPaper={paper}
      bannerTitle={`Edit Question Paper: ${paper.title || ""}`}
      onBack={() => navigate("/lms/dojo-hiring")}
    />
  );
};

export default EditQuestionPaper;
