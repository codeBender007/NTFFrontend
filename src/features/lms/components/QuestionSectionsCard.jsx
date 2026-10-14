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
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden p-4 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-1.5">
          Sections <span className="text-[#64748b] font-normal text-xs">({sections.length})</span>
        </h2>

        <button
          type="button"
          onClick={onAddSection}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-xl border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488] text-xs font-semibold hover:bg-[#d5f2ee] transition shadow-xs"
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
                  ? "bg-[#e6f7f5]/40 border-[#0d9488] border-l-4 border-l-[#0d9488] shadow-xs"
                  : "bg-white border-[#e2edf2] hover:border-[#0d9488]/40 hover:bg-[#f0f9f8]"
              }`}
            >
              {/* Drag Handle */}
              <DragIndicatorOutlinedIcon
                sx={{ fontSize: 18, color: active ? "#0d9488" : "#8A8A8A" }}
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
                    className="w-full h-8 rounded-lg border border-[#e2edf2] bg-white px-2.5 text-xs font-bold text-[#0f172a] outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15"
                  />
                ) : (
                  <>
                    <h3
                      className={`text-xs font-bold truncate leading-tight ${
                        active ? "text-[#0d9488]" : "text-[#0f172a]"
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
                  className="h-7 w-7 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] text-white flex items-center justify-center shrink-0 transition"
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
                  className="h-7 w-7 rounded-lg text-gray-400 hover:text-[#0d9488] hover:bg-[#e6f7f5] flex items-center justify-center shrink-0 transition opacity-60 group-hover:opacity-100"
                  title="Edit section name"
                >
                  <EditOutlinedIcon sx={{ fontSize: 15 }} />
                </button>
              )}

              {/* Questions Count Badge */}
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                  active
                    ? "bg-[#0d9488] text-white"
                    : "bg-[#e6f7f5] text-[#0d9488] group-hover:bg-[#d5f2ee]"
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
