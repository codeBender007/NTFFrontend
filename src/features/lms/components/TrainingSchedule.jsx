import { useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import logo from "../../../assets/images/NTF_logo_black.png";

const EMPTY_ROW = {
  participant: "",
  department: "",
  designation: "",
  signHod: "",
  signParticipants: "",
};

const TrainingSchedule = () => {
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);

  // Training information
  const [details, setDetails] = useState({
    title: "",
    trainer: "",
    date: "",
    periodFrom: "",
    periodTo: "",
    internalExternal: "",
    venue: "",
  });

  // Change training details
  const handleDetailChange = (field) => (event) => {
    setDetails({
      ...details,
      [field]: event.target.value,
    });
  };

  // Change participant table data
  const handleRowChange = (index, field) => (event) => {
    const updatedRows = [...rows];

    updatedRows[index][field] = event.target.value;

    setRows(updatedRows);
  };

  // Add a new participant row
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
          className="flex items-center gap-2 border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <AddOutlinedIcon sx={{ fontSize: 18 }} />
          Add Participant
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PrintOutlinedIcon sx={{ fontSize: 18 }} />
          Print
        </button>
      </div>

      {/* MAIN FORM */}
      <div className="mx-auto w-full max-w-[1100px] bg-white p-3 text-black sm:p-5 print:max-w-none print:p-0">
        {/* OUTER BORDER */}
        <div className="border border-black">
          {/* HEADER*/}
          <div className="grid grid-cols-1 border-b border-black sm:grid-cols-[90px_1fr_300px]">
            {/* NTF */}
            <div className="flex items-center justify-center border-b border-black py-3 sm:border-b-0 sm:border-r sm:py-0">
              <img
                src={logo}
                alt="NTF Logo"
                className="h-15 w-auto object-contain"
              />
            </div>

            {/* TITLE */}
            <div className="flex items-center justify-center border-b border-black px-3 py-3 sm:border-b-0 sm:px-0 sm:py-0">
              <h1 className="text-xl font-bold tracking-wide sm:text-2xl">
                TRAINING SCHEDULE
              </h1>
            </div>

            {/* DOCUMENT INFORMATION */}
            <div className="text-xs sm:border-l sm:border-black">
              <div className="flex min-h-[30px] items-center border-b border-black px-2">
                <span>Doc.No: TF-05(A.MD-02)</span>
              </div>

              <div className="flex min-h-[30px] items-center border-b border-black px-2">
                <span>Issue Date: 02.08.2014</span>
              </div>

              <div className="flex min-h-[30px] items-center px-2">
                <span>Rev.No:00</span>
              </div>
            </div>
          </div>

          {/* TRAINING INFORMATION */}
          <div className="border-b border-black px-3 py-3 text-sm sm:px-4">
            {/* TRAINING TITLE */}
            <div className="mb-3 flex items-center">
              <label className="whitespace-nowrap font-medium">
                Training Title/ Subject
              </label>

              <input
                type="text"
                value={details.title}
                onChange={handleDetailChange("title")}
                className="ml-3 w-full min-w-0 border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
              />
            </div>

            {/* TRAINER + INTERNAL/EXTERNAL */}
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center">
                <label className="whitespace-nowrap font-medium">
                  Name of Trainer
                </label>

                <input
                  type="text"
                  value={details.trainer}
                  onChange={handleDetailChange("trainer")}
                  className="ml-3 w-full min-w-0 border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                />
              </div>

              <div className="flex items-center sm:w-[40%]">
                <label className="whitespace-nowrap font-medium">
                  Internal/External
                </label>

                <input
                  type="text"
                  value={details.internalExternal}
                  onChange={handleDetailChange("internalExternal")}
                  className="ml-2 w-full min-w-0 border-0 bg-transparent px-1 outline-none"
                />
              </div>
            </div>

            {/* DATE / PERIOD / PLACE-VENUE */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr]">
              {/* DATE */}
              <div className="flex items-center">
                <label className="whitespace-nowrap">Date</label>

                <input
                  type="text"
                  value={details.date}
                  onChange={handleDetailChange("date")}
                  className="ml-2 w-full min-w-0 border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                />
              </div>

              {/* PERIOD */}
              <div className="flex items-center gap-2">
                <label className="whitespace-nowrap">Period</label>

                <input
                  type="text"
                  value={details.periodFrom}
                  onChange={handleDetailChange("periodFrom")}
                  className="w-full min-w-0 border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                />

                <span>to</span>

                <input
                  type="text"
                  value={details.periodTo}
                  onChange={handleDetailChange("periodTo")}
                  className="w-full min-w-0 border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                />
              </div>

              {/* PLACE / VENUE */}
              <div className="flex items-center justify-end">
                <label className="whitespace-nowrap">Place/Venue</label>

                <input
                  type="text"
                  value={details.venue}
                  onChange={handleDetailChange("venue")}
                  className="ml-3 w-full min-w-0 border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                />
              </div>
            </div>
          </div>

          {/* INSTRUCTION */}
          <div className="border-b border-black px-3 py-2 text-sm sm:px-4">
            <p className="font-medium leading-5">
              Following employees are required to attend the above training
              Programme.
            </p>

            <p className="font-medium leading-5">
              Trainer, HOD &amp; participants are hereby informed to do the
              needful
            </p>
          </div>

          {/* PARTICIPANT TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              {/* TABLE HEADER */}
              <thead>
                {/* FIRST HEADER ROW */}
                <tr>
                  {/* S.NO */}
                  <th
                    rowSpan="2"
                    className="w-[55px] border-r border-black px-2 py-2 text-center text-xs font-bold"
                  >
                    S. NO.
                  </th>

                  {/* PARTICIPANTS */}
                  <th
                    rowSpan="2"
                    className="w-[260px] border-r border-black px-2 py-2 text-left text-xs font-bold"
                  >
                    NAME OF PARTICIPANTS
                  </th>

                  {/* DEPARTMENT */}
                  <th
                    rowSpan="2"
                    className="w-[180px] border-r border-black px-2 py-2 text-left text-xs font-bold"
                  >
                    DEPARTMENTS
                  </th>

                  {/* DESIGNATION */}
                  <th
                    rowSpan="2"
                    className="w-[170px] border-r border-black px-2 py-2 text-left text-xs font-bold"
                  >
                    DESIGNATION
                  </th>

                  {/* ACKNOWLEDGEMENT */}
                  <th
                    colSpan="2"
                    className="border-b border-black px-2 py-2 text-center text-xs font-bold"
                  >
                    ACKNOWLEDGEMENT
                  </th>
                </tr>

                {/* SECOND HEADER ROW */}
                <tr>
                  <th className="w-[150px] border-r border-black px-2 py-2 text-center text-xs font-bold">
                    SIGN. HOD
                  </th>

                  <th className="w-[180px] px-2 py-2 text-center text-xs font-bold">
                    SIGN. PARTICIPANTS
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {/* S.NO */}
                    <td className="h-[48px] border-r border-t border-black px-2 text-center text-sm">
                      {index + 1}
                    </td>

                    {/* NAME OF PARTICIPANT */}
                    <td className="border-r border-t border-black px-2">
                      <input
                        type="text"
                        value={row.participant}
                        onChange={handleRowChange(index, "participant")}
                        className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                      />
                    </td>

                    {/* DEPARTMENT */}
                    <td className="border-r border-t border-black px-2">
                      <input
                        type="text"
                        value={row.department}
                        onChange={handleRowChange(index, "department")}
                        className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                      />
                    </td>

                    {/* DESIGNATION */}
                    <td className="border-r border-t border-black px-2">
                      <input
                        type="text"
                        value={row.designation}
                        onChange={handleRowChange(index, "designation")}
                        className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                      />
                    </td>

                    {/* SIGN HOD */}
                    <td className="border-r border-t border-black px-2">
                      <input
                        type="text"
                        value={row.signHod}
                        onChange={handleRowChange(index, "signHod")}
                        className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                      />
                    </td>

                    {/* SIGN PARTICIPANTS */}
                    <td className="border-t border-black px-2">
                      <input
                        type="text"
                        value={row.signParticipants}
                        onChange={handleRowChange(index, "signParticipants")}
                        className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              size: A4 landscape;
              margin: 8mm;
            }
          }
        `}
      </style>
    </>
  );
};

export default TrainingSchedule;
