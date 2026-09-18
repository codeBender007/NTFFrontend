import  { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "../../../OperatorCheckSheet.css";

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
const OCS_CELL_WIDTH = OCS_OBS_WIDTH / OCS_OBS_COLS;

const OCS_ROW_HEIGHTS = [
  28, 25, 25, 25, 25,
  25, 25, 28, 28, 28,
  28, 28, 28, 28, 28,
];

const OCS_SHEETS = ["L-4", "L-3", "L-2"];

const OCS_DEFAULT_ROWS = [
  {
    sno: "1",
    description: "Machine cleaning",
    cycle: "",
    method: "Working procedure",
  },
  {
    sno: "2",
    description:
      "Working as per defined Work instruction of the individual process",
    cycle: "",
    method: "",
  },
  {
    sno: "3",
    description: "Part handling process as per WI",
    cycle: "→ 10",
    method: "",
  },
  {
    sno: "4",
    description:
      "Part labeling part storing to define location for next process.",
    cycle: "→ 10",
    method: "",
  },
  {
    sno: "5",
    description:
      "Everything should be available at defined place.",
    cycle: "",
    method: "Safety & 5S rule",
  },
  {
    sno: "6",
    description: "Use of PPEs as per PPE Matrix.",
    cycle: "",
    method: "",
  },
  {
    sno: "7",
    description: "Maintain 5S in his defined area.",
    cycle: "",
    method: "",
  },
  {
    sno: "8",
    description:
      "Defects 100% checking visually as per W.I.",
    cycle: "10",
    method: "Quality checks procedure",
  },
  {
    sno: "9",
    description: "Packaging as per standard",
    cycle: "10",
    method: "",
  },
  {
    sno: "10",
    description: "Qty. actual/plan",
    cycle: "10",
    method: "Check 1 Hr Production",
  },
  {
    sno: "11",
    description: "Rej. Qty.",
    cycle: "",
    method: "Check 1 Hr Production",
  },
  {
    sno: "12",
    description: "Rej. %",
    cycle: "",
    method: "",
  },
  {
    sno: "13",
    description: "Total time",
    cycle: "",
    method: "Check 10 part",
  },
  {
    sno: "14",
    description: "Takt time",
    cycle: "",
    method: "Check 10 part",
  },
  {
    sno: "15",
    description: "Judgement",
    cycle: "",
    method: "",
  },
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
      method:
        ocsText(ws, excelRow, 7) || item.method,
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
    setJudgement((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectAnswer(index, value) {
    setAnswers((prev) => ({
      ...prev,
      [index]: prev[index] === value ? "" : value,
    }));
  }

  return (
    <section className="operator-checksheet-top">

      <div className="operator-checksheet-logo">
        NTF
      </div>

      <div
        className="operator-checksheet-title"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
      >
        {title}
      </div>

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

      <div className="operator-checksheet-details">

        {[
          "Name of Operator:",
          "Name of Observer:",
          "Process Name:",
          "Name of Trainer:",
          "Date:",
        ].map((item) => (
          <div
            className="operator-checksheet-detail-row"
            key={item}
          >
            <span>{item}</span>
            <span
              className="operator-checksheet-detail-line"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            />
          </div>
        ))}

      </div>

      <div className="operator-checksheet-judgement">

        <div className="operator-checksheet-judgement-title">
          Judgement (Pls tick√)
        </div>

        <div className="operator-checksheet-judgement-row">
          <span>OK</span>
          <span
            className="operator-checksheet-small-box"
            onClick={() => toggleJudgement("ok")}
          >
            {judgement.ok ? "✓" : ""}
          </span>
          <span>OR</span>
          <span>Not OK</span>
          <span
            className="operator-checksheet-small-box"
            onClick={() => toggleJudgement("notOk")}
          >
            {judgement.notOk ? "✓" : ""}
          </span>
        </div>

        <div className="operator-checksheet-judgement-row">
          <span>Re-education (Pls tick√)</span>
          <span
            className="operator-checksheet-small-box"
            onClick={() => toggleJudgement("reEducation")}
          >
            {judgement.reEducation ? "✓" : ""}
          </span>
          <span>OR</span>
          <span>Not Required</span>
          <span
            className="operator-checksheet-small-box"
            onClick={() => toggleJudgement("notRequired")}
          >
            {judgement.notRequired ? "✓" : ""}
          </span>
        </div>

      </div>

      <div className="operator-checksheet-theory-label">
        Theoretical
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

            <div
              className="operator-checksheet-qoptions"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              {["Y", "N", "NA"].map((value) => (
                <span
                  key={value}
                  onClick={() => selectAnswer(index, value)}
                  style={{
                    cursor: "pointer",
                    fontWeight: answers[index] === value ? 700 : 400,
                    color: answers[index] === value ? "#174d7c" : "#111111",
                  }}
                >
                  {answers[index] === value ? "☑" : "☐"}&nbsp;{value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="operator-checksheet-score">

        <div className="operator-checksheet-score-field">
          <span>Total Marks Obtained</span>
          <span
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            style={{ outline: "none" }}
          >
            *&nbsp;&nbsp;100
          </span>
        </div>

        <div
          className="operator-checksheet-score-field"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          style={{ outline: "none" }}
        >
          <span>Total Questions</span>
        </div>

        <div
          className="operator-checksheet-score-label"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          style={{ outline: "none" }}
        >
          Score for theoretical
          <br />
          Exam %
        </div>

        <div className="operator-checksheet-passing">
          <span>Passing Criteria</span>
          <span
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            style={{ outline: "none" }}
          >
            Minimum 80%
          </span>
        </div>

      </div>

    </section>
  );
}

function OCSTableHeader() {
  return (
    <div className="operator-checksheet-grid-header">
      <div className="operator-checksheet-left-header">
        <div className="operator-checksheet-header-sno">
          S.No
        </div>

        <div className="operator-checksheet-header-description">
          Description
        </div>

        <div className="operator-checksheet-header-cycle">
          Cycle
        </div>

        <div className="operator-checksheet-header-method">
          Method
        </div>

      </div>

      <div className="operator-checksheet-day-header">

        {Array.from({
          length: OCS_DAYS,
        }).map((_, dayIndex) => (

          <div
            className="operator-checksheet-day"
            key={dayIndex}
          >

            <div
              className="operator-checksheet-day-title"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            >
              Day {dayIndex + 1}- Date-
            </div>

            <div className="operator-checksheet-cycle-header">

              {Array.from({
                length: OCS_CYCLES,
              }).map((_, cycleIndex) => (

                <div
                  className="operator-checksheet-cycle-number"
                  key={cycleIndex}
                >
                  {cycleIndex + 1}
                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

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

            <div className="operator-checksheet-method-cell">
              {row.method && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                >
                  {row.method}
                </span>
              )}
            </div>

          </div>

        ))}

      </div>

      <div className="operator-checksheet-observation">

        {rows.map((row, rowIndex) => (

          <div
            className="operator-checksheet-observation-row"
            style={{
              height: OCS_ROW_HEIGHTS[rowIndex],
            }}
            key={row.excelRow}
          >

            {Array.from({
              length: OCS_OBS_COLS,
            }).map((_, columnIndex) => {

              const key =
                `${row.excelRow}:${columnIndex}`;

              const isDayEnd =
                (columnIndex + 1) % OCS_CYCLES === 0;

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
                  aria-label={`Day ${
                    Math.floor(
                      columnIndex / OCS_CYCLES
                    ) + 1
                  }, Cycle ${
                    (columnIndex %
                      OCS_CYCLES) + 1
                  }`}
                >
                  {marks[key] || ""}
                </button>
              );
            })}

          </div>

        ))}

      </div>

    </div>
  );
}

function OCSBottomTable() {
  return (
    <div className="operator-checksheet-bottom">

      <div className="operator-checksheet-bottom-head">
        <div>Sr.no.</div>
        <div>Date</div>
        <div>Observation Point</div>
        <div>Action Taken</div>
      </div>

      {Array.from({
        length: 5,
      }).map((_, index) => (

        <div
          className="operator-checksheet-bottom-row"
          key={index}
        >
          <div>{index + 1}</div>
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          />
        </div>

      ))}

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