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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden p-4 space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Title */}
        <h2 className="text-sm font-bold text-slate-900">
          Questions in {sectionName}
        </h2>

        {/* Search, Filter, & Add Q Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-2.5 flex items-center gap-2 focus-within:border-[#0284c7] focus-within:ring-2 focus-within:ring-sky-500/15 transition">
            <SearchOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full text-xs bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 transition shadow-xs"
            title="Filter"
          >
            <FilterListOutlinedIcon sx={{ fontSize: 18 }} />
          </button>

          <button
            type="button"
            onClick={onAddQuestion}
            className="h-9 px-3 rounded-lg bg-[#0b295c] hover:bg-[#082046] text-white text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0 transition"
          >
            <AddOutlinedIcon sx={{ fontSize: 16 }} />
            Add Question
          </button>
        </div>

        {/* Question Serial List */}
        <div className="space-y-1.5 min-h-[200px] max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredQuestions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
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
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all group ${
                    active
                      ? "bg-sky-50/70 border-sky-500 border-l-4 border-l-[#0284c7] text-[#0284c7] font-semibold shadow-xs"
                      : "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        active ? "text-[#0284c7]" : "text-slate-500"
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
                        className="h-6 w-6 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        title="Delete question"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                      </button>
                    )}

                    <MoreVertOutlinedIcon
                      sx={{ fontSize: 16, color: active ? "#0284c7" : "#94a3b8" }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing 1 to {filteredQuestions.length} of {questions.length} questions
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition"
          >
            <ChevronLeftOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            type="button"
            className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition"
          >
            <ChevronRightOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionListCard;
