import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import logo from "../../../assets/images/NTF_logo_black.png";

const OCS_DAYS = 7;
const OCS_CYCLES = 10;
const OCS_OBS_COLS = OCS_DAYS * OCS_CYCLES;

const OCS_COLUMNS = {
  sno: 61,
  description: 392,
  cycle: 52,
  method: 60,
};

const OCS_LEFT_WIDTH =
  OCS_COLUMNS.sno +
  OCS_COLUMNS.description +
  OCS_COLUMNS.cycle +
  OCS_COLUMNS.method;

const OCS_SHEET_WIDTH = 1866;
const OCS_OBS_WIDTH = OCS_SHEET_WIDTH - OCS_LEFT_WIDTH;
const OCS_DAY_WIDTH = OCS_OBS_WIDTH / OCS_DAYS;
const OCS_CELL_WIDTH = OCS_DAY_WIDTH / OCS_CYCLES;

const OCS_ROW_HEIGHTS = Array(21).fill(28);
const OCS_SHEETS = ["L-4", "L-3", "L-2"];

const OCS_DEFAULT_ROWS = [
  { sno: "1", description: "Is process started after Job-set up approval?", cycle: "→", method: "Working procedure" },
  { sno: "2", description: "Machine cleaning, filling start up check sheet and set the process parameter.", cycle: "→", method: "" },
  { sno: "3", description: "Filling of hourly production report", cycle: "→", method: "" },
  { sno: "4", description: "Working as per defined Work instruction of the individual process and imparts trainings", cycle: "→", method: "" },
  { sno: "5", description: "Inspection as per WI / Check quality of input material", cycle: "10", method: "" },
  { sno: "6", description: "Part Handling labeling part storing to define location for next process as per WI", cycle: "10", method: "" },
  { sno: "7", description: "Awareness (if purpose of work/Impact to the Customer)", cycle: "→", method: "CSR" },
  { sno: "8", description: "Ensure training given to other operator.", cycle: "→", method: "" },
  { sno: "9", description: "Follow the material storage as per WI", cycle: "→", method: "Safety & 5S rule" },
  { sno: "10", description: "Use of PPEs as per PPE Matrix / Safety", cycle: "→", method: "" },
  { sno: "11", description: "Discipline (ID card, Uniform, Shoes)", cycle: "→", method: "" },
  { sno: "12", description: "Maintain 5S in his defined area.", cycle: "→", method: "" },
  { sno: "13", description: "Defects 100% checking visually", cycle: "10", method: "Quality checks procedure" },
  { sno: "14", description: "Packaging as per standard", cycle: "10", method: "" },
  { sno: "15", description: "Qty. actual/plan", cycle: "10", method: "Check 1 Hr Production" },
  { sno: "16", description: "Rej. Qty.", cycle: "", method: "Rejection % will allow only 0.1% on part production. (if done by operator)" },
  { sno: "17", description: "Rej. %", cycle: "", method: "" },
  { sno: "18", description: "Total time", cycle: "", method: "Check 10 part" },
  { sno: "19", description: "Takt time", cycle: "", method: "" },
  { sno: "", description: "Judgement", cycle: "", method: "" },
  { sno: "", description: "", cycle: "", method: "" },
];

const BOXED_ROWS = new Set([4, 5, 12, 13, 14, 17, 18, 19]);
const DAY1_EMPTY_ROWS = new Set([15, 16]);

const METHOD_GROUPS = [
  { label: "Working procedure", start: 1, end: 6 },
  { label: "CSR", start: 7, end: 8 },
  { label: "Safety & 5S rule", start: 9, end: 12 },
  { label: "Quality checks procedure", start: 13, end: 15 },
];

const CYCLE_MERGES = [
  { start: 16, end: 17, label: "Check 1 Hr Production" },
  { start: 18, end: 19, label: "Check 10 part" },
];

// =====================================================
// L3-SPECIFIC CONFIGURATION (L4 data above is untouched)
// =====================================================
const OCS_L3_ROWS = [
  { sno: "1", description: "Machine cleaning, filling start up check sheet and set the process parameter", cycle: "→", method: "Working procedure" },
  { sno: "2", description: "Filling of hourly production report", cycle: "→", method: "Working procedure" },
  { sno: "3", description: "Working as per defined Work instruction of the individual process", cycle: "→", method: "Working procedure" },
  { sno: "4", description: "Part handling,labeling part storing to define location for next process.", cycle: "10", method: "Working procedure" },
  { sno: "5", description: "Follow the material storage as per WI.", cycle: "10", method: "Working procedure" },
  { sno: "6", description: "Discipline (ID card, Uniform, Shoes)", cycle: "→", method: "Safety & 5S" },
  { sno: "7", description: "Use of PPEs as per PPE Matrix.", cycle: "→", method: "Safety & 5S" },
  { sno: "8", description: "Maintain 5S in his defined area.", cycle: "→", method: "Safety & 5S" },
  { sno: "9", description: "Set-up Approval.", cycle: "→", method: "Quality checks procedure" },
  { sno: "10", description: "Defects 100% checking visually as per WI", cycle: "10", method: "Quality checks procedure" },
  { sno: "11", description: "Packaging as per standard", cycle: "10", method: "Quality checks procedure" },
  { sno: "12", description: "Qty. actual/plan", cycle: "10", method: "Quality checks procedure" },
  { sno: "13", description: "Rej. Qty.", cycle: "", method: "Quality checks procedure" },
  { sno: "14", description: "Rej. %", cycle: "", method: "Quality checks procedure" },
  { sno: "15", description: "Total time", cycle: "", method: "" },
  { sno: "16", description: "Takt time", cycle: "", method: "" },
  { sno: "", description: "Judgement", cycle: "", method: "" },
  { sno: "", description: "", cycle: "", method: "" },
];

const OCS_L3_ROW_HEIGHTS = Array(18).fill(28);
const OCS_L3_BOXED_ROWS = new Set([3, 4, 9, 10, 11, 14, 15, 16]);
const OCS_L3_DAY1_EMPTY_ROWS = new Set([12, 13]);

