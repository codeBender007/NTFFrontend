import { useNavigate, useParams } from "react-router-dom";
import QuestionPaperPreview from "../components/QuestionPaperPreview";
import { getSavedPapers } from "../utils/testPapers";

const SavedPaperPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const paper = getSavedPapers().find((p) => p.id === id);

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500">
            Question paper not found.
          </p>
          <button
            type="button"
            onClick={() => navigate("/lms/dojo-hiring")}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-5 text-xs font-semibold text-white shadow-sm"
          >
            Back to Dojo Hiring
          </button>
        </div>
      </div>
    );
  }

  return <QuestionPaperPreview level={paper.level || "L0"} paper={paper} />;
};

export default SavedPaperPreview;