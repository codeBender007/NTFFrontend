import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import logo from "../../../assets/images/NTF_logo_black.png";

const TopActions = ({
  title = "Question Paper",

  onPreview,
  onSave,
}) => {
  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] px-4 sm:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all">
      {/* Left Branding & Title */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-12 w-12 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 flex items-center justify-center shrink-0 p-1.5 shadow-xs">
          <img src={logo} alt="NTF Logo" className="h-full w-full object-contain" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-[#0f172a] leading-tight truncate">
              {title}
            </h2>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5 truncate">
            NTF Skill Evaluation & Assessment Management
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onPreview}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-[#e2edf2] bg-white px-4 text-xs font-semibold text-[#0f172a] hover:bg-[#f0f9f8] hover:border-[#0d9488] hover:text-[#0d9488] transition shadow-xs"
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
          Preview Paper
        </button>

        <button
          type="button"
          onClick={onSave}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 hover:from-[#0f766e] hover:to-[#0d9488] active:scale-[0.98] transition"
        >
          <SaveOutlinedIcon sx={{ fontSize: 17 }} />
          Save Paper
        </button>
      </div>
    </div>
  );
};

export default TopActions;

