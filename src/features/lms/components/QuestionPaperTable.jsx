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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] shadow-xs">
            <DescriptionOutlinedIcon sx={{ color: "#0284c7", fontSize: 20 }} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Test Papers
            </h2>
            <p className="text-xs text-slate-500">
              Browse and manage test papers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <AddOutlinedIcon sx={{ fontSize: 18 }} />
          Create Test Paper
        </button>
      </div>

      <div className="px-5 pb-4 pt-4">
        <Filters />
      </div>

      <div className="px-5 pb-5">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-[#0b295c] text-white">
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
                      className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white border-r border-[#153e7e] ${
                        head === "Preview" ? "text-center" : "text-left"
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
                      className="px-4 py-12 text-center text-sm text-slate-400"
                    >
                      No test papers found
                    </td>
                  </tr>
                )}

                {displayedRows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={`whitespace-nowrap transition hover:bg-slate-50 border-b border-slate-100 ${
                      rowIdx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="max-w-[210px] text-xs font-medium text-slate-800 leading-4">
                        {row.title}
                      </p>
                    </td>

                    <td className="px-4 py-3 border-r border-slate-100">
                      <p className="max-w-[100px] text-xs leading-4 text-slate-600">
                        {row.target}
                      </p>
                    </td>

                    <td className="px-4 py-3 border-r border-slate-100">
                      <span className="text-xs font-semibold text-slate-900">
                        {row.testType}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">
                      {row.course}
                    </td>

                    <td className="px-4 py-3 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[95px] text-xs text-slate-600">
                          {row.passing}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 border-r border-slate-100">
                      <p className="text-xs font-medium text-slate-700">
                        {row.marks}
                      </p>
                      <p className="text-[11px] font-medium text-emerald-600">
                        {row.fullMarks}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/lms/paper/preview/${row.id}`)}
                        title="Preview paper"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-sky-50/50 shadow-xs"
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

          <div className="flex min-h-[48px] items-center justify-between gap-2 border-t border-slate-200/80 px-4 py-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Rows per page</span>

              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-6 text-[11px] text-slate-700 outline-none focus:border-[#0284c7]"
              >
                {[10, 25, 50].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {from}-{to} of {rows.length}
              </span>

              <button
                type="button"
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
              </button>

              <button
                type="button"
                onClick={() => handleChangePage(null, page + 1)}
                disabled={page >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40"
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
