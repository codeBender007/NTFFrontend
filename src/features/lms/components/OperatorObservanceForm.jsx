import  { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "../../../OperatorCheckSheet.css";
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

const OCS_ROW_HEIGHTS = Array(20).fill(28);

const OCS_SHEETS = ["L-4", "L-3", "L-2"];

const OCS_DEFAULT_ROWS = [
  { sno: "1", description: "Is process started after Job-set up approval?", cycle: "→", method: "Working procedure" },
  { sno: "2", description: "Machine cleaning, filling start up check sheet and set the process parameter.", cycle: "→", method: "" },
  { sno: "3", description: "Filling of hourly production report", cycle: "→", method: "" },
  { sno: "4", description: "Working as per defined Work instruction of the individual process and imparts trainings", cycle: "→", method: "" },
  { sno: "5", description: "Inspection as per WI / Check quality of input material", cycle: "10", method: "" },
  { sno: "6", description: "Part Handling labeling part storing to define location for next process as per WI", cycle: "10", method: "" },
  { sno: "7", description: "Awareness (if purpose of work/Impact to the Customer)", cycle: "", method: "CSR" },
  { sno: "8", description: "Ensure training given to other operator.", cycle: "", method: "" },
  { sno: "9", description: "Follow the material storage as per WI", cycle: "", method: "Safety & 5S rule" },
  { sno: "10", description: "Use of PPEs as per PPE Matrix / Safety", cycle: "", method: "" },
  { sno: "11", description: "Discipline (ID card, Uniform, Shoes)", cycle: "", method: "" },
  { sno: "12", description: "Maintain 5S in his defined area.", cycle: "", method: "" },
  { sno: "13", description: "Defects 100% checking visually", cycle: "10", method: "Quality checks procedure" },
  { sno: "14", description: "Packaging as per standard", cycle: "10", method: "" },
  { sno: "15", description: "Qty. actual/plan", cycle: "10", method: "Check 1 Hr Production" },
  { sno: "16", description: "Rej. Qty.", cycle: "", method: "Rejection % will allow only 0.1% on part production. (if done by operator)" },
  { sno: "17", description: "Rej. %", cycle: "", method: "" },
  { sno: "18", description: "Total time", cycle: "", method: "Check 10 part" },
  { sno: "19", description: "Takt time", cycle: "", method: "" },
  { sno: "", description: "Judgement", cycle: "", method: "" },
];

const BOXED_ROWS = new Set([4, 5, 12, 13, 14, 15, 16, 17, 18, 19]);

const METHOD_GROUPS = [
  { label: "Working procedure", start: 1, end: 4 },
  { label: "CSR", start: 7, end: 8 },
  { label: "Safety & 5S rule", start: 9, end: 12 },
  { label: "Quality checks procedure", start: 13, end: 14 },
];

const CYCLE_METHOD_MERGES = [
  { label: "Check 1 Hr Production", start: 16, end: 17 },
  { label: "Check 10 part", start: 18, end: 19 },
];

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

function ocsGetRows(ws) {
  return OCS_DEFAULT_ROWS.map((item, index) => {
    const excelRow = index + 9;

    return {
      excelRow,
      sno: ocsText(ws, excelRow, 1) || item.sno,
      description:
        ocsText(ws, excelRow, 2) || item.description,
      cycle:
        ocsText(ws, excelRow, 6) || item.cycle,
      method: item.method,
    };
  });
}

function OCSHeader({ ws }) {
  const title =
    ocsText(ws, 1, 1) ||
    "10 Cycle Operator Observance Cum Evaluation Check Sheet for L4";

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
    <section className="operator-checksheet-top">

      {/* =====================================================
          LOGO
      ===================================================== */}
      <div className="operator-checksheet-logo">
        <img className ="-mt-3" src={logo} alt="NTF Logo" />
      </div>

      {/*TITLE*/}
      <div
        className="operator-checksheet-title"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
      >
        {title}
      </div>

      {/* =====================================================
          OPERATOR CATEGORY
      ===================================================== */}
      <div className="operator-checksheet-category">

        <div className="operator-checksheet-category-title">
          Operator Category&nbsp; (Pls tick √)
        </div>

        {categoryOptions.map((item) => (
          <div
            className="operator-checksheet-category-row"
            key={item}
            onClick={() => toggleCategory(item)}
          >
            <span className="operator-checksheet-checkbox">
              {category === item ? "✓" : ""}
            </span>

            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* =====================================================
          EMPTY COLUMN
      ===================================================== */}
      <div className="operator-checksheet-gap" />

      {/* =====================================================
          OPERATOR DETAILS
      ===================================================== */}
      <div className="operator-checksheet-details">

        {detailRows.map((item) => (
          <div
            className="operator-checksheet-detail-row"
            key={item.label}
          >
            <span className="operator-checksheet-detail-label">
              {item.label}
            </span>

            <span
              className="operator-checksheet-detail-line"
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
      <div className="operator-checksheet-doj">

        {[1, 2, 3, 4, 5].map((row) => (
          <div
            className="operator-checksheet-doj-row"
            key={row}
          >
            {row === 2 ? (
              <span className="operator-checksheet-doj-label">
                Date of Joining:
              </span>
            ) : null}
          </div>
        ))}

      </div>

      {/* =====================================================
          JUDGEMENT
      ===================================================== */}
      <div className="operator-checksheet-judgement">

        {/* COL 1: labels */}
        <div className="operator-checksheet-judgement-labels">

          <span className="operator-checksheet-judgement-label-cell">
            Judgement (Pls tick √)
          </span>

          <span className="operator-checksheet-judgement-label-cell">
            Re-education (Pls tick√)
          </span>

        </div>

        {/* COL 2: OK + checkbox, Required + checkbox */}
        <div className="operator-checksheet-judgement-yes-col">

          <div className="operator-checksheet-judgement-choice">

            <span className="operator-checksheet-judgement-choice-label">
              OK
            </span>

            <span
              className="operator-checksheet-small-box"
              onClick={() => toggleJudgement("ok")}
            >
              {judgement.ok ? "✓" : ""}
            </span>

          </div>

          <div className="operator-checksheet-judgement-choice">

            <span className="operator-checksheet-judgement-choice-label">
              Required
            </span>

            <span
              className="operator-checksheet-small-box"
              onClick={() => toggleJudgement("reEducation")}
            >
              {judgement.reEducation ? "✓" : ""}
            </span>

          </div>

        </div>

        {/* COL 3: OR */}
        <div className="operator-checksheet-judgement-or-col">

          <span className="operator-checksheet-judgement-or">OR</span>
          <span className="operator-checksheet-judgement-or">OR</span>

        </div>

        {/* COL 4: Not OK + checkbox, Not Required + checkbox */}
        <div className="operator-checksheet-judgement-no-col">

          <div className="operator-checksheet-judgement-choice">

            <span className="operator-checksheet-judgement-choice-label">
              Not OK
            </span>

            <span
              className="operator-checksheet-small-box"
              onClick={() => toggleJudgement("notOk")}
            >
              {judgement.notOk ? "✓" : ""}
            </span>

          </div>

          <div className="operator-checksheet-judgement-choice">

            <span className="operator-checksheet-judgement-choice-label">
              Not Required
            </span>

            <span
              className="operator-checksheet-small-box"
              onClick={() => toggleJudgement("notRequired")}
            >
              {judgement.notRequired ? "✓" : ""}
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          THEORETICAL QUESTIONS
          This is kept here for your existing functionality.
      ===================================================== */}
      <div className="operator-checksheet-theory-label">
        Therotical
        <br />
        Questions
      </div>

      <div className="operator-checksheet-questions">

        {questions.map((question, index) => (
          <div
            className="operator-checksheet-question"
            key={question}
          >

            <div className="operator-checksheet-qno">
              Q{index + 1}
            </div>

            <div
              className="operator-checksheet-qtext"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              {question}
            </div>

            <div className="operator-checksheet-qoptions">

              {["Y", "N", "NA"].map((value) => (
                <span
                  key={value}
                  onClick={() => selectAnswer(index, value)}
                  className={
                    answers[index] === value
                      ? "operator-checksheet-answer-selected"
                      : "operator-checksheet-answer"
                  }
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
      <div className="operator-checksheet-score">

        <div className="operator-checksheet-score-row">

          <span
            className="operator-checksheet-score-title"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            Score for therotical
            <br />
            Exam %
          </span>

          <span className="operator-checksheet-score-equals">
            =
          </span>

          <span className="operator-checksheet-score-fraction">

            <span
              className="operator-checksheet-score-numerator"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              Total Marks Obtained&nbsp;&nbsp;*&nbsp;&nbsp;100
            </span>

            <span
              className="operator-checksheet-score-denominator"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              Total Questions
            </span>

          </span>

        </div>

        <div className="operator-checksheet-passing">

          <span>
            Passing Criteria
          </span>

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
      <div className="operator-checksheet-day-row">

        {Array.from({ length: OCS_DAYS }).map((_, dayIndex) => (
          <div
            className="operator-checksheet-day-cell"
            key={dayIndex}
          >
            <span>Day {dayIndex + 1}- Date-</span>
            <span
              className="operator-checksheet-day-date-band"
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

function OCSTableHeader() {
  return (
    <div className="operator-checksheet-grid-header">
      <div className="operator-checksheet-left-header">
        <div className="operator-checksheet-header-sno">S.No</div>
        <div className="operator-checksheet-header-description">Description</div>
        <div className="operator-checksheet-header-cycle">Cycle</div>
        <div className="operator-checksheet-header-method">Method</div>
      </div>

      <div className="operator-checksheet-observation-header">
        {Array.from({ length: OCS_DAYS }).map((_, dayIndex) => (
          <div className="operator-checksheet-cycle-row" key={dayIndex}>
            {Array.from({ length: OCS_CYCLES }).map((_, cycleIndex) => (
              <div
                className={
                  cycleIndex === OCS_CYCLES - 1
                    ? "operator-checksheet-observation-header-cell operator-checksheet-day-end"
                    : "operator-checksheet-observation-header-cell"
                }
                key={cycleIndex}
              >
                {cycleIndex + 1}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function OCSMethodGroups() {
  return (
    <div className="operator-checksheet-method-overlay">
      {METHOD_GROUPS.map((group) => {
        const rowCount = group.end - group.start + 1;
        const top = OCS_ROW_HEIGHTS
          .slice(0, group.start - 1)
          .reduce((total, height) => total + height, 0);
        const height = OCS_ROW_HEIGHTS
          .slice(group.start - 1, group.end)
          .reduce((total, rowHeight) => total + rowHeight, 0);

        return (
          <div
            key={group.label}
            className="operator-checksheet-method-group"
            style={{ top, height }}
          >
            <span>{group.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function OCSCycleMethodMerges() {
  return (
    <div className="operator-checksheet-merged-overlay">
      {CYCLE_METHOD_MERGES.map((group) => {
        const top = OCS_ROW_HEIGHTS
          .slice(0, group.start - 1)
          .reduce((total, height) => total + height, 0);
        const height = OCS_ROW_HEIGHTS
          .slice(group.start - 1, group.end)
          .reduce((total, rowHeight) => total + rowHeight, 0);

        return (
          <div
            key={group.label}
            className="operator-checksheet-merged-group"
            style={{ top, height }}
          >
            <span>{group.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function OCSTableBody({ ws }) {
  const rows = useMemo(
    () => ocsGetRows(ws),
    [ws]
  );

  const [marks, setMarks] = useState({});

  function toggleMark(row, column) {
    const key = `${row}:${column}`;

    setMarks((previous) => ({
      ...previous,
      [key]:
        previous[key] === "✓"
          ? ""
          : "✓",
    }));
  }

  return (
    <div className="operator-checksheet-body">

      <div className="operator-checksheet-left-body">

        {rows.map((row, index) => (
          <div
            className="operator-checksheet-left-row"
            style={{
              height: OCS_ROW_HEIGHTS[index],
            }}
            key={row.excelRow}
          >
            <div
              className="operator-checksheet-sno-cell"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              {row.sno}
            </div>

            <div
              className="operator-checksheet-description-cell"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              {row.description}
            </div>

            <div
              className="operator-checksheet-cycle-cell"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              {row.cycle}
            </div>

            <div className="operator-checksheet-method-cell" />
          </div>
        ))}

        <OCSMethodGroups />
        <OCSCycleMethodMerges />
      </div>

      <div className="operator-checksheet-observation">
        {rows.map((row, rowIndex) => {
          const isBoxed = BOXED_ROWS.has(rowIndex);

          return (
            <div
              className={
                isBoxed
                  ? "operator-checksheet-observation-row operator-checksheet-boxed-row"
                  : "operator-checksheet-observation-row operator-checksheet-plain-row"
              }
              style={{
                height: OCS_ROW_HEIGHTS[rowIndex],
              }}
              key={row.excelRow}
            >
              {Array.from({
                length: OCS_OBS_COLS,
              }).map((_, columnIndex) => {
                const key = `${row.excelRow}:${columnIndex}`;
                const cycleNumber = (columnIndex % OCS_CYCLES) + 1;
                const dayNumber =
                  Math.floor(columnIndex / OCS_CYCLES) + 1;
                const isDayEnd =
                  cycleNumber === OCS_CYCLES;

                return (
                  <button
                    type="button"
                    key={columnIndex}
                    className={
                      isDayEnd
                        ? "operator-checksheet-observation-cell operator-checksheet-day-end"
                        : "operator-checksheet-observation-cell"
                    }
                    onClick={() =>
                      toggleMark(
                        row.excelRow,
                        columnIndex
                      )
                    }
                    aria-label={`Day ${dayNumber}, Cycle ${cycleNumber}`}
                  >
                    {marks[key] || ""}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

    </div>
  );
}

function OCSBottomTable() {
  return (
    <div className="operator-checksheet-bottom">
      <div className="operator-checksheet-bottom-main">
        <div className="operator-checksheet-remarks">
          <div className="operator-checksheet-remarks-text" contentEditable suppressContentEditableWarning spellCheck={false}>
            <strong>Remarks:</strong> Mention details of WI adherence wherever any NG point is observed.
            <br />
            7 Days observation-For New Operator, Rejoin After Some Time &amp; Transfer from other station.
            <br />
            1 Day observation-For Existing Operator
          </div>
        </div>

        <div className="operator-checksheet-next-level">
          <div className="operator-checksheet-next-level-title" contentEditable suppressContentEditableWarning spellCheck={false}>
            If Passed in therotical and Practical test upgraded to Next Level
          </div>

          <div className="operator-checksheet-next-level-grid">
            <div className="operator-checksheet-level-card">
              <div className="operator-checksheet-level-question" contentEditable suppressContentEditableWarning spellCheck={false}>
                4. Know the process &amp; can do the process &amp; can set the process &amp; can teach others (If know, I can, I can set)
              </div>
              <div className="operator-checksheet-level-score">4</div>
            </div>

            <div className="operator-checksheet-level-card">
              <div className="operator-checksheet-level-score">1</div>
              <div className="operator-checksheet-level-question" contentEditable suppressContentEditableWarning spellCheck={false}>
                1. Know the process (If know)
              </div>
            </div>

            <div className="operator-checksheet-level-card">
              <div className="operator-checksheet-level-question" contentEditable suppressContentEditableWarning spellCheck={false}>
                3. Know the process &amp; can do the process &amp; can set the process (If know, I can do, I can set)
              </div>
              <div className="operator-checksheet-level-score">3</div>
            </div>

            <div className="operator-checksheet-level-card">
              <div className="operator-checksheet-level-score">2</div>
              <div className="operator-checksheet-level-question" contentEditable suppressContentEditableWarning spellCheck={false}>
                2. Know the process &amp; can do the process (If know, I can do)
              </div>
            </div>
          </div>
        </div>

        <div className="operator-checksheet-bottom-judgement">
          <div className="operator-checksheet-bottom-judgement-head">
            <div>Judgement</div>
            <div>Sy<br />m.<br />no.</div>
            <div>Min Req. for 1day<br />observation</div>
            <div>Min Req. for 7days<br />observation</div>
          </div>

          <div className="operator-checksheet-bottom-judgement-row">
            <div>Ok condition</div>
            <div>Δ</div>
            <div>AR=0</div>
            <div>AR=10</div>
          </div>

          <div className="operator-checksheet-bottom-judgement-row">
            <div>Needs improvement</div>
            <div>Δ</div>
            <div>&lt;AR=0</div>
            <div>&lt;AR=4</div>
          </div>

          <div className="operator-checksheet-bottom-judgement-row">
            <div>Not ok</div>
            <div>x</div>
            <div>0</div>
            <div>0</div>
          </div>
        </div>
      </div>

      <div className="operator-checksheet-signature-row">
        <div className="operator-checksheet-signature-field">
          <span>Prepared by:</span>
          <span contentEditable suppressContentEditableWarning spellCheck={false} />
        </div>
        <div className="operator-checksheet-signature-field">
          <span>Checked by:</span>
          <span contentEditable suppressContentEditableWarning spellCheck={false} />
        </div>
        <div className="operator-checksheet-signature-field operator-checksheet-approved-field">
          <span>Approved by:</span>
          <span contentEditable suppressContentEditableWarning spellCheck={false} />
        </div>
      </div>

      <div className="operator-checksheet-footer-code">
        F06 (PRD-02)
      </div>
    </div>
  );
}

export default function OperatorObservanceForm() {
  const [workbook, setWorkbook] =
    useState(null);

  const [activeSheet, setActiveSheet] =
    useState("L-4");

  useEffect(() => {

    fetch("/checksheet.xlsx")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Unable to load checksheet.xlsx"
          );
        }

        return response.arrayBuffer();
      })
      .then((buffer) => {
        const loadedWorkbook = XLSX.read(
          buffer,
          {
            type: "array",
          }
        );

        setWorkbook(loadedWorkbook);
      })
      .catch((error) => {
        console.error(error);
      });

  }, []);

  if (!workbook) {
    return (
      <div className="operator-checksheet-loading">
        Loading...
      </div>
    );
  }

  const currentSheet =
    workbook.Sheets[activeSheet];

  return (
    <div className="operator-checksheet-page">

      <div className="operator-checksheet-tabs">

        {OCS_SHEETS.map((sheet) => (

          <button
            type="button"
            key={sheet}
            className={
              activeSheet === sheet
                ? "operator-checksheet-tab operator-checksheet-tab-active"
                : "operator-checksheet-tab"
            }
            onClick={() =>
              setActiveSheet(sheet)
            }
          >
            {sheet}
          </button>

        ))}

      </div>

      <div className="operator-checksheet-scroll">
        <div
          className="operator-checksheet-sheet"
          style={{
            width: OCS_SHEET_WIDTH,
          }}
        >

          <OCSHeader ws={currentSheet} />
          <OCSTableHeader />
          <OCSTableBody ws={currentSheet} />
          <OCSBottomTable />

        </div>

      </div>

    </div>
  );
}