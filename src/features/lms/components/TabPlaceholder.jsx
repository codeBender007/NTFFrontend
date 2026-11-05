import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";

const TabPlaceholder = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md px-6 py-20 text-center shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] shadow-xs">
        <ConstructionOutlinedIcon sx={{ fontSize: 26, color: "#0d9488" }} />
      </div>

      <h2 className="text-base font-bold text-[#0f172a]">{title}</h2>
      <p className="mt-1 max-w-md text-xs text-[#64748b]">
        {description || "This module is under development."}
      </p>
    </div>
  );
};

export default TabPlaceholder;