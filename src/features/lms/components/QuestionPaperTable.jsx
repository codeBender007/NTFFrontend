import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Filters from "../../../components/Filters";
import { getSavedPapers } from "../utils/testPapers";

const QuestionPaperTable = ({ onCreate }) => {
  const navigate = useNavigate();
  const [rows] = useState(() => getSavedPapers());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const from = rows.length === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(rows.length, (page + 1) * rowsPerPage);

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-[#e2edf2]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 flex items-center justify-center text-[#0d9488] shadow-xs">
            <DescriptionOutlinedIcon sx={{ color: "#0d9488", fontSize: 20 }} />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0f172a] leading-tight">
              Test Papers
            </h2>
            <p className="text-xs text-[#64748b]">
              Browse and manage test papers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] px-4 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition-all">
          <AddOutlinedIcon sx={{ fontSize: 18 }} />
          Create Test Paper
        </button>
      </div>

      <div className="px-5 pb-4 pt-4">
        <Filters />
      </div>

      <div className="px-5 pb-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-gray-100/80">
                  {[
                    "Test Paper Title",
                    "Target / Standard",
                    "Test Type",
                    "Course / Module",
                    "Passing Criteria",
                    "Total Marks",
                    "Preview",
                  ].map((head) => (
                    <th
                      key={head}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-r border-gray-200 ${head === "Preview" ? "text-center" : "text-left"
                        }`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      No test papers found
                    </td>
                  </tr>
                )}

                {displayedRows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={`whitespace-nowrap transition hover:bg-[#F7F7F5] ${rowIdx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                      }`}
                  >
                    <td className="px-4 py-3">
                      <p className="max-w-[210px] text-xs font-medium text-gray-500 leading-4">
                        {row.title}
                      </p>
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100">
                      <p className="max-w-[100px] text-xs leading-4 text-gray-500">
                        {row.target}
                      </p>
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100">
                      <span className="text-xs font-semibold text-[#0f172a]">
                        {row.testType}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500 border-b border-r border-gray-100">
                      {row.course}
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[95px] text-xs text-gray-500">
                          {row.passing}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100">
                      <p className="text-xs font-medium text-gray-500">
                        {row.marks}
                      </p>
                      <p className="text-[11px] font-medium text-emerald-500">
                        {row.fullMarks}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-center border-b border-gray-100">
                      <button
                        type="button"
                        onClick={() => navigate(`/lms/paper/preview/${row.id}`)}
                        title="Preview paper"
                        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#e2edf2] bg-white px-3 text-[11px] font-semibold text-[#0f172a] transition hover:border-[#0d9488] hover:text-[#0d9488] hover:bg-[#f0f9f8] shadow-xs"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex min-h-[48px] items-center justify-between gap-2 border-t border-[#e2edf2] px-2">
            <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
              <span>Rows per page</span>

              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="cursor-pointer rounded-lg border border-[#e2edf2] bg-white py-1 pl-2 pr-6 text-[11px] text-[#0f172a] outline-none focus:border-[#0d9488]"
              >
                {[10, 25, 50].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B7280]">
                {from}-{to} of {rows.length}
              </span>

              <button
                type="button"
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
              </button>

              <button
                type="button"
                onClick={() => handleChangePage(null, page + 1)}
                disabled={page >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperTable;