import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Filters from "../../../components/Filters";
import QuestionPaperApi, {
  getApiErrorMessage,
  mapApiResponseToPaper,
} from "../services/QuestionPaperApi";

const QuestionPaperTable = ({
  onCreate,
  onView,
  onEdit,
  onDelete,
  customRows,
  title,
  subtitle,
}) => {
  const navigate = useNavigate();
  const isControlled = Array.isArray(customRows);

  const [rows, setRows] = useState(() => (isControlled ? customRows : []));
  const [loading, setLoading] = useState(!isControlled);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPapers = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await QuestionPaperApi.getQuestionPapers(
        {},
        signal ? { signal } : {}
      );
      const list = Array.isArray(response.data) ? response.data : [];
      const mapped = list.map(mapApiResponseToPaper).filter(Boolean);
      setRows(mapped);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return;
      }
      setError(
        getApiErrorMessage(err, "Failed to load question papers from server.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isControlled) {
      setRows(customRows);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    fetchPapers(controller.signal);
    return () => controller.abort();
  }, [isControlled, customRows, fetchPapers]);

  const handleDeleteRow = async (paper) => {
    if (!paper?.id) return;

    if (onDelete) {
      onDelete(paper);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${paper.title || "this question paper"}"?`
    );
    if (!confirmed) return;

    setDeletingId(paper.id);
    setError(null);
    try {
      await QuestionPaperApi.deleteQuestionPaper(paper.id);
      setRows((prev) => prev.filter((p) => p.id !== paper.id));
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to delete question paper. Please try again.")
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditRow = (paper) => {
    if (onEdit) {
      onEdit(paper);
    } else if (paper?.id != null) {
      navigate(`/lms/paper/edit/${paper.id}`);
    }
  };

  const handleViewRow = (paper) => {
    if (onView) {
      onView(paper);
    } else if (paper?.id != null) {
      navigate(`/lms/paper/preview/${paper.id}`);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter((row) => {
    const raw = row?.raw || {};
    const meta = row?.meta || {};

    if (filterValues.plant) {
      const f = String(filterValues.plant).toLowerCase();
      const match =
        String(raw.plant_id ?? meta.plantId ?? "").toLowerCase() === f ||
        String(raw.plant_name ?? meta.plantName ?? "").toLowerCase() === f;
      if (!match) return false;
    }

    if (filterValues.department) {
      const f = String(filterValues.department).toLowerCase();
      const match =
        String(raw.department_id ?? meta.departmentId ?? "").toLowerCase() === f ||
        String(raw.department_name ?? meta.departments ?? row.course ?? "")
          .toLowerCase() === f;
      if (!match) return false;
    }

    if (filterValues.subDepartment) {
      const f = String(filterValues.subDepartment).toLowerCase();
      const match =
        String(raw.sub_department_id ?? meta.subDepartmentId ?? "").toLowerCase() === f ||
        String(raw.sub_department_name ?? meta.sections ?? "").toLowerCase() === f;
      if (!match) return false;
    }

    if (filterValues.line) {
      const f = String(filterValues.line).toLowerCase();
      const match =
        String(raw.line_id ?? meta.lineId ?? "").toLowerCase() === f ||
        String(raw.line_name ?? meta.lines ?? "").toLowerCase() === f;
      if (!match) return false;
    }

    if (filterValues.machine) {
      const f = String(filterValues.machine).toLowerCase();
      const match =
        String(raw.machine_id ?? meta.machineId ?? "").toLowerCase() === f ||
        String(raw.machine_name ?? meta.machines ?? "").toLowerCase() === f;
      if (!match) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const displayedRows = filteredRows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage
  );

  const from = filteredRows.length === 0 ? 0 : safePage * rowsPerPage + 1;
  const to = Math.min(filteredRows.length, (safePage + 1) * rowsPerPage);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] shadow-xs">
            <DescriptionOutlinedIcon sx={{ color: "#0284c7", fontSize: 20 }} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {title || "Test Papers"}
            </h2>
            <p className="text-xs text-slate-500">
              {subtitle || "Browse and manage test papers"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isControlled && (
            <button
              type="button"
              onClick={() => fetchPapers()}
              disabled={loading}
              title="Refresh test papers"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshOutlinedIcon
                sx={{ fontSize: 16 }}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          )}

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-4 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <AddOutlinedIcon sx={{ fontSize: 18 }} />
            Create Test Paper
          </button>
        </div>
      </div>

      <div className="px-5 pb-4 pt-4">
        <Filters
          values={filterValues}
          onChange={(vals) => {
            setFilterValues(vals);
            setPage(0);
          }}
          onResetFilters={() => {
            setFilterValues({});
            setPage(0);
          }}
        />
      </div>

      {error && (
        <div className="mx-5 mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            <span>{error}</span>
          </div>
          {!isControlled && (
            <button
              type="button"
              onClick={() => fetchPapers()}
              className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-[11px] font-semibold transition cursor-pointer shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}

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
                    "Action",
                  ].map((head) => (
                    <th
                      key={head}
                      className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white border-r border-[#153e7e] ${
                        head === "Preview" || head === "Action" ? "text-center" : "text-left"
                      }`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-xs font-medium text-slate-500"
                    >
                      <div className="inline-flex items-center gap-2.5">
                        <span className="h-4 w-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                        <span>Loading question papers...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && displayedRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-400"
                    >
                      No test papers found
                    </td>
                  </tr>
                )}

                {!loading &&
                  displayedRows.map((row, rowIdx) => {
                    const isDeleting = deletingId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`whitespace-nowrap transition hover:bg-slate-50 border-b border-slate-100 ${
                          rowIdx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                        } ${isDeleting ? "opacity-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="max-w-[210px] truncate text-xs font-medium text-slate-800 leading-4">
                            {row.title}
                          </p>
                        </td>

                        <td className="px-4 py-3 border-r border-slate-100">
                          <p className="max-w-[120px] truncate text-xs leading-4 text-slate-600">
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
                            <span className="max-w-[110px] truncate text-xs text-slate-600">
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

                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleViewRow(row)}
                            disabled={isDeleting}
                            title="Preview paper"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-sky-50/50 shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                            Preview
                          </button>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditRow(row)}
                              disabled={isDeleting}
                              title="Edit question paper"
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row)}
                              disabled={isDeleting}
                              title="Delete question paper"
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                              {isDeleting ? (
                                <span className="block h-4 w-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                              ) : (
                                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                {from}-{to} of {filteredRows.length}
              </span>

              <button
                type="button"
                onClick={() => handleChangePage(null, safePage - 1)}
                disabled={safePage === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
              </button>

              <button
                type="button"
                onClick={() => handleChangePage(null, safePage + 1)}
                disabled={safePage >= totalPages - 1}
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
