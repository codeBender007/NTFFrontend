import { useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RequirementPopup from "./RequirementPopup";

const requirementData = [
  {
    id: 1,
    code: "D01-1",
    sectionName: "D&D",
    lineDescription: "Engineering",
    approval: "System Approved",

    jan: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    feb: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    mar: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    apr: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    may: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    jun: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    jul: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    aug: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    sep: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    oct: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    nov: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    dec: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
  },

  {
    id: 2,
    code: "D01-2",
    sectionName: "D&D",
    lineDescription: "Drafting",
    approval: "Pending",

    jan: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    feb: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    mar: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    apr: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    may: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    jun: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    jul: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    aug: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    sep: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
    oct: { pp: 1, sp: 3, fn01: 1, fn02: 1 },
    nov: { pp: 1, sp: 2, fn01: 2, fn02: 1 },
    dec: { pp: 1, sp: 2, fn01: 2, fn02: 2 },
  },
];

// All 12 Months
const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// Approval Styles
const approvalStyles = {
  "System Approved": {
    badge: "bg-green-100 text-green-700 ring-green-600/20",
    dot: "bg-green-500",
  },

  Pending: {
    badge: "bg-amber-100 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },

  Rejected: {
    badge: "bg-red-100 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },
};

const RequirementTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search] = useState("");
  const [open, setOpen] = useState(false);

  // Change Page
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // Change Rows Per Page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Search
  const filteredData = requirementData.filter(
    (row) =>
      row.code.toLowerCase().includes(search.toLowerCase()) ||
      row.sectionName.toLowerCase().includes(search.toLowerCase()) ||
      row.lineDescription.toLowerCase().includes(search.toLowerCase()),
  );

  // Pagination
  const displayedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const from = filteredData.length === 0 ? 0 : page * rowsPerPage + 1;

  const to = Math.min(filteredData.length, (page + 1) * rowsPerPage);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary-dark shadow-sm">
            <AssignmentOutlinedIcon
              sx={{
                color: "#fff",
                fontSize: 22,
              }}
            />
          </div>

          <div>
            <h2 className="text-base font-bold leading-tight text-gray-900">
              Requirement Records
            </h2>

            <p className="text-xs text-gray-500">
              View and manage manpower requirements
            </p>
          </div>
        </div>

        {/* Add Requirement */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          <AddCircleOutlineOutlinedIcon
            sx={{
              fontSize: 18,
            }}
          />
          Add Requirement
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1900px] border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-100/80">
              {/* Department */}
              <th
                rowSpan={2}
                className="sticky left-0 z-20 w-[170px] border-b border-r border-gray-200 bg-gray-100 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600"
              >
                Department Name
              </th>

              {/* Sub Department */}
              <th
                rowSpan={2}
                className="sticky left-[170px] z-20 w-[200px] border-b border-r border-gray-200 bg-gray-100 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600"
              >
                Sub-Department Name
              </th>

              {/* Line */}
              <th
                rowSpan={2}
                className="border-b border-r border-gray-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600"
              >
                Line Description
              </th>

              {/* Machines */}
              <th
                rowSpan={2}
                className="border-b border-r border-gray-200 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-600"
              >
                Machines
              </th>

              {/* Months */}
              {months.map((month, index) => (
                <th
                  key={month}
                  rowSpan={2}
                  className={`border-b border-r border-gray-200 px-4 py-2.5 text-center text-xs font-bold text-white ${
                    index % 2 === 0 ? "bg-primary/90" : "bg-primary-light"
                  }`}
                >
                  {month}
                </th>
              ))}

              {/* Actions */}
              <th
                rowSpan={2}
                className="border-b border-gray-200 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-600"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {displayedData.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-gray-50">
                {/* Department */}
                <td className="sticky left-0 z-10 w-[170px] border-b border-r border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                  {row.code}
                </td>

                {/* Sub Department */}
                <td className="sticky left-[170px] z-10 w-[200px] border-b border-r border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">
                  {row.sectionName}
                </td>

                {/* Line Description */}
                <td className="border-b border-r border-gray-100 px-4 py-3 text-sm text-gray-700">
                  {row.lineDescription}
                </td>

                {/* Machines */}
                <td className="border-b border-r border-gray-100 px-4 py-3 text-center text-sm text-gray-700">
                  {row.approval && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                        approvalStyles[row.approval]?.badge
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          approvalStyles[row.approval]?.dot
                        }`}
                      />

                      {row.approval}
                    </span>
                  )}
                </td>

                {/* Monthly Data */}
                {months.map((month) => {
                  const monthKey = month.toLowerCase();

                  const data = row[monthKey] || {
                    pp: 0,
                    sp: 0,
                    fn01: 0,
                    fn02: 0,
                  };

                  const total = Object.values(data).reduce(
                    (sum, value) => sum + value,
                    0,
                  );

                  return (
                    <td
                      key={month}
                      className="border-b border-r border-gray-100 px-4 py-3 text-center text-xs tabular-nums text-gray-700"
                    >
                      {total}
                    </td>
                  );
                })}

                {/* Actions */}
                <td className="border-b border-gray-100 px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      title="Edit"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-gray-100 hover:text-primary"
                    >
                      <EditOutlinedIcon
                        sx={{
                          color: "#F59E0B",
                          fontSize: 18,
                        }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex min-h-[48px] items-center justify-between gap-2 border-t border-[#E5E7EB] px-2">
          {/* Rows */}
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <span>Rows per page</span>

            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="cursor-pointer rounded-md border border-[#E5E7EB] bg-white py-1 pl-2 pr-6 text-[11px] text-[#6B7280] outline-none focus:border-[#6F4AE7]"
            >
              {[10, 25, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B7280]">
              {from}-{to} of {filteredData.length}
            </span>

            <button
              type="button"
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <KeyboardArrowLeftIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </button>

            <button
              type="button"
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= totalPages - 1}
              className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <KeyboardArrowRightIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Popup */}
      <RequirementPopup open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default RequirementTable;
