import { useState, useMemo } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

const QuestionListCard = ({
  sectionName = "Section A",
  questions = [],
  selectedQuestion,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
}) => {
  const [search, setSearch] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return questions;
    return questions.filter(
      (q) =>
        q.question?.toLowerCase().includes(search.toLowerCase()) ||
        q.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [questions, search]);

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden p-4 space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Title */}
        <h2 className="text-sm font-bold text-[#0f172a]">
          Questions in {sectionName}
        </h2>

        {/* Search, Filter, & Add Q Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-9 rounded-xl border border-[#e2edf2] bg-gray-50/50 px-2.5 flex items-center gap-2 focus-within:bg-white focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/15 transition">
            <SearchOutlinedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full text-xs bg-transparent outline-none text-[#0f172a] placeholder:text-[#94a3b8]"
            />
          </div>

          <button
            type="button"
            className="h-9 w-9 rounded-xl border border-[#e2edf2] bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 transition shadow-xs"
            title="Filter"
          >
            <FilterListOutlinedIcon sx={{ fontSize: 18 }} />
          </button>

          <button
            type="button"
            onClick={onAddQuestion}
            className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] text-white text-xs font-semibold shadow-sm shadow-[#0d9488]/25 flex items-center gap-1 shrink-0 transition"
          >
            <AddOutlinedIcon sx={{ fontSize: 16 }} />
            Add Question
          </button>
        </div>

        {/* Question Serial List */}
        <div className="space-y-1.5 min-h-[200px] max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredQuestions.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              No questions found.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const active = selectedQuestion === q.id;
              const serialNum = idx + 1;
              const snippet = q.question?.trim() || `Question ${serialNum}`;

              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all group ${
                    active
                      ? "bg-[#e6f7f5]/40 border-[#0d9488] text-[#0d9488] font-semibold shadow-xs"
                      : "bg-white border-[#e2edf2] hover:border-[#0d9488]/40 hover:bg-[#f0f9f8] text-[#0f172a]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        active ? "text-[#0d9488]" : "text-[#64748b]"
                      }`}
                    >
                      {serialNum}.
                    </span>

                    <span className="text-xs truncate font-medium">
                      {snippet}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuestion(q.id);
                        }}
                        className="h-6 w-6 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        title="Delete question"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                      </button>
                    )}

                    <MoreVertOutlinedIcon
                      sx={{ fontSize: 16, color: active ? "#0d9488" : "#8A8A8A" }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing 1 to {filteredQuestions.length} of {questions.length} questions
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-7 w-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition"
          >
            <ChevronLeftOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            type="button"
            className="h-7 w-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition"
          >
            <ChevronRightOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionListCard;
