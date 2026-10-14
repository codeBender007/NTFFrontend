// import { useNavigate } from "react-router-dom";
// import { Plus, Pencil, Trash2, Layers3 } from "lucide-react";

// const LinesTable = ({
//   deptId,
//   sectionId,
//   lines = [],
//   onAddLine,
//   onEditLine,
//   onDeleteLine,
// }) => {
//   const navigate = useNavigate();

//   // Counts loader/monitor/operator values, falling back to the line fields.
//   const getLineStats = (line) => {
//     const subSections = Array.isArray(line.subSections) ? line.subSections : [];

//     const subSectionMachines = subSections.flatMap((subSection) =>
//       Array.isArray(subSection.machines) ? subSection.machines : [],
//     );

//     const machines = [
//       ...(Array.isArray(line.machines) ? line.machines : []),
//       ...subSectionMachines,
//     ];

//     return {
//       loader:
//         line.loader ??
//         machines.filter(
//           (machine) => machine?.type?.toLowerCase() === "loader",
//         ).length,

//       monitor:
//         line.monitor ??
//         machines.filter(
//           (machine) => machine?.type?.toLowerCase() === "monitor",
//         ).length,

//       requirements: line.requirements ?? 0,

//       operators:
//         line.operators ??
//         machines.reduce(
//           (total, machine) => total + (Number(machine?.operators) || 0),
//           0,
//         ),
//     };
//   };

//   const handleLineClick = (line, index) => {
//     if (!deptId || !sectionId) return;

//     const lineId = line?.id ?? index;

//     navigate(`/lms/machine/${deptId}/${sectionId}/${lineId}`);
//   };

//   return (
//     <div className="overflow-hidden rounded-[14px] border border-[#e3e6eb] bg-white">
//       {/* HEADER */}

//       <div className="flex flex-col gap-3 border-b border-[#edf0f3] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
//         <div>
//           <h4 className="text-[13px] font-bold text-[#26364d]">
//             Lines in this Section
//           </h4>

//           <p className="mt-0.5 text-xs text-[#718096]">
//             {lines.length} line{lines.length !== 1 ? "s" : ""} assigned to
//             this section
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onAddLine}
//           className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#6c4ce8] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5937d1] sm:w-auto"
//         >
//           <Plus size={14} />
//           Add Line
//         </button>
//       </div>

//       {/* TABLE */}

//       <div className="overflow-x-auto">
//         <table className="w-full min-w-[700px] border-collapse">
//           <thead>
//             <tr className="bg-[#f5f6f8]">
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Line Name
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 UniCode
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Line Leaders
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Mentor
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Requirement
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Description
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Loader
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Monitor
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Operators
//               </th>
//               <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {lines.length === 0 ? (
//               <tr>
//                 <td colSpan={10} className="p-0">
//                   <div className="flex flex-col items-center justify-center py-12 text-[#9aa3af]">
//                     <Layers3 size={26} className="mb-2 text-[#9aa3af]" />

//                     <p className="text-[14px] font-medium text-[#718096]">
//                       No lines assigned to this section.
//                     </p>

//                     <button
//                       type="button"
//                       onClick={onAddLine}
//                       className="mt-2 text-xs font-semibold text-[#6c4ce8] hover:underline"
//                     >
//                       + Add your first line
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               lines.map((line, index) => {
//                 const stats = getLineStats(line);

//                 // Combine ids with the index to guarantee a unique key
//                 // (line ids can currently be duplicated in the data).
//                 const lineKey = `${deptId ?? "dept"}-${sectionId ?? "section"}-${
//                   line?.id ?? "line"
//                 }-${index}`;

//                 return (
//                   <tr
//                     key={lineKey}
//                     className="border-b border-[#edf0f2] bg-white last:border-0 hover:bg-[#fafaff]"
//                   >
//                     <td className="px-3 py-3 sm:px-4">
//                       <button
//                         type="button"
//                         onClick={() => handleLineClick(line, index)}
//                         className="text-left text-[14px] font-semibold text-[#344760] underline-offset-2 transition-colors duration-200 hover:text-[#6c4ce8] hover:underline"
//                       >
//                         {line?.name || `Line ${index + 1}`}
//                       </button>
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       {line?.code || "—"}
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       <p className="max-w-[140px] truncate text-[13px] leading-5 text-[#44556c]">
//                         {line?.leaders || "—"}
//                       </p>
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       <p className="max-w-[140px] truncate text-[13px] leading-5 text-[#44556c]">
//                         {line?.mentor || "—"}
//                       </p>
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       <p className="max-w-[140px] truncate text-[13px] leading-5 text-[#44556c]">
//                         {line?.requirement || "—"}
//                       </p>
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       <p className="max-w-[160px] truncate text-[13px] leading-5 text-[#718096]">
//                         {line?.description || "—"}
//                       </p>
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       {stats.loader}
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       {stats.monitor}
//                     </td>

//                     <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
//                       {stats.operators}
//                     </td>

//                     <td className="px-3 py-3 sm:px-4">
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() => onEditLine?.(line)}
//                           className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#f0ecff] text-[#6c4ce8] transition hover:bg-[#e6dfff]"
//                           title="Edit Line"
//                         >
//                           <Pencil size={15} />
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => onDeleteLine?.(line)}
//                           className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#fff0ee] text-[#e74c3c] transition hover:bg-[#ffe3df]"
//                           title="Delete Line"
//                         >
//                           <Trash2 size={15} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* FOOTER */}

