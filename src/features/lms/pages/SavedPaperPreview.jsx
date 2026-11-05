import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionPaperPreview from "../components/QuestionPaperPreview";
import { getSavedPapers } from "../utils/testPapers";

const SavedPaperPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const paper = getSavedPapers().find((p) => p.id === id);

  if (!paper) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white rounded-xl border border-slate-200/90 shadow-xs p-8 max-w-md w-full">
          <p className="text-sm font-semibold text-slate-600">
            Question paper not found.
          </p>
          <button
            type="button"
            onClick={() => navigate("/lms/dojo-hiring")}
            className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            Back to DOJO Hiring
          </button>
        </div>
      </div>
    );
  }

  return <QuestionPaperPreview level={paper.level || "L0"} paper={paper} />;
};

export default SavedPaperPreview;