const OCS_L3_METHOD_GROUPS = [
  { label: "Working procedure", start: 1, end: 5 },
  { label: "Safety & 5S", start: 6, end: 8 },
  { label: "Quality checks procedure", start: 9, end: 14 },
];

const OCS_L3_CYCLE_MERGES = [
  { start: 13, end: 14, label: "Check Product 1 Hr 1 no." },
  { start: 15, end: 16, label: "Check 10 part" },
];

// =====================================================
// L2-SPECIFIC CONFIGURATION (L4/L3 data above is untouched)
// =====================================================
const OCS_L2_ROWS = [
  { sno: "1", description: "Machine cleaning", cycle: "→", method: "Working procedure" },
  { sno: "2", description: "Working as per defined Work instruction of the individual process", cycle: "→", method: "Working procedure" },
  { sno: "3", description: "Part handling process as per WI", cycle: "10", method: "Working procedure" },
  { sno: "4", description: "Part labeling part storing to define location for next process.", cycle: "10", method: "Working procedure" },
  { sno: "5", description: "Everything should be available at defined place.", cycle: "→", method: "Safety & 5S rule" },
  { sno: "6", description: "Use of PPEs as per PPE Matrix.", cycle: "→", method: "Safety & 5S rule" },
  { sno: "7", description: "Maintain 5S in his defined area.", cycle: "→", method: "Safety & 5S rule" },
  { sno: "8", description: "Defects 100% checking visually as per W.I.", cycle: "10", method: "Quality checks procedure" },
  { sno: "9", description: "Packaging as per standard", cycle: "10", method: "Quality checks procedure" },
  { sno: "10", description: "Qty. actual/plan", cycle: "10", method: "Quality checks procedure" },
  { sno: "11", description: "Rej. Qty.", cycle: "", method: "" },
  { sno: "12", description: "Rej. %", cycle: "", method: "" },
  { sno: "13", description: "Total time", cycle: "", method: "" },
  { sno: "14", description: "Takt time", cycle: "", method: "" },
  { sno: "", description: "Judgement", cycle: "", method: "" },
  { sno: "", description: "", cycle: "", method: "" },
];

const OCS_L2_ROW_HEIGHTS = Array(16).fill(28);
const OCS_L2_BOXED_ROWS = new Set([2, 3, 7, 8, 9, 12, 13, 14]);
const OCS_L2_DAY1_EMPTY_ROWS = new Set([]);

const OCS_L2_METHOD_GROUPS = [
  { label: "Working procedure", start: 1, end: 4 },
  { label: "Safety & 5S rule", start: 5, end: 7 },
  { label: "Quality checks procedure", start: 8, end: 10 },
  { label: "Check 1 Hr Production 1 no.", start: 11, end: 12 },
  { label: "Check 10 part", start: 13, end: 14 },
];

const OCS_L2_CYCLE_MERGES = [
  { start: 11, end: 12, label: "Check 1 Hr Production 1 no." },
  { start: 13, end: 14, label: "Check 10 part" },
];

function getOcsConfig(sheet) {
  if (sheet === "L-2") {
    return {
      rows: OCS_L2_ROWS,
      rowHeights: OCS_L2_ROW_HEIGHTS,
      boxedRows: OCS_L2_BOXED_ROWS,
      day1EmptyRows: OCS_L2_DAY1_EMPTY_ROWS,
      methodGroups: OCS_L2_METHOD_GROUPS,
      cycleMerges: OCS_L2_CYCLE_MERGES,
      noteRowStart: 10,
      noteRowCount: 2,
    };
  }

  if (sheet === "L-3") {
    return {
      rows: OCS_L3_ROWS,
      rowHeights: OCS_L3_ROW_HEIGHTS,
      boxedRows: OCS_L3_BOXED_ROWS,
      day1EmptyRows: OCS_L3_DAY1_EMPTY_ROWS,
      methodGroups: OCS_L3_METHOD_GROUPS,
      cycleMerges: OCS_L3_CYCLE_MERGES,
      noteRowStart: 12,
      noteRowCount: 2,
    };
  }

  return {
    rows: OCS_DEFAULT_ROWS,
    rowHeights: OCS_ROW_HEIGHTS,
    boxedRows: BOXED_ROWS,
    day1EmptyRows: DAY1_EMPTY_ROWS,
    methodGroups: METHOD_GROUPS,
    cycleMerges: CYCLE_MERGES,
    noteRowStart: sheet === "L-4" ? 15 : null,
    noteRowCount: 2,
  };
}

function ocsCell(ws, row, col) {
  if (!ws) return null;

  const address = XLSX.utils.encode_cell({
    r: row - 1,
    c: col - 1,
  });

  return ws[address] || null;
}

function ocsText(ws, row, col) {
  const value = ocsCell(ws, row, col)?.v;

  return value == null ? "" : String(value);
}

function ocsGetRows(ws, defaultRows) {
  return defaultRows.map((item, index) => {
    const excelRow = index + 9;
    const sno = Number(item.sno);
    const isArrowRow = sno >= 7 && sno <= 12;
    const isEmptyRow = index === defaultRows.length - 1;

    return {
      excelRow,
      sno:
        isEmptyRow
          ? item.sno
          : ocsText(ws, excelRow, 1) || item.sno,
      description:
        isEmptyRow
          ? item.description
          : ocsText(ws, excelRow, 2) || item.description,
      cycle:
        isArrowRow || isEmptyRow
          ? item.cycle
          : ocsText(ws, excelRow, 6) || item.cycle,
      method: item.method,
    };
  });
}

