import {
  X,
  ClipboardList,
  Building2,
  Bell,
  Plus,
  Save,
} from "lucide-react";

const RequirementPopup = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-5">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#e2edf2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] flex items-center justify-center shadow-xs">
              <ClipboardList size={20} className="text-[#0d9488]" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#0f172a] leading-tight">
                Add New Requirement
              </h2>
              <p className="text-xs text-[#64748b]">
                Create a new manpower requirement for a section
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-[#e2edf2] flex items-center justify-center text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="bg-[#e6f7f5] p-1.5 rounded-lg text-[#0d9488]">
                <Building2 size={15} />
              </div>

              <h3 className="font-semibold text-[#0f172a] uppercase text-xs tracking-wide">
                Section Details
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <div>
                <label className="text-xs text-[#64748b]">Department</label>
                <select className="mt-1.5 w-full border border-[#e2edf2] rounded-xl h-9 px-2.5 text-xs text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white">
                  <option>Select Department</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#64748b]">Sub Department</label>
                <select className="mt-1.5 w-full border border-[#e2edf2] rounded-xl h-9 px-2.5 text-xs text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white">
                  <option>Select Sub Department</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#64748b]">Line</label>
                <select className="mt-1.5 w-full border border-[#e2edf2] rounded-xl h-9 px-2.5 text-xs text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white">
                  <option>Select Line</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#64748b]">Shift</label>
                <select className="mt-1.5 w-full border border-[#e2edf2] rounded-xl h-9 px-2.5 text-xs text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white">
                  <option>Select Shift</option>
                </select>
              </div>
            </div>

            <div className="mt-2.5">
              <label className="text-xs text-[#64748b]">Section Name</label>
              <input
                placeholder="Enter Section Name"
                className="mt-1.5 h-9 text-xs border border-[#e2edf2] rounded-xl px-2.5 w-full text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <div className="bg-[#e6f7f5] p-1.5 rounded-lg text-[#0d9488]">
                  <ClipboardList size={15} />
                </div>

                <h3 className="uppercase text-xs font-semibold text-[#0f172a] tracking-wide">
                  Requirement Details
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {["PP", "SP", "FN01", "FN02"].map((item) => (
                <div key={item}>
                  <label className="block text-center text-[#0f172a] mb-1.5 font-medium text-xs">
                    {item}
                  </label>

                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full h-9 text-xs border border-[#e2edf2] rounded-xl text-center text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="bg-[#e6f7f5] p-1.5 rounded-lg text-[#0d9488]">
                <Bell size={15} />
              </div>

              <h3 className="uppercase text-xs font-semibold text-[#0f172a] tracking-wide">
                Notification Details
              </h3>
            </div>

            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-4">
                <label className="text-xs text-[#64748b]">Recipient Name</label>
                <input
                  className="mt-1.5 w-full h-9 text-xs border border-[#e2edf2] rounded-xl px-2.5 text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white placeholder:text-[#94a3b8]"
                  placeholder="Recipient Name"
                />
              </div>

              <div className="col-span-5">
                <label className="text-xs text-[#64748b]">Email Address</label>
                <input
                  className="mt-1.5 w-full h-9 text-xs border border-[#e2edf2] rounded-xl px-2.5 text-[#0f172a] focus:ring-2 focus:ring-[#0d9488]/15 focus:border-[#0d9488] outline-none bg-white placeholder:text-[#94a3b8]"
                  placeholder="Email Address"
                />
              </div>

              <div className="col-span-3 flex items-end">
                <button className="w-full h-9 text-xs border border-[#0d9488]/20 bg-[#e6f7f5] text-[#0d9488] rounded-xl flex justify-center items-center gap-1.5 hover:bg-[#d5f2ee] transition font-medium">
                  <Plus size={14} />
                  Add Recipient
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t border-[#e2edf2] bg-[#f8fafc] shrink-0">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-xl text-xs font-semibold border border-[#e2edf2] bg-white text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] transition"
          >
            Cancel
          </button>

          <button className="px-4 h-9 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] text-white shadow-sm shadow-[#0d9488]/25 transition flex items-center gap-1.5">
            <Save size={14} />
            Save Requirement
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementPopup;
