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
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-4 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          Sections <span className="text-gray-400 font-normal text-xs">({sections.length})</span>
        </h2>

        <button
          type="button"
          onClick={onAddSection}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 hover:border-primary/50 transition"
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
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all group ${
                active
                  ? "bg-primary/[0.06] border-primary/30 border-l-4 border-l-primary shadow-xs"
                  : "bg-white border-gray-200/80 hover:border-primary/30 hover:bg-gray-50/60"
              }`}
            >
              {/* Drag Handle */}
              <DragIndicatorOutlinedIcon
                sx={{ fontSize: 18, color: active ? "#6F4AE7" : "#9CA3AF" }}
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
                    className="w-full h-8 rounded-lg border border-primary/40 bg-white px-2.5 text-xs font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                ) : (
                  <>
                    <h3
                      className={`text-xs font-bold truncate leading-tight ${
                        active ? "text-primary" : "text-gray-900"
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
                  className="h-7 w-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center shrink-0 transition"
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
                  className="h-7 w-7 rounded-lg text-gray-300 hover:text-primary hover:bg-primary/10 flex items-center justify-center shrink-0 transition opacity-60 group-hover:opacity-100"
                  title="Edit section name"
                >
                  <EditOutlinedIcon sx={{ fontSize: 15 }} />
                </button>
              )}

              {/* Questions Count Badge */}
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                  active
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary group-hover:bg-primary/20"
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
                  className="h-7 w-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0 transition opacity-60 group-hover:opacity-100"
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
