import { useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import logo from "../../../assets/images/NTF_logo_black.png";

const EMPTY_ROW = {
  tactTime: "",
  actualTime: "",
  status: "",
};

const PracticalEvaluation = () => {
  // Evaluation rows
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, () => ({ ...EMPTY_ROW })),
  );

  // Sheet information
  const [details, setDetails] = useState({
    name: "",
    date: "",
    type: "",
    partName: "",
    processName: "",
  });

  // Change sheet details
  const handleDetailChange = (field) => (event) => {
    setDetails({
      ...details,
      [field]: event.target.value,
    });
  };

  // Change evaluation row
  const handleRowChange = (index, field) => (event) => {
    const updatedRows = [...rows];

    updatedRows[index][field] = event.target.value;

    setRows(updatedRows);
  };

  // Add a new row
  const addRow = () => {
    setRows([...rows, { ...EMPTY_ROW }]);
  };

  return (
    <>
      {/* PRINT BUTTON + ADD BUTTON */}
      <div className="mb-4 flex items-center justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={addRow}
          className="flex cursor-pointer items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
        >
          <AddOutlinedIcon sx={{ fontSize: 18 }} />
          Add Row
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex cursor-pointer items-center gap-2 bg-[#0f172a] px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-black"
        >
          <PrintOutlinedIcon sx={{ fontSize: 18 }} />
          Print
        </button>
      </div>

      {/* MAIN SHEET */}
      <div className="w-full bg-white p-4 text-black shadow-xs sm:p-6 print:p-0 print:shadow-none">
        {/* OUTER BORDER */}
        <div className="border border-black">
          {/* =====================================================
              HEADER
          ====================================================== */}
          <div className="grid grid-cols-[90px_1fr] border-b border-black">
            {/* NTF */}
            <div className="flex items-center justify-center border-r border-black">
              <div className="text-center">
                <img
                  src={logo}
                  alt="NTF Logo"
                  className="h-13 w-auto object-contain"
                />
              </div>
            </div>

            {/* TITLE */}
            <div className="flex items-center justify-center px-3 text-center">
              <h1 className="text-lg font-bold tracking-wide sm:text-2xl">
                PRACTICAL EVALUATION SHEET
              </h1>
            </div>
          </div>

          {/* =====================================================
              BASIC INFORMATION
          ====================================================== */}
          <div className="border-b border-black">
            {/* NAME + DATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* NAME */}
              <div className="flex min-h-[45px] items-center border-b border-black px-3">
                <label className="whitespace-nowrap text-sm font-medium">
                  Name:
                </label>

                <input
                  type="text"
                  value={details.name}
                  onChange={handleDetailChange("name")}
                  className="ml-3 w-full border-0 border-b border-dotted border-black bg-transparent px-1 text-sm outline-none"
                />
              </div>

              {/* DATE */}
              <div className="flex min-h-[45px] items-center border-b border-black px-3">
                <label className="whitespace-nowrap text-sm font-medium">
                  Date:
                </label>

                <input
                  type="text"
                  value={details.date}
                  onChange={handleDetailChange("date")}
                  className="ml-3 w-full border-0 border-b border-dotted border-black bg-transparent px-1 text-sm outline-none"
                />
              </div>
            </div>

            {/* TYPE + PART NAME + PROCESS NAME */}
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {/* TYPE */}
              <div className="flex min-h-[45px] items-center border-b border-black px-3">
                <label className="whitespace-nowrap text-sm font-medium">
                  Type:
                </label>

                <input
                  type="text"
                  value={details.type}
                  onChange={handleDetailChange("type")}
                  className="ml-3 w-full border-0 border-b border-dotted border-black bg-transparent px-1 text-sm outline-none"
                />
              </div>

              {/* PART NAME */}
              <div className="flex min-h-[45px] items-center border-b border-black px-3">
                <label className="whitespace-nowrap text-sm font-medium">
                  Part Name:
                </label>

                <input
                  type="text"
                  value={details.partName}
                  onChange={handleDetailChange("partName")}
                  className="ml-3 w-full border-0 border-b border-dotted border-black bg-transparent px-1 text-sm outline-none"
                />
              </div>

              {/* PROCESS NAME */}
              <div className="flex min-h-[45px] items-center border-b border-black px-3">
                <label className="whitespace-nowrap text-sm font-medium">
                  Process Name:
                </label>

                <input
                  type="text"
                  value={details.processName}
                  onChange={handleDetailChange("processName")}
                  className="ml-3 w-full border-0 border-b border-dotted border-black bg-transparent px-1 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              EVALUATION TABLE
          ====================================================== */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              {/* TABLE HEADER */}
              <thead>
                <tr>
                  {/* SR NO */}
                  <th
                    rowSpan="2"
                    className="w-[80px] border-r border-black px-2 py-3 text-center text-sm font-bold"
                  >
                    Sr. No.
                  </th>

                  {/* TACT TIME */}
                  <th
                    rowSpan="2"
                    className="w-[220px] border-r border-black px-2 py-3 text-center text-sm font-bold"
                  >
                    Tact Time (Std.) Sec.
                  </th>

                  {/* ACTUAL TIME */}
                  <th
                    rowSpan="2"
                    className="w-[330px] border-r border-black px-2 py-3 text-center text-sm font-bold"
                  >
                    Actual Time Taken (New Operator)
                  </th>

                  {/* STATUS */}
                  <th
                    colSpan="2"
                    className="border-b border-black px-2 py-2 text-center text-sm font-bold"
                  >
                    Status
                  </th>
                </tr>

                <tr>
                  {/* OK */}
                  <th className="w-[90px] border-r border-black px-2 py-2 text-center text-sm font-bold">
                    OK
                  </th>

                  {/* NG */}
                  <th className="w-[90px] px-2 py-2 text-center text-sm font-bold">
                    NG
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {/* SR NO */}
                    <td className="h-[55px] border-r border-t border-black px-2 text-center text-sm">
                      {index + 1}
                    </td>

                    {/* TACT TIME */}
                    <td className="border-r border-t border-black px-2">
                      <input
                        type="text"
                        value={row.tactTime}
                        onChange={handleRowChange(index, "tactTime")}
                        className="w-full border-0 bg-transparent text-center text-sm outline-none"
                      />
                    </td>

                    {/* ACTUAL TIME */}
                    <td className="border-r border-t border-black px-2">
                      <input
                        type="text"
                        value={row.actualTime}
                        onChange={handleRowChange(index, "actualTime")}
                        className="w-full border-0 bg-transparent text-center text-sm outline-none"
                      />
                    </td>

                    {/* OK */}
                    <td className="border-r border-t border-black text-center">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        value="OK"
                        checked={row.status === "OK"}
                        onChange={handleRowChange(index, "status")}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* NG */}
                    <td className="border-t border-black text-center">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        value="NG"
                        checked={row.status === "NG"}
                        onChange={handleRowChange(index, "status")}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <div className="flex justify-end border-t border-black px-4 py-3">
            <span className="text-xs font-medium">F19 (A.MD-02)</span>

            <span className="ml-10 text-xs font-medium">Rev.00</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          PRINT CSS
      ====================================================== */}
      <style>
        {`
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
            }

            .print\\:hidden {
              display: none !important;
            }

            input {
              color: black !important;
              background: transparent !important;
            }

            @page {
              size: A4 portrait;
              margin: 8mm;
            }
          }
        `}
      </style>
    </>
  );
};

export default PracticalEvaluation;