//       {lines.length > 0 && (
//         <div className="flex flex-col gap-1.5 border-t border-[#edf0f3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
//           <p className="text-xs text-[#718096]">
//             Total Lines:{" "}
//             <span className="font-semibold text-green-600">{lines.length}</span>
//           </p>

//           <p className="text-xs text-green-600">
//             All lines are assigned to this section
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LinesTable;

import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Layers3 } from "lucide-react";

const LinesTable = ({
  deptId,
  subDeptId,
  sectionId,
  lines = [],
  onAddLine,
  onEditLine,
  onDeleteLine,
}) => {
  const navigate = useNavigate();

  // Counts loader/monitor/operator values, falling back to the line fields.
  const getLineStats = (line) => {
    const machines = Array.isArray(line.machines) ? line.machines : [];

    return {
      loader:
        line.loader ??
        machines.filter((machine) => machine?.type?.toLowerCase() === "loader")
          .length,

      monitor:
        line.monitor ??
        machines.filter((machine) => machine?.type?.toLowerCase() === "monitor")
          .length,

      requirements: line.requirements ?? 0,

      operators:
        line.operators ??
        machines.reduce(
          (total, machine) => total + (Number(machine?.operators) || 0),
          0,
        ),
    };
  };

  const handleLineClick = (line, index) => {
    if (!deptId || !subDeptId || !sectionId) return;

    const lineId = line?.id ?? index;

    navigate(`/lms/machine/${deptId}/${subDeptId}/${sectionId}/${lineId}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(15,23,42,0.03)]">
      {/* HEADER */}

      <div className="flex flex-col gap-3 border-b border-[#e2edf2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-[18px]">
        <div>
          <h4 className="text-[13px] font-bold text-[#0f172a]">
            Lines in this Section
          </h4>

          <p className="mt-0.5 text-xs text-[#64748b]">
            {lines.length} line{lines.length !== 1 ? "s" : ""} assigned to this
            section
          </p>
        </div>

        <button
          type="button"
          onClick={onAddLine}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all sm:w-auto"
        >
          <Plus size={14} />
          Add Line
        </button>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="bg-[#f5f6f8]">
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Line Name
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                UniCode
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Line Leaders
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Mentor
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Requirement
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Description
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Loader
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Monitor
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Operators
              </th>
              <th className="border-r border-[#e1e4e8] px-3 py-3 text-left text-[12px] font-bold uppercase text-[#3b4b62] last:border-r-0 sm:px-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-0">
                  <div className="flex flex-col items-center justify-center py-12 text-[#9aa3af]">
                    <Layers3 size={26} className="mb-2 text-[#9aa3af]" />

                    <p className="text-[14px] font-medium text-[#718096]">
                      No lines assigned to this section.
                    </p>

                    <button
                      type="button"
                      onClick={onAddLine}
                      className="mt-2 text-xs font-semibold text-[#0d9488] hover:underline"
                    >
                      + Add your first line
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              lines.map((line, index) => {
                const stats = getLineStats(line);

                // Combine ids with the index to guarantee a unique key
                // (line ids can currently be duplicated in the data).
                const lineKey = `${deptId ?? "dept"}-${subDeptId ?? "subdept"}-${sectionId ?? "section"
                  }-${line?.id ?? "line"}-${index}`;

                return (
                  <tr
                    key={lineKey}
                    className="border-b border-[#edf0f2] bg-white last:border-0 hover:bg-[#F7F7F5]"
                  >
                    <td className="px-3 py-3 sm:px-4">
                      <button
                        type="button"
                        onClick={() => handleLineClick(line, index)}
                        className="text-left text-[14px] font-semibold text-[#0f172a] underline-offset-2 transition-colors duration-200 hover:text-[#0d9488] hover:underline"
                      >
                        {line?.name || `Line ${index + 1}`}
                      </button>
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      {line?.code || "—"}
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      <p className="max-w-[140px] truncate text-[13px] leading-5 text-[#44556c]">
                        {line?.leaders || "—"}
                      </p>
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      <p className="max-w-[140px] truncate text-[13px] leading-5 text-[#44556c]">
                        {line?.mentor || "—"}
                      </p>
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      <p className="max-w-[140px] truncate text-[13px] leading-5 text-[#44556c]">
                        {line?.requirement || "—"}
                      </p>
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      <p className="max-w-[160px] truncate text-[13px] leading-5 text-[#718096]">
                        {line?.description || "—"}
                      </p>
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      {stats.loader}
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      {stats.monitor}
                    </td>

                    <td className="border-r border-[#edf0f2] px-3 py-3 text-[14px] text-[#44556c] last:border-r-0 sm:px-4">
                      {stats.operators}
                    </td>

                    <td className="px-3 py-3 sm:px-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEditLine?.(line)}
                          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[#e2edf2] bg-[#f8fafc] text-[#0f172a] transition hover:bg-[#e6f7f5] hover:text-[#0d9488]"
                          title="Edit Line"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteLine?.(line)}
                          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#fff0ee] text-[#e74c3c] transition hover:bg-[#ffe3df]"
                          title="Delete Line"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}

      {lines.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-[#edf0f3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-[#718096]">
            Total Lines:{" "}
            <span className="font-semibold text-green-600">{lines.length}</span>
          </p>

          <p className="text-xs text-green-600">
            All lines are assigned to this section
          </p>
        </div>
      )}
    </div>
  );
};

export default LinesTable;
