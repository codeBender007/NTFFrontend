import { useEffect, useRef, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const QuestionSectionsCard = ({
  sections = [],
  selectedSection,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onRenameSection,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const startEdit = (e, section) => {
    e.stopPropagation();
    setEditingId(section.id);
    setDraft(section.name || "");
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    const trimmed = draft.trim();
    if (trimmed && onRenameSection) onRenameSection(editingId, trimmed);
    setEditingId(null);
    setDraft("");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden p-4 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          Sections <span className="text-slate-500 font-normal text-xs">({sections.length})</span>
        </h2>

        <button
          type="button"
          onClick={onAddSection}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-sky-200/80 bg-sky-50 text-[#0284c7] text-xs font-semibold hover:bg-sky-100 transition shadow-xs"
        >
          <AddOutlinedIcon sx={{ fontSize: 16 }} />
          Add Section
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-2.5">
        {sections.map((section, idx) => {
          const active = selectedSection === section.id;
          const qCount = section.questions?.length || 0;

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all group ${
                active
                  ? "bg-sky-50/70 border-sky-500 border-l-4 border-l-[#0284c7] shadow-xs"
                  : "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50"
              }`}
            >
              {/* Drag Handle */}
              <DragIndicatorOutlinedIcon
                sx={{ fontSize: 18, color: active ? "#0284c7" : "#94a3b8" }}
                className="shrink-0"
              />

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                {editingId === section.id ? (
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") saveEdit(e);
                      if (e.key === "Escape") cancelEdit(e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/15"
                  />
                ) : (
                  <>
                    <h3
                      className={`text-xs font-bold truncate leading-tight ${
                        active ? "text-[#0284c7]" : "text-slate-900"
                      }`}
                    >
                      {section.name || `Section ${String.fromCharCode(65 + idx)}`}
                    </h3>
                  </>
                )}
              </div>

              {/* Inline Save / Cancel */}
              {editingId === section.id && (
                <button
                  type="button"
                  onClick={saveEdit}
                  className="h-7 w-7 rounded-lg bg-[#0b295c] hover:bg-[#082046] text-white flex items-center justify-center shrink-0 transition"
                  title="Save section name"
                >
                  <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                </button>
              )}

              {/* Edit Section Name */}
              {editingId !== section.id && (
                <button
                  type="button"
                  onClick={(e) => startEdit(e, section)}
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-[#0284c7] hover:bg-sky-50 flex items-center justify-center shrink-0 transition opacity-60 group-hover:opacity-100"
                  title="Edit section name"
                >
                  <EditOutlinedIcon sx={{ fontSize: 15 }} />
                </button>
              )}

              {/* Questions Count Badge */}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                  active
                    ? "bg-[#0284c7] text-white"
                    : "bg-sky-50 text-[#0284c7] border border-sky-200/80 group-hover:bg-sky-100"
                }`}
              >
                {qCount} {qCount === 1 ? "Q" : "Qs"}
              </span>

              {/* Delete / Actions */}
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  className="h-7 w-7 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0 transition opacity-60 group-hover:opacity-100"
                  title="Delete section"
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionSectionsCard;
