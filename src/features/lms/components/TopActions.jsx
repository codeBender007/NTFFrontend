import React from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import logo from "../../../assets/images/NTF_logo_black.png";

const TopActions = ({
  title = "Question Paper",
  onPreview,
  onSave,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs px-4 sm:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all">
      {/* Left Branding & Title */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-11 w-11 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center shrink-0 p-1.5 shadow-xs">
          <img src={logo} alt="NTF Logo" className="h-full w-full object-contain" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              {title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            NTF Skill Evaluation & Assessment Management
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onPreview}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-sky-50/50 transition shadow-xs"
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
          Preview Paper
        </button>

        <button
          type="button"
          onClick={onSave}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 text-xs font-semibold text-white shadow-xs transition"
        >
          <SaveOutlinedIcon sx={{ fontSize: 17 }} />
          Save Paper
        </button>
      </div>
    </div>
  );
};

export default TopActions;