function OCSHeader({ ws, sheet }) {
  const excelTitle = ocsText(ws, 1, 1);

  const sheetLabel = sheet.replace("-", "");

  const title = excelTitle
    ? excelTitle.replace(/L-?4\b/i, sheetLabel)
    : `10 Cycle Operator Observance Cum Evaluation Check Sheet for ${sheetLabel}`;

  const questions = [
    "Is SOP available?",
    "Do you understand SOP?",
    "Are you adhering SOP?",
    "Do you know operation cycle time?",
    "Do you know the abnormal conditions",
  ];

  const categoryOptions = [
    "New Operator",
    "Rejoin After Some Time",
    "Transfer from other station",
    "Existing Operator",
  ];

  const detailRows = [
    { label: "Name of Operator:" },
    { label: "Name of Observer:" },
    { label: "Process Name:" },
    { label: "Name of Trainer:" },
    { label: "Date:" },
  ];

  const [category, setCategory] = useState("");

  const [judgement, setJudgement] = useState({
    ok: false,
    notOk: false,
    reEducation: false,
    notRequired: false,
  });

  const [answers, setAnswers] = useState({});

  function toggleCategory(item) {
    setCategory((prev) => (prev === item ? "" : item));
  }

  function toggleJudgement(key) {
    setJudgement((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function selectAnswer(index, value) {
    setAnswers((prev) => ({
      ...prev,
      [index]: prev[index] === value ? "" : value,
    }));
  }

  return (
    <section className="relative w-[1866px] h-[163px] bg-white border-b border-[#111111] text-[11px] font-sans box-border">
      {/* =====================================================
          LOGO
      ===================================================== */}
      <div className="absolute left-[11px] top-[4px]">
        <img className="-mt-3 w-[60px] h-auto object-contain" src={logo} alt="NTF Logo" />
      </div>

      {/* TITLE */}
      <div
        className="absolute left-[300px] top-[9px] w-[700px] text-center text-[16px] leading-[20px] font-bold whitespace-nowrap"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
      >
        {title}
      </div>

      {/* =====================================================
          OPERATOR CATEGORY
      ===================================================== */}
      <div className="absolute left-[61px] top-[39px] w-[268px] h-[124px] border border-[#111111] bg-white box-border">
        <div className="w-full h-[25px] flex items-center justify-center border-b border-[#111111] text-[11px] leading-[25px] whitespace-nowrap">
          Operator Category&nbsp; (Pls tick √)
        </div>

        {categoryOptions.map((item) => (
          <div
            className="w-full h-[24px] flex items-center pl-[13px] border-b last:border-b-0 border-[#111111] text-[11px] leading-[24px] whitespace-nowrap cursor-pointer select-none box-border"
            key={item}
            onClick={() => toggleCategory(item)}
          >
            <span className="flex items-center justify-center w-[30px] h-[20px] mr-[13px] shrink-0 border-2 border-[#111111] bg-white text-[14px] font-bold leading-[20px]">
              {category === item ? "✓" : ""}
            </span>

            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* =====================================================
          EMPTY COLUMN
      ===================================================== */}
      <div className="absolute left-[329px] top-[39px] w-[20px] h-[124px] border border-[#111111] bg-white box-border" />

      {/* =====================================================
          OPERATOR DETAILS
      ===================================================== */}
      <div className="absolute left-[349px] top-[39px] w-[216px] h-[124px] border border-[#111111] bg-white box-border">
        {detailRows.map((item) => (
          <div
            className="w-full h-[24px] flex items-center pl-[6px] border-b last:border-b-0 border-[#111111] text-[11px] whitespace-nowrap box-border"
            key={item.label}
          >
            <span className="text-[11px] whitespace-nowrap">
              {item.label}
            </span>

            <span
              className="flex-1 h-[12px] ml-[8px] mr-[6px] border-b border-[#111111] outline-none"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            />
          </div>
        ))}
      </div>

      {/* =====================================================
          DATE OF JOINING
      ===================================================== */}
      <div className="absolute left-[565px] top-[39px] w-[186px] h-[100px] border border-[#111111] bg-white box-border">
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            className="w-full h-[20px] flex items-center pl-[6px] border-b last:border-b-0 border-[#111111] text-[11px] whitespace-nowrap box-border"
            key={row}
          >
            {row === 2 ? (
              <span className="text-[11px] whitespace-nowrap">
                Date of Joining:
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {/* =====================================================
          JUDGEMENT
      ===================================================== */}
      <div className="absolute left-[751px] top-[39px] w-[372px] h-[100px] grid grid-cols-[155px_72px_30px_115px] border border-[#111111] bg-white box-border">
        {/* COL 1: labels */}
        <div className="flex flex-col border-r border-[#111111]">
          <span className="flex-1 flex items-center justify-center px-[6px] text-[10px] font-bold whitespace-nowrap border-b border-[#111111]">
            Judgement (Pls tick √)
          </span>

          <span className="flex-1 flex items-center justify-center px-[6px] text-[10px] font-bold whitespace-nowrap">
            Re-education (Pls tick√)
          </span>
        </div>

        {/* COL 2: OK + checkbox, Required + checkbox */}
        <div className="flex flex-col border-r border-[#111111]">
          <div className="flex-1 flex flex-col items-center justify-center gap-[3px] border-b border-[#111111]">
            <span className="text-[10px] font-bold leading-[12px] text-center whitespace-nowrap">
              OK
            </span>

            <span
              className="flex items-center justify-center w-[28px] h-[21px] shrink-0 border-2 border-[#111111] bg-white cursor-pointer text-[13px] font-bold leading-[21px]"
              onClick={() => toggleJudgement("ok")}
            >
              {judgement.ok ? "✓" : ""}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-[3px]">
            <span className="text-[10px] font-bold leading-[12px] text-center whitespace-nowrap">
              Required
            </span>

            <span
              className="flex items-center justify-center w-[28px] h-[21px] shrink-0 border-2 border-[#111111] bg-white cursor-pointer text-[13px] font-bold leading-[21px]"
              onClick={() => toggleJudgement("reEducation")}
            >
              {judgement.reEducation ? "✓" : ""}
            </span>
          </div>
        </div>

        {/* COL 3: OR */}
        <div className="flex flex-col border-r border-[#111111]">
          <span className="flex-1 flex items-center justify-center text-[10px] font-bold border-b border-[#111111]">OR</span>
          <span className="flex-1 flex items-center justify-center text-[10px] font-bold">OR</span>
        </div>

        {/* COL 4: Not OK + checkbox, Not Required + checkbox */}
        <div className="flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center gap-[3px] border-b border-[#111111]">
            <span className="text-[10px] font-bold leading-[12px] text-center whitespace-nowrap">
              Not OK
            </span>

            <span
              className="flex items-center justify-center w-[28px] h-[21px] shrink-0 border-2 border-[#111111] bg-white cursor-pointer text-[13px] font-bold leading-[21px]"
              onClick={() => toggleJudgement("notOk")}
            >
              {judgement.notOk ? "✓" : ""}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-[3px]">
            <span className="text-[10px] font-bold leading-[12px] text-center whitespace-nowrap">
              Not Required
            </span>

            <span
              className="flex items-center justify-center w-[28px] h-[21px] shrink-0 border-2 border-[#111111] bg-white cursor-pointer text-[13px] font-bold leading-[21px]"
              onClick={() => toggleJudgement("notRequired")}
            >
              {judgement.notRequired ? "✓" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          THEORETICAL QUESTIONS
      ===================================================== */}
      <div className="absolute left-[1123px] top-0 w-[114px] h-[139px] flex items-center justify-center text-center border-l border-r border-b border-[#111111] text-[11px] leading-[15px] box-border">
        Therotical
        <br />
        Questions
      </div>

      <div className="absolute left-[1237px] top-0 w-[337px] h-[139px] border-r border-b border-[#111111] box-border">
        {questions.map((question, index) => (
          <div
            className="w-[337px] h-[27.8px] grid grid-cols-[45px_minmax(0,1fr)_98px] border-b last:border-b-0 border-[#111111] box-border"
            key={question}
          >
            <div className="h-full flex items-center pl-[7px] border-r border-[#111111] text-[11px]">
              Q{index + 1}
            </div>

            <div
              className="h-full min-w-0 flex items-center pl-[8px] text-[11px] whitespace-nowrap overflow-hidden outline-none"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              {question}
            </div>

            <div className="h-full grid grid-cols-3 border-l border-[#111111] text-[10px] whitespace-nowrap">
              {["Y", "N", "NA"].map((value) => (
                <span
                  key={value}
                  onClick={() => selectAnswer(index, value)}
                  className={`flex items-center justify-center border-r last:border-r-0 border-[#111111] cursor-pointer ${answers[index] === value
                    ? "bg-[#111111] text-white"
                    : ""
                    }`}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          SCORE
      ===================================================== */}
      <div className="absolute left-[1574px] top-0 w-[292px] h-[139px] pt-[10px] px-[8px] border-b border-[#111111] text-[10px] box-border">
        <div className="flex items-center gap-[8px] mb-[16px]">
          <span
            className="shrink-0 text-[10px] leading-[12px] text-left whitespace-nowrap outline-none"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            Score for therotical
            <br />
            Exam %
          </span>

          <span className="shrink-0 text-[14px] font-bold">
            =
          </span>

          <span className="flex-1 flex flex-col items-center">
            <span
              className="px-[4px] pb-[3px] border-b border-[#111111] whitespace-nowrap outline-none"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              Total Marks Obtained&nbsp;&nbsp;*&nbsp;&nbsp;100
            </span>

            <span
              className="px-[4px] pt-[3px] whitespace-nowrap outline-none"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              Total Questions
            </span>
          </span>
        </div>

        <div className="flex items-center gap-[20px] w-full h-[27px] px-[5px] border border-[#111111] text-[10px] whitespace-nowrap box-border">
          <span>Passing Criteria</span>
          <span
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            Minimum 80%
          </span>
        </div>
      </div>

      {/* =====================================================
          DAY NAMES
      ===================================================== */}
      <div className={`absolute left-[565px] top-[139px] w-[1301px] h-[24px] box-border ${sheet === "L-3" ? "grid grid-cols-[repeat(10,minmax(0,1.5fr))_repeat(2,minmax(0,3fr))_repeat(58,minmax(0,1fr))]" : "flex"} bg-white`}>
        {Array.from({ length: OCS_DAYS }).map((_, dayIndex) => (
          <div
            className={`${sheet === "L-3" ? "col-span-10" : "flex-1"} h-[24px] flex items-center justify-center gap-[4px] px-[4px] border-r-2 border-[#111111] last:border-r-0 text-[9px] font-bold leading-[24px] whitespace-nowrap overflow-hidden box-border`}
            key={dayIndex}
          >
            <span>Day {dayIndex + 1}- Date-</span>
            <span
              className="w-[34px] min-w-[10px] max-w-[34px] h-[14px] outline-none border-b border-[#111111] font-normal leading-[13px] cursor-text"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function OCSTableHeader({ sheet }) {
  return (
    <div className="w-[1866px] h-[30px] flex border-t border-[#111111] border-b-2 border-b-[#111111] bg-white box-border">
      <div className="w-[565px] h-[30px] shrink-0 grid grid-cols-[61px_392px_52px_60px] box-border">
        <div className="h-[30px] flex items-center justify-center border-l border-r border-[#111111] text-[11px] font-bold overflow-hidden">S.No</div>
        <div className="h-[30px] flex items-center justify-center border-r border-[#111111] text-[13px] font-bold overflow-hidden">Description</div>
        <div className="h-[30px] flex items-center justify-center border-r border-[#111111] text-[11px] font-bold overflow-hidden">Cycle</div>
        <div className="h-[30px] flex items-center justify-center border-r border-[#111111] text-[11px] font-bold overflow-hidden">Method</div>
      </div>

      {sheet === "L-3" ? (
        <div className="w-[1301px] h-[30px] shrink-0 grid grid-cols-[repeat(10,minmax(0,1.5fr))_repeat(2,minmax(0,3fr))_repeat(58,minmax(0,1fr))] overflow-hidden box-border">
          {Array.from({ length: OCS_DAYS * OCS_CYCLES }).map((_, cycleIndexOverall) => {
            const cycleIndex = cycleIndexOverall % OCS_CYCLES;
            const dayIndex = Math.floor(cycleIndexOverall / OCS_CYCLES);
            const isDayEnd = cycleIndex === OCS_CYCLES - 1;
            const isLastCycleOverall = isDayEnd && dayIndex === OCS_DAYS - 1;
            return (
              <div
                className={`w-full h-[30px] flex items-center justify-center border-b border-[#111111] text-[9px] font-bold leading-[30px] min-w-0 box-border ${isLastCycleOverall
                  ? "border-r-0"
                  : isDayEnd
                    ? "border-r-2 border-r-[#111111]"
                    : "border-r border-[#111111]"
                  }`}
                key={cycleIndexOverall}
              >
                {cycleIndex + 1}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-[1301px] h-[30px] shrink-0 flex flex-row overflow-hidden box-border">
          {Array.from({ length: OCS_DAYS }).map((_, dayIndex) => (
            <div className="w-[calc(1301px/7)] shrink-0 h-[30px] grid grid-cols-10 box-border" key={dayIndex}>
              {Array.from({ length: OCS_CYCLES }).map((_, cycleIndex) => {
                const isDayEnd = cycleIndex === OCS_CYCLES - 1;
                const isLastCycleOverall = isDayEnd && dayIndex === OCS_DAYS - 1;
                return (
                  <div
                    className={`w-full h-[30px] flex items-center justify-center border-b border-[#111111] text-[9px] font-bold leading-[30px] min-w-0 box-border ${isLastCycleOverall
                      ? "border-r-0"
                      : isDayEnd
                        ? "border-r-2 border-r-[#111111]"
                        : "border-r border-[#111111]"
                      }`}
                    key={cycleIndex}
                  >
                    {cycleIndex + 1}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OCSMethodGroups({ config }) {
  return (
    <div className="absolute top-0 right-0 w-[60px] pointer-events-none">
      {config.methodGroups.map((group) => {
        const top = config.rowHeights
          .slice(0, group.start - 1)
          .reduce((total, height) => total + height, 0);
        const height = config.rowHeights
          .slice(group.start - 1, group.end)
          .reduce((total, rowHeight) => total + rowHeight, 0);

        return (
          <div
            key={group.label}
            className="absolute left-0 w-[60px] flex items-center justify-center border-r border-b border-[#111111] bg-white overflow-hidden box-border"
            style={{ top, height }}
          >
            <span className="block [writing-mode:vertical-rl] text-center text-[9px] leading-[10px] whitespace-normal">
              {group.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OCSCycleMerges({ config }) {
  return (
    <div className="absolute top-0 left-[453px] w-[52px] pointer-events-none">
      {config.cycleMerges.map((group) => {
        const top = config.rowHeights
          .slice(0, group.start - 1)
          .reduce((total, height) => total + height, 0);
        const height = config.rowHeights
          .slice(group.start - 1, group.end)
          .reduce((total, rowHeight) => total + rowHeight, 0);

        return (
          <div
            key={group.start}
            className="absolute left-0 w-[52px] flex items-center justify-center border-r border-b border-[#111111] bg-white overflow-hidden box-border"
            style={{ top, height }}
          >
            <span className="block [writing-mode:vertical-rl] text-center text-[9px] leading-[10px] whitespace-normal">
              {group.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OCSTableBody({ ws, sheet }) {
  const config = getOcsConfig(sheet);

  const rows = useMemo(
    () => ocsGetRows(ws, config.rows),
    [ws, sheet]
  );

  return (
    <div className="w-[1866px] flex flex-wrap items-start bg-white box-border">
      <div className="relative w-[565px] shrink-0 box-border">
        {rows.slice(0, -1).map((row, index) => {
          const isNoteRow =
            config.noteRowStart != null &&
            index >= config.noteRowStart &&
            index < config.noteRowStart + config.noteRowCount;

          return (
            <div
              className={`w-[565px] grid ${isNoteRow
                ? "grid-cols-[61px_174px_218px_52px_60px]"
                : "grid-cols-[61px_392px_52px_60px]"
                } box-border`}
              style={{
                height: config.rowHeights[index],
              }}
              key={row.excelRow}
            >
              <div
                className="h-full flex items-center justify-center border-l border-r border-b border-[#111111] overflow-hidden text-[10px] outline-none"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
              >
                {row.sno}
              </div>

              <div
                className="h-full flex items-center justify-start px-[4px] py-[2px] border-r border-b border-[#111111] overflow-hidden text-[10px] text-left whitespace-nowrap outline-none"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
              >
                {row.description}
              </div>

              {isNoteRow && (
                <div className="h-full bg-transparent border-0" />
              )}

              <div
                className="h-full flex items-center justify-center border-r border-b border-[#111111] overflow-hidden text-[10px] whitespace-nowrap outline-none"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
              >
                {row.cycle === "10" ? (
                  <span className="[writing-mode:vertical-rl]">{row.cycle}</span>
                ) : (
                  row.cycle
                )}
              </div>

              <div className="h-full flex items-center justify-center border-r border-b border-[#111111] overflow-hidden text-[10px] p-0 text-center" />
            </div>
          );
        })}

        <OCSMethodGroups config={config} />
        <OCSCycleMerges config={config} />

        {config.noteRowStart != null && (
          <div
            className="absolute left-[235px] w-[218px] bg-white border border-[#111111] flex items-center px-[4px] overflow-hidden text-[11px] leading-[14px] text-left z-10 box-border"
            style={{
              top: config.rowHeights.slice(0, config.noteRowStart).reduce((total, height) => total + height, 0),
              height: config.rowHeights.slice(config.noteRowStart, config.noteRowStart + config.noteRowCount).reduce((total, height) => total + height, 0),
            }}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            Rejection % will allow only 0.1% on part production. (if done by operator)
          </div>
        )}
      </div>

      <div className="w-[1301px] shrink-0 box-border">
        {rows.slice(0, -1).map((row, rowIndex) => {
          const isBoxed = config.boxedRows.has(rowIndex);

          // L3 rows 13 & 14: each Day is one plain full-width cell
          if (sheet === "L-3" && (rowIndex === 12 || rowIndex === 13)) {
            return (
              <div
                className={`w-[1301px] grid box-border ${sheet === "L-3" ? "grid-cols-[repeat(10,minmax(0,1.5fr))_repeat(2,minmax(0,3fr))_repeat(58,minmax(0,1fr))]" : "grid-cols-[repeat(70,minmax(0,1fr))]"}`}
                style={{
                  height: config.rowHeights[rowIndex],
                }}
                key={row.excelRow}
              >
                {Array.from({ length: OCS_DAYS }).map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    className={`col-span-10 h-full flex items-center justify-center px-[2px] border-b border-[#111111] bg-white text-[10px] text-center overflow-hidden outline-none cursor-text box-border ${dayIndex === OCS_DAYS - 1 ? "border-r-0" : "border-r-2 border-r-[#111111]"}`}
                    aria-label={`Day ${dayIndex + 1}`}
                  />
                ))}
              </div>
            );
          }

          return (
            <div
              className={`w-[1301px] grid box-border ${sheet === "L-3" ? "grid-cols-[repeat(10,minmax(0,1.5fr))_repeat(2,minmax(0,3fr))_repeat(58,minmax(0,1fr))]" : "grid-cols-[repeat(70,minmax(0,1fr))]"}`}
              style={{
                height: config.rowHeights[rowIndex],
              }}
              key={row.excelRow}
            >
              {Array.from({
                length: OCS_OBS_COLS,
              }).map((_, columnIndex) => {
                const cycleNumber = (columnIndex % OCS_CYCLES) + 1;
                const dayNumber =
                  Math.floor(columnIndex / OCS_CYCLES) + 1;
                const isDayEnd =
                  cycleNumber === OCS_CYCLES;
                const isLastCellInRow = columnIndex === OCS_OBS_COLS - 1;

                let borderRightClass = "";
                if (isDayEnd) {
                  borderRightClass = isLastCellInRow ? "border-r-0" : "border-r-2 border-r-[#111111]";
                } else if (isBoxed || (config.day1EmptyRows.has(rowIndex) && dayNumber !== 1)) {
                  borderRightClass = isLastCellInRow ? "border-r-0" : "border-r border-[#111111]";
                } else {
                  borderRightClass = "border-r-0";
                }

                return (
                  <div
                    key={columnIndex}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    className={`w-full h-full min-w-0 m-0 p-0 flex items-center justify-center border-0 border-b border-[#111111] bg-white text-[#111111] text-[10px] text-center overflow-hidden outline-none cursor-text ${borderRightClass}`}
                    aria-label={`Day ${dayNumber}, Cycle ${cycleNumber}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

    </div>
  );
}

function OCSActionTable() {
  return (
    <div className="block w-[1866px] min-w-[1866px] max-w-[1866px] m-0 p-0 bg-white border-t border-l border-[#111111] font-sans box-border">
      {/* Header row */}
      <div className="grid grid-cols-[61px_120px_392px_1293px] w-[1866px] min-w-[1866px] max-w-[1866px] h-[30px] m-0 p-0 box-border">
        <div className="flex items-center justify-center h-[30px] m-0 p-[1px_2px] border-r border-b border-[#111111] font-sans text-[11px] font-bold text-center overflow-hidden box-border">Sr.no</div>
        <div className="flex items-center justify-center h-[30px] m-0 p-[1px_2px] border-r border-b border-[#111111] font-sans text-[11px] font-bold text-center overflow-hidden box-border">Date</div>
        <div className="flex items-center justify-center h-[30px] m-0 p-[1px_2px] border-r border-b border-[#111111] font-sans text-[11px] font-bold text-center overflow-hidden box-border">Observation Point</div>
        <div className="flex items-center justify-center h-[30px] m-0 p-[1px_2px] border-r border-b border-[#111111] font-sans text-[11px] font-bold text-center overflow-hidden box-border">Action Taken</div>
      </div>

      {/* Editable body rows */}
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div
          className="grid grid-cols-[61px_120px_392px_1293px] w-[1866px] min-w-[1866px] max-w-[1866px] h-[18px] m-0 p-0 box-border"
          key={rowIndex}
        >
          <div
            className="h-[18px] flex items-center justify-center m-0 p-[1px_2px] border-r border-b border-[#111111] bg-white font-sans text-[10px] text-center overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
          <div
            className="h-[18px] flex items-center justify-center m-0 p-[1px_2px] border-r border-b border-[#111111] bg-white font-sans text-[10px] text-center overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
          <div
            className="h-[18px] flex items-center justify-start m-0 p-[1px_2px] border-r border-b border-[#111111] bg-white font-sans text-[10px] text-left whitespace-nowrap overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
          <div
            className="h-[18px] flex items-center justify-start m-0 p-[1px_2px] border-r border-b border-[#111111] bg-white font-sans text-[10px] text-left whitespace-nowrap overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
        </div>
      ))}
    </div>
  );
}

function OCSBottomTable() {
  return (
    <div className="block w-[1866px] min-w-[1866px] max-w-[1866px] m-0 p-0 bg-white font-sans box-border select-none">
      {/* ROW 1: Heading row above Next Level & Remarks */}
      <div className="flex w-[1866px] h-[15px] m-0 p-0 border-t border-[#111111] bg-white box-border">
        {/* Above Remarks & gap: 251px */}
        <div className="w-[251px] shrink-0 h-full bg-white box-border" />

        {/* Heading above Next Level: 270px */}
        <div className="w-[270px] shrink-0 h-full flex items-center justify-center font-bold text-[9px] leading-[15px] text-[#111111] whitespace-nowrap box-border">
          If Passed in therotical and Practical test upgraded to Next Level
        </div>

        {/* Above Judgement: 158px with right border at 679px */}
        <div className="w-[158px] shrink-0 h-full border-r border-[#111111] bg-white box-border" />

        {/* Remainder grid columns up to 1866px */}
        <div className="flex-1 h-full flex bg-white box-border overflow-hidden">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[18px] h-full border-r border-[#e5e5e5] box-border" />
          ))}
        </div>
      </div>

      {/* ROW 2: Main table row (Remarks | Gap | Next Level | Judgement | Remaining Grid) */}
      <div className="flex w-[1866px] h-[58px] m-0 p-0 bg-white box-border">
        {/* 1. Remarks - 220px */}
        <div
          className="w-[220px] shrink-0 h-[58px] m-0 p-[2px_3px] border border-[#111111] bg-white font-sans text-[7.5px] leading-[9.5px] text-[#111111] overflow-hidden outline-none box-border"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
        >
          <span className="font-bold">Remarks:</span> Mention details of WI adherence wherever any NG point is observed.
          <br />
          7 Days observation-For New Operator,Rejoin After Some Time &amp; Transfer from other station.
          <br />
          1 Day observation-For Existing Operator
        </div>

        {/* 2. Gap - 31px */}
        <div className="w-[31px] shrink-0 h-[58px] bg-white box-border" />

        {/* 3. Next Level - 270px */}
        <div className="relative w-[270px] shrink-0 h-[58px] m-0 p-0 border border-[#111111] bg-white overflow-hidden box-border">
          {/* Card 4 (Top Left) */}
          <div
            className="absolute left-[7px] top-[2px] w-[100px] h-[26px] p-[1px_2px] border border-[#111111] bg-white flex items-center font-sans text-[6.5px] leading-[7.5px] text-[#111111] overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            4. Know the Process &amp; can do the process &amp; can set the process &amp; can teach others (If know, I can do, I can set,
          </div>
          <div className="absolute left-[111px] top-[4px] w-[24px] h-[22px] border-[1.5px] border-[#111111] bg-white flex items-center justify-center font-sans text-[11px] font-bold text-[#111111] box-border">
            4
          </div>

          {/* Card 3 (Bottom Left) */}
          <div
            className="absolute left-[7px] top-[30px] w-[100px] h-[25px] p-[1px_2px] border border-[#111111] bg-white flex items-center font-sans text-[6.5px] leading-[7.5px] text-[#111111] overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            3. Know the Process &amp; can do the process &amp; can set the process (If know, I can do, I can set.)
          </div>
          <div className="absolute left-[111px] top-[31px] w-[24px] h-[22px] border-[1.5px] border-[#111111] bg-white flex items-center justify-center font-sans text-[11px] font-bold text-[#111111] box-border">
            3
          </div>

          {/* Card 1 (Top Right) */}
          <div className="absolute left-[158px] top-[4px] w-[24px] h-[22px] border-[1.5px] border-[#111111] bg-white flex items-center justify-center font-sans text-[11px] font-bold text-[#111111] box-border">
            1
          </div>
          <div
            className="absolute left-[186px] top-[2px] w-[76px] h-[25px] p-[1px_2px] border border-[#111111] bg-white flex items-center font-sans text-[6.5px] leading-[7.5px] text-[#111111] overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            1. Know the process (If know)
          </div>

          {/* Card 2 (Bottom Right) */}
          <div className="absolute left-[158px] top-[31px] w-[24px] h-[22px] border-[1.5px] border-[#111111] bg-white flex items-center justify-center font-sans text-[11px] font-bold text-[#111111] box-border">
            2
          </div>
          <div
            className="absolute left-[186px] top-[30px] w-[76px] h-[25px] p-[1px_2px] border border-[#111111] bg-white flex items-center font-sans text-[6.5px] leading-[7.5px] text-[#111111] overflow-hidden outline-none box-border"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            2. Know the process &amp; can do the process (If know, I can do)
          </div>
        </div>

        {/* 4. Judgement Table - 158px */}
        <div className="w-[158px] shrink-0 h-[58px] m-0 p-0 border-t border-b border-r border-[#111111] bg-white overflow-hidden box-border font-sans">
          {/* Header Row - 21px */}
          <div className="flex w-[158px] h-[21px] m-0 p-0 box-border">
            <div className="w-[50px] shrink-0 h-[21px] flex items-center justify-center border-r border-b border-[#111111] text-[7.5px] font-bold text-center leading-[8.5px] box-border">
              Judgement
            </div>
            <div className="w-[20px] shrink-0 h-[21px] flex items-center justify-center border-r border-b border-[#111111] text-[7px] font-bold text-center leading-[8px] box-border">
              Sym.<br />no.
            </div>
            <div className="w-[54px] shrink-0 h-[21px] flex items-center justify-center border-r border-b border-[#111111] text-[6px] font-bold text-center leading-[7.5px] p-[1px] box-border">
              Min Req. for<br />1day observation
            </div>
            <div className="w-[34px] shrink-0 h-[21px] flex items-center justify-center border-b border-[#111111] text-[6px] font-bold text-center leading-[7.5px] p-[1px] box-border">
              for 7 days<br />observation
            </div>
          </div>

          {/* Row 1: Ok condition - 13px */}
          <div className="flex w-[158px] h-[13px] m-0 p-0 box-border">
            <div className="w-[50px] shrink-0 h-[13px] flex items-center justify-start pl-[2px] border-r border-b border-[#111111] text-[7px] leading-[13px] whitespace-nowrap overflow-hidden box-border">
              Ok condition
            </div>
            <div className="w-[20px] shrink-0 h-[13px] flex items-center justify-center border-r border-b border-[#111111] text-[7.5px] leading-[13px] box-border">
              Δ
            </div>
            <div className="w-[54px] shrink-0 h-[13px] flex items-center justify-center border-r border-b border-[#111111] text-[7px] leading-[13px] whitespace-nowrap box-border">
              AR=0
            </div>
            <div className="w-[34px] shrink-0 h-[13px] flex items-center justify-center border-b border-[#111111] text-[7px] leading-[13px] whitespace-nowrap box-border">
              AR=10
            </div>
          </div>

          {/* Row 2: Needs improvement - 12px */}
          <div className="flex w-[158px] h-[12px] m-0 p-0 box-border">
            <div className="w-[50px] shrink-0 h-[12px] flex items-center justify-start pl-[2px] border-r border-b border-[#111111] text-[6.5px] leading-[12px] whitespace-nowrap overflow-hidden box-border">
              Needs improvement
            </div>
            <div className="w-[20px] shrink-0 h-[12px] flex items-center justify-center border-r border-b border-[#111111] text-[7px] leading-[12px] box-border">
              Δ
            </div>
            <div className="w-[54px] shrink-0 h-[12px] flex items-center justify-center border-r border-b border-[#111111] text-[7px] leading-[12px] whitespace-nowrap box-border">
              &lt;AR=0
            </div>
            <div className="w-[34px] shrink-0 h-[12px] flex items-center justify-center border-b border-[#111111] text-[7px] leading-[12px] whitespace-nowrap box-border">
              &lt;AR=4
            </div>
          </div>

          {/* Row 3: Not ok - 12px */}
          <div className="flex w-[158px] h-[12px] m-0 p-0 box-border">
            <div className="w-[50px] shrink-0 h-[12px] flex items-center justify-start pl-[2px] border-r border-[#111111] text-[7px] leading-[12px] whitespace-nowrap overflow-hidden box-border">
              Not ok
            </div>
            <div className="w-[20px] shrink-0 h-[12px] flex items-center justify-center border-r border-[#111111] text-[7px] leading-[12px] box-border">
              x
            </div>
            <div className="w-[27px] shrink-0 h-[12px] flex items-center justify-center border-r border-[#111111] text-[7px] leading-[12px] box-border">
              0
            </div>
            <div className="w-[27px] shrink-0 h-[12px] border-r border-[#111111] box-border" />
            <div className="w-[17px] shrink-0 h-[12px] border-r border-[#111111] box-border" />
            <div className="w-[17px] shrink-0 h-[12px] flex items-center justify-center text-[7px] leading-[12px] box-border">
              0
            </div>
          </div>
        </div>

        {/* Remainder grid columns up to 1866px */}
        <div className="flex-1 h-full flex bg-white box-border overflow-hidden">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[18px] h-full border-r border-[#e5e5e5] box-border" />
          ))}
        </div>
      </div>

      {/* ROW 3: Approval row (Prepared by | Checked by | [gap] | Approved by | Remaining Grid) */}
      <div className="flex w-[1866px] h-[14px] m-0 p-0 border-t border-b border-[#111111] bg-white box-border font-sans">
        {/* Prepared by - 157px */}
        <div className="w-[157px] shrink-0 h-[14px] flex items-center px-[3px] border-r border-[#111111] text-[8px] leading-[14px] whitespace-nowrap overflow-hidden box-border">
          <span className="shrink-0">Prepared by:</span>
          <span
            className="flex-1 min-w-[20px] h-[11px] ml-[3px] border-b border-[#111111] outline-none"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
        </div>

        {/* Checked by - 200px */}
        <div className="w-[200px] shrink-0 h-[14px] flex items-center px-[3px] border-r border-[#111111] text-[8px] leading-[14px] whitespace-nowrap overflow-hidden box-border">
          <span className="shrink-0">Checked by:</span>
          <span
            className="flex-1 min-w-[20px] h-[11px] ml-[3px] border-b border-[#111111] outline-none"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
        </div>

        {/* Empty gap / cell - 63px */}
        <div className="w-[63px] shrink-0 h-[14px] border-r border-[#111111] bg-white box-border" />

        {/* Approved by - 259px (ends at 679px) */}
        <div className="w-[259px] shrink-0 h-[14px] flex items-center px-[3px] border-r border-[#111111] text-[8px] leading-[14px] whitespace-nowrap overflow-hidden box-border">
          <span className="shrink-0">Approved by:</span>
          <span
            className="flex-1 min-w-[20px] h-[11px] ml-[3px] border-b border-[#111111] outline-none"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
        </div>

        {/* Remainder grid columns up to 1866px */}
        <div className="flex-1 h-full flex bg-white box-border overflow-hidden">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[18px] h-full border-r border-[#e5e5e5] box-border" />
          ))}
        </div>
      </div>

      {/* ROW 4: Footer row (F06 (PRD-02) | Remaining Grid) */}
      <div className="flex w-[1866px] h-[16px] m-0 p-0 bg-white box-border font-sans">
        <div className="w-[679px] shrink-0 h-[16px] flex items-center px-[2px] text-[8px] leading-[16px] text-[#111111] whitespace-nowrap box-border">
          F06 (PRD-02)
        </div>

        {/* Remainder grid columns up to 1866px */}
        <div className="flex-1 h-full flex bg-white box-border overflow-hidden">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[18px] h-full border-r border-[#e5e5e5] box-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OperatorObservanceForm() {
  const [workbook, setWorkbook] = useState(null);
  const [activeSheet, setActiveSheet] = useState("L-4");

  useEffect(() => {
    fetch("/checksheet.xlsx")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load checksheet.xlsx");
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const loadedWorkbook = XLSX.read(buffer, {
          type: "array",
        });

        setWorkbook(loadedWorkbook);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const currentSheet = workbook?.Sheets[activeSheet];

  return (
    <div className="w-full min-h-screen m-0 p-0 bg-white text-[#111111] font-sans box-border">
      <div className="w-full h-[31px] flex items-end gap-[2px] pl-[10px] bg-[#f4f4f4] border-b border-[#999999] box-border">
        {OCS_SHEETS.map((sheet) => (
          <button
            type="button"
            key={sheet}
            className={`h-[30px] min-w-[58px] m-0 px-[18px] border border-b-0 border-[#999999] text-[12px] leading-[29px] cursor-pointer font-sans box-border ${activeSheet === sheet
              ? "bg-white font-bold"
              : "bg-[#e9e9e9]"
              }`}
            onClick={() => setActiveSheet(sheet)}
          >
            {sheet}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto overflow-y-hidden bg-white">
        <div
          className="relative mx-auto bg-white"
          style={{
            width: OCS_SHEET_WIDTH,
          }}
        >
          <OCSHeader ws={currentSheet} sheet={activeSheet} />
          <OCSTableHeader sheet={activeSheet} />
          <OCSTableBody ws={currentSheet} sheet={activeSheet} />
          <OCSActionTable />
          <OCSBottomTable />
        </div>
      </div>
    </div>
  );
}
