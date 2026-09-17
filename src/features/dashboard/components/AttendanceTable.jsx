import { useState } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const preColumns = [
  "SNo.",
  "PAYCODE",
  "Card No",
  "Employee Name",
  "Department Name",
  "Subdepartment Name",
  "Designation",
  "Date Of Join",
];

const dateColumns = [
  "01/09",
  "02/09",
  "03/09",
  "04/09",
  "05/09",
  "06/09",
  "07/09",
  "08/09",
  "09/09",
  "10/09",
  "11/09",
  "12/09",
  "13/09",
  "14/09",
];

const postColumns = [
  "DW",
  "HLD",
  "CL",
  "EL",
  "ML",
  "PL",
  "SL",
  "REST",
  "TOTAL",
  "ABS",
  "Paid_Days",
];

const TOTAL_COLUMNS = preColumns.length + dateColumns.length * 2 + postColumns.length;

const rows = [
  {
    id: 1,
    sno: 1,
    paycode: "10144",
    cardNo: "00010144",
    employeeName: "Vishnu",
    departmentName: "LB",
    subDepartmentName: "LB",
    designation: "ASSEMBLER",
    dateOfJoin: "01/11/2018",
    attendance: [
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "HLD", b: "HLD" },
      { a: "P", b: "P" },
      { a: "WO", b: "WO" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "WO", b: "WO" },
      { a: "HLD", b: "HLD" },
    ],
    dw: 10,
    hld: 2,
    cl: 0.0,
    el: 0.0,
    ml: 0.0,
    pl: 0.0,
    sl: 0.0,
    rest: 2,
    total: 14,
    abs: 0,
    paidDays: 14,
  },
  {
    id: 2,
    sno: 2,
    paycode: "10382",
    cardNo: "00010382",
    employeeName: "DEEPAK",
    departmentName: "ACCESSORIES",
    subDepartmentName: "ACCESSORIES",
    designation: "HELPER",
    dateOfJoin: "18/06/2020",
    attendance: [
      { a: "A", b: "A" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "HLD", b: "HLD" },
      { a: "P", b: "P" },
      { a: "WO", b: "WO" },
      { a: "A", b: "A" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "A", b: "A" },
      { a: "P", b: "P" },
      { a: "WO", b: "WO" },
      { a: "HLD", b: "HLD" },
    ],
    dw: 7,
    hld: 2,
    cl: 0.0,
    el: 0.0,
    ml: 0.0,
    pl: 0.0,
    sl: 0.0,
    rest: 2,
    total: 14,
    abs: 3,
    paidDays: 11,
  },
  {
    id: 3,
    sno: 3,
    paycode: "10503",
    cardNo: "00010503",
    employeeName: "Virender",
    departmentName: "STORE",
    subDepartmentName: "STORE",
    designation: "HELPER",
    dateOfJoin: "26/05/2021",
    attendance: [
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "HLD", b: "HLD" },
      { a: "P", b: "P" },
      { a: "POW", b: "POW" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "P", b: "P" },
      { a: "WO", b: "WO" },
      { a: "POH", b: "POH" },
    ],
    dw: 10,
    hld: 2,
    cl: 0.0,
    el: 0.0,
    ml: 0.0,
    pl: 0.0,
    sl: 0.0,
    rest: 2,
    total: 14,
    abs: 0,
    paidDays: 14,
  },
];

const AttendanceTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search] = useState("");

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter(
    (row) =>
      row.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      row.cardNo.toLowerCase().includes(search.toLowerCase()) ||
      row.departmentName.toLowerCase().includes(search.toLowerCase()),
  );

  const displayedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const from = filteredRows.length === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(filteredRows.length, (page + 1) * rowsPerPage);

  const renderAttendance = (value) => (
    <span className="text-[11px] text-gray-500">{value}</span>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center shadow-sm">
            <PeopleAltIcon sx={{ color: "#fff", fontSize: 22 }} />
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Attendance Records
            </h2>
            <p className="text-xs text-gray-500">Employee attendance details</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[3600px] border-collapse">
          <thead>
            <tr className="bg-gray-100/80">
              {preColumns.map((head) => (
                <th
                  key={head}
                  className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600 border-b border-r border-gray-200 text-center whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
              {dateColumns.map((date) => (
                <th
                  key={date}
                  colSpan={2}
                  className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600 border-b border-r border-gray-200 text-center whitespace-nowrap"
                >
                  {date}
                </th>
              ))}
              {postColumns.map((head) => (
                <th
                  key={head}
                  className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600 border-b border-r border-gray-200 text-center whitespace-nowrap"
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
                  colSpan={TOTAL_COLUMNS}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No attendance records found
                </td>
              </tr>
            )}

            {displayedRows.map((row, rowIdx) => (
              <tr
                key={row.id}
                className={`whitespace-nowrap transition hover:bg-primary/5 ${
                  rowIdx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.sno}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-700 border-b border-r border-gray-100 text-center">
                  {row.paycode}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.cardNo}
                </td>
                <td className="px-3 py-3 text-[11px] font-semibold text-gray-800 border-b border-r border-gray-100 text-center">
                  {row.employeeName}
                </td>
                <td className="px-3 py-3 text-[11px] text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.departmentName}
                </td>
                <td className="px-3 py-3 text-[11px] text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.subDepartmentName}
                </td>
                <td className="px-3 py-3 text-[11px] text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.designation}
                </td>
                <td className="px-3 py-3 text-[11px] text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.dateOfJoin}
                </td>
                {row.attendance.flatMap((entry, i) => [
                  <td
                    key={`${i}-a`}
                    className="px-2 py-3 border-b border-r border-gray-100 text-center"
                  >
                    {renderAttendance(entry.a)}
                  </td>,
                  <td
                    key={`${i}-b`}
                    className="px-2 py-3 border-b border-r border-gray-100 text-center"
                  >
                    {renderAttendance(entry.b)}
                  </td>,
                ])}
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.dw}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.hld}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.cl}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.el}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.ml}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.pl}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.sl}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.rest}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.total}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.abs}
                </td>
                <td className="px-3 py-3 text-[11px] font-medium text-gray-500 border-b border-r border-gray-100 text-center">
                  {row.paidDays}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex min-h-[48px] items-center justify-between gap-2 border-t border-[#E5E7EB] px-2">
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

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B7280]">
              {from}-{to} of {filteredRows.length}
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
  );
};

export default AttendanceTable;