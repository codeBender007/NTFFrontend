import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";

const inputClass =
  "w-full h-10 rounded-xl border border-[#e2edf2] px-3 text-sm outline-none bg-gray-50/50 focus:bg-white focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15 text-[#0f172a] transition";

const labelClass = "block text-xs font-semibold text-[#64748b] mb-1.5";

const QuestionSettings = ({ question, onChange, onPublish }) => {
  if (!question) return null;

  const { options, correctOption } = question;

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] h-full flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e2edf2] flex items-center gap-2.5">
        <h2 className="text-sm font-bold text-[#0f172a]">Question Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label className={labelClass}>Correct Answer</label>
          <select
            className={inputClass}
            value={correctOption ?? ""}
            onChange={(e) =>
              onChange({
                correctOption: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}. {o.value || `Option ${o.label}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Marks</label>
          <input
            type="number"
            value={question.marks}
            onChange={(e) => onChange({ marks: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="border-t border-[#e2edf2] p-4 flex gap-3 bg-[#f8fafc]">
        <button
          onClick={onPublish}
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] text-white font-semibold text-sm shadow-sm shadow-[#0d9488]/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <PublishOutlinedIcon sx={{ fontSize: 18 }} />
          Publish
        </button>
      </div>
    </div>
  );
};

export default QuestionSettings;
