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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-5">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center shadow-sm">
              <ClipboardList size={20} className="text-white" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Add New Requirement
              </h2>
              <p className="text-xs text-gray-500">
                Create a new manpower requirement for a section
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Building2 size={15} className="text-primary" />
              </div>

              <h3 className="font-semibold text-primary uppercase text-xs">
                Section Details
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <div>
                <label className="text-xs text-gray-600">Department</label>
                <select className="mt-1.5 w-full border border-gray-200 rounded-lg h-8 px-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                  <option>Select Department</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Sub Department</label>

                <select className="mt-1.5 w-full border border-gray-200 rounded-lg h-8 px-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                  <option>Select Sub Department</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Line</label>

                <select className="mt-1.5 w-full border border-gray-200 rounded-lg h-8 px-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                  <option>Select Line</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Shift</label>

                <select className="mt-1.5 w-full border border-gray-200 rounded-lg h-8 px-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                  <option>Select Shift</option>
                </select>
              </div>
            </div>

            <div className="mt-2.5">
              <label className="text-xs text-gray-600">Section Name</label>

              <input
                placeholder="Enter Section Name"
                className="mt-1.5 h-8 text-sm border border-gray-200 rounded-lg px-2.5 w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <ClipboardList size={15} className="text-primary" />
                </div>

                <h3 className="uppercase text-xs font-semibold text-primary">
                  Requirement Details
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {["PP", "SP", "FN01", "FN02"].map((item) => (
                <div key={item}>
                  <label className="block text-center text-gray-700 mb-1.5 font-medium text-sm">
                    {item}
                  </label>

                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full h-8 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Bell size={15} className="text-primary" />
              </div>

              <h3 className="uppercase text-xs font-semibold text-primary">
                Notification Details
              </h3>
            </div>

            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-4">
                <label className="text-xs text-gray-600">Recipient Name</label>

                <input
                  className="mt-1.5 w-full h-8 text-sm border border-gray-200 rounded-lg px-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Recipient Name"
                />
              </div>

              <div className="col-span-5">
                <label className="text-xs text-gray-600">Email Address</label>

                <input
                  className="mt-1.5 w-full h-8 text-sm border border-gray-200 rounded-lg px-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Email Address"
                />
              </div>

              <div className="col-span-3 flex items-end">
                <button className="w-full h-8 text-sm border border-primary text-primary rounded-lg flex justify-center items-center gap-1.5 hover:bg-primary/5">
                  <Plus size={15} />
                  Add Recipient
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={onClose}
            className="px-5 h-9 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition"
          >
            Cancel
          </button>

          <button className="px-5 h-9 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm hover:opacity-95 transition flex items-center gap-2">
            <Save size={15} />
            Save Requirement
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementPopup;
