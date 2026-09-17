import { useState } from "react";
import ntfLogo from "../../../assets/images/NTF_logo_black.png";

const OperatorObservanceForm = () => {
  const [formData, setFormData] = useState({
    operatorCategory: "",
    operatorName: "",
    observerName: "",
    processName: "",
    trainerName: "",
    joiningDate: "",
    date: "",
    judgement: "",
    reEducation: "",
    observations: {},
  });

  // =========================================================
  // DAYS
  // =========================================================

  const days = [
    "Day 1",
    "Day 2",
    "Day 3",
    "Day 4",
    "Day 5",
    "Day 6",
    "Day 7",
  ];

  // =========================================================
  // CYCLES
  // =========================================================

  const cycles = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
  ];

  // =========================================================
  // OBSERVATION POINTS
  // =========================================================

  const observationPoints = [
    {
      sno: 1,
      description:
        "Is process started after Job-set up approval?",
      cycle: "1",
      method: "Working procedure",
    },

    {
      sno: 2,
      description:
        "Machine cleaning, filling start up check sheet and set the process parameter.",
      cycle: "1",
      method: "",
    },

    {
      sno: 3,
      description:
        "Filling of hourly production report",
      cycle: "1",
      method: "",
    },

    {
      sno: 4,
      description:
        "Working as per defined Work instruction of the individual process and impart trainings.",
      cycle: "1",
      method: "",
    },

    {
      sno: 5,
      description:
        "Inspection as per WI / Check quality of Input material",
      cycle: "8",
      method: "",
    },

    {
      sno: 6,
      description:
        "Part Handling labeling part storing to defined location for next process as per W.I",
      cycle: "8",
      method: "",
    },

    {
      sno: 7,
      description:
        "Awareness (Purpose of work/Impact to the Customer)",
      cycle: "1",
      method: "CSR",
    },

    {
      sno: 8,
      description:
        "Ensure training given to other operator.",
      cycle: "1",
      method: "",
    },

    {
      sno: 9,
      description:
        "Follow the material storage as per WI",
      cycle: "1",
      method: "Safety & 5S",
    },

    {
      sno: 10,
      description:
        "Use of PPEs as per PPE Matrix / Safety",
      cycle: "1",
      method: "",
    },

    {
      sno: 11,
      description:
        "Discipline (ID card, Uniform, Shoes)",
      cycle: "1",
      method: "",
    },

    {
      sno: 12,
      description:
        "Maintain 5S in his defined area.",
      cycle: "1",
      method: "",
    },

    {
      sno: 13,
      description:
        "Defects 100% checking visually",
      cycle: "8",
      method: "Quality checks procedure",
    },

    {
      sno: 14,
      description:
        "Packaging as per standard",
      cycle: "8",
      method: "",
    },

    {
      sno: 15,
      description:
        "Qty. actual / plan",
      cycle: "8",
      method: "",
    },

    {
      sno: 16,
      description:
        "Rej. Qty.",
      cycle: "8",
      method: "Check 1 Hr Production",
    },

    {
      sno: 17,
      description:
        "Rej. %",
      cycle: "",
      method: "",
    },

    {
      sno: 18,
      description:
        "Total time",
      cycle: "",
      method: "Check 10 part",
    },

    {
      sno: 19,
      description:
        "Takt time",
      cycle: "",
      method: "",
    },
  ];

  // =========================================================
  // THEORETICAL QUESTIONS
  // =========================================================

  const theoreticalQuestions = [
    "Is SOP available?",
    "Do you understand SOP?",
    "Are you adhering SOP?",
    "Do you know operation cycle time?",
    "Do you know the abnormal conditions",
  ];

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE OBSERVATION
  // =========================================================

  const handleObservationChange = (
    day,
    cycle,
    row,
    value
  ) => {
    const key = `${day}-${cycle}-${row}`;

    setFormData((prev) => ({
      ...prev,
      observations: {
        ...prev.observations,
        [key]: value,
      },
    }));
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Operator Observance Form:", formData);
  };

  return (
    <div
      className="min-h-screen w-full bg-white p-2"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* ===================================================== */}
      {/* PRINT BUTTON */}
      {/* ===================================================== */}
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-[#6F4AE7] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#5A38D6]"
        >
          Print
        </button>
      </div>

      {/* ===================================================== */}
      {/* HORIZONTAL SCROLL */}
      {/* ===================================================== */}

      <div className="w-full overflow-x-auto">
        <div className="min-w-[2850px] bg-white">

          {/* ================================================= */}
          {/* COMPLETE FORM */}
          {/* ================================================= */}

          <div className="border border-black">

            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
              }}
            >
              <tbody>

                <tr className="h-[36px]">

                  <td className="relative border border-black">

                    <img
                      src={ntfLogo}
                      alt="NTF"
                      className="absolute left-[5px] top-[3px] h-[27px] w-auto object-contain"
                    />

                    <div className="flex h-full items-center justify-center text-[16px] font-bold">
                      10 Cycle Operator Observance Cum Evaluation Check Sheet for L4
                    </div>

                  </td>

                </tr>

              </tbody>
            </table>

            {/* ================================================= */}
            {/* TOP INFORMATION */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
              }}
            >

              <colgroup>

                <col style={{ width: "230px" }} />

                <col style={{ width: "45px" }} />

                <col style={{ width: "205px" }} />

                <col style={{ width: "250px" }} />

                <col style={{ width: "145px" }} />

                <col style={{ width: "80px" }} />

                <col style={{ width: "55px" }} />

                <col style={{ width: "120px" }} />

                <col style={{ width: "120px" }} />

              </colgroup>

              <tbody>

                {/* ============================================= */}
                {/* OPERATOR CATEGORY */}
                {/* ============================================= */}

                <tr>

                  <td
                    rowSpan="4"
                    className="border border-black p-0 align-top"
                  >

                    <div className="border-b border-black py-[4px] text-center text-[10px]">
                      Operator Category&nbsp; (Pls tick √)
                    </div>

                    {/* NEW OPERATOR */}

                    <label className="flex h-[23px] items-center border-b border-black text-[10px]">

                      <span className="flex w-[45px] justify-center">

                        <input
                          type="checkbox"
                          className="h-[19px] w-[27px] appearance-none border-2 border-black"
                        />

                      </span>

                      <span>
                        New Operator
                      </span>

                    </label>

                    {/* REJOIN */}

                    <label className="flex h-[23px] items-center border-b border-black text-[10px]">

                      <span className="flex w-[45px] justify-center">

                        <input
                          type="checkbox"
                          className="h-[19px] w-[27px] appearance-none border-2 border-black"
                        />

                      </span>

                      <span>
                        Rejoin After Some Time
                      </span>

                    </label>

                    {/* TRANSFER */}

                    <label className="flex h-[23px] items-center border-b border-black text-[10px]">

                      <span className="flex w-[45px] justify-center">

                        <input
                          type="checkbox"
                          className="h-[19px] w-[27px] appearance-none border-2 border-black"
                        />

                      </span>

                      <span>
                        Transfer from other station
                      </span>

                    </label>

                    {/* EXISTING */}

                    <label className="flex h-[23px] items-center text-[10px]">

                      <span className="flex w-[45px] justify-center">

                        <input
                          type="checkbox"
                          className="h-[19px] w-[27px] appearance-none border-2 border-black"
                        />

                      </span>

                      <span>
                        Existing Operator
                      </span>

                    </label>

                  </td>

                  {/* =========================================== */}
                  {/* OPERATOR NAME */}
                  {/* =========================================== */}

                  <td
                    colSpan="2"
                    className="border border-black px-[5px] text-[10px]"
                  >
                    Name of Operator:
                  </td>

                  <td className="border border-black">

                    <input
                      type="text"
                      name="operatorName"
                      value={formData.operatorName}
                      onChange={handleChange}
                      className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
                    />

                  </td>

                  {/* DATE OF JOINING */}

                  <td className="border border-black px-[5px] text-[10px]">
                    Date of Joining :
                  </td>

                  <td
                    colSpan="2"
                    className="border border-black"
                  >

                    <input
                      type="text"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
                    />

                  </td>

                  {/* =========================================== */}
                  {/* JUDGEMENT */}
                  {/* =========================================== */}

                  <td
                    className="border border-black text-center text-[10px]"
                  >

                    <div className="border-b border-black py-[4px]">
                      Judgement (Pls tick √)
                    </div>

                    <div className="flex h-[23px] items-center justify-center">
                      OK
                    </div>

                  </td>

                  <td className="border border-black text-center text-[10px]">
                    OR
                  </td>

                  <td className="border border-black text-center text-[10px]">
                    Not OK
                  </td>

                </tr>

                {/* ============================================= */}
                {/* OBSERVER */}
                {/* ============================================= */}

                <tr>

                  <td
                    colSpan="2"
                    className="border border-black px-[5px] text-[10px]"
                  >
                    Name of Observer:
                  </td>

                  <td className="border border-black">

                    <input
                      type="text"
                      name="observerName"
                      value={formData.observerName}
                      onChange={handleChange}
                      className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
                    />

                  </td>

                  <td className="border border-black px-[5px] text-[10px]">
                    Date of Joining :
                  </td>

                  <td
                    colSpan="2"
                    className="border border-black"
                  />

                  <td className="border border-black p-0">

                    <div className="flex h-[23px] items-center justify-center">

                      <input
                        type="checkbox"
                        className="h-[19px] w-[37px] appearance-none border-2 border-black"
                      />

                    </div>

                  </td>

                  <td className="border border-black text-center text-[10px]">
                    OR
                  </td>

                  <td className="border border-black p-0">

                    <div className="flex h-[23px] items-center justify-center">

                      <input
                        type="checkbox"
                        className="h-[19px] w-[37px] appearance-none border-2 border-black"
                      />

                    </div>

                  </td>

                </tr>

                {/* ============================================= */}
                {/* PROCESS */}
                {/* ============================================= */}

                <tr>

                  <td
                    colSpan="2"
                    className="border border-black px-[5px] text-[10px]"
                  >
                    Process Name:
                  </td>

                  <td className="border border-black">

                    <input
                      type="text"
                      name="processName"
                      value={formData.processName}
                      onChange={handleChange}
                      className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
                    />

                  </td>

                  <td className="border border-black px-[5px] text-[10px]">
                    Date of Joining :
                  </td>

                  <td
                    colSpan="2"
                    className="border border-black"
                  />

                  <td className="border border-black text-center text-[9px]">
                    Required
                  </td>

                  <td className="border border-black text-center text-[10px]">
                    OR
                  </td>

                  <td className="border border-black text-center text-[9px]">
                    Not Required
                  </td>

                </tr>

                {/* ============================================= */}
                {/* TRAINER */}
                {/* ============================================= */}

                <tr>

                  <td
                    colSpan="2"
                    className="border border-black px-[5px] text-[10px]"
                  >
                    Name of Trainer:
                  </td>

                  <td className="border border-black">

                    <input
                      type="text"
                      name="trainerName"
                      value={formData.trainerName}
                      onChange={handleChange}
                      className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
                    />

                  </td>

                  <td
                    colSpan="2"
                    className="border border-black px-[5px] text-[10px]"
                  >
                    Date:
                  </td>

                  <td className="border border-black" />

                  <td className="border border-black" />

                  <td className="border border-black" />

                  <td className="border border-black" />

                </tr>

              </tbody>

            </table>

            {/* ================================================= */}
            {/* DAY 1 - DAY 7 HEADER */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
              }}
            >

              <colgroup>

                <col style={{ width: "35px" }} />

                <col style={{ width: "420px" }} />

                <col style={{ width: "40px" }} />

                <col style={{ width: "75px" }} />

                {Array.from({
                  length: 70,
                }).map((_, index) => (
                  <col
                    key={index}
                    style={{
                      width: "32px",
                    }}
                  />
                ))}

              </colgroup>

              <thead>

                {/* DAY ROW */}

                <tr className="h-[24px]">

                  <th
                    rowSpan="2"
                    className="border border-black text-[8px]"
                  >
                    S.No
                  </th>

                  <th
                    rowSpan="2"
                    className="border border-black text-[8px]"
                  >
                    Description
                  </th>

                  <th
                    rowSpan="2"
                    className="border border-black text-[8px]"
                  >
                    Cycle
                  </th>

                  <th
                    rowSpan="2"
                    className="border border-black text-[8px]"
                  >
                    Method
                  </th>

                  {days.map((day) => (
                    <th
                      key={day}
                      colSpan="10"
                      className="border border-black text-[8px] font-normal"
                    >
                      {day} - Date-
                    </th>
                  ))}

                </tr>

                {/* CYCLE ROW */}

                <tr className="h-[18px]">

                  {days.map((day) =>
                    cycles.map((cycle) => (
                      <th
                        key={`${day}-${cycle}`}
                        className="border border-black text-[7px] font-normal"
                      >
                        {cycle}
                      </th>
                    ))
                  )}

                </tr>

              </thead>

              {/* ================================================= */}
              {/* OBSERVATION ROWS */}
              {/* ================================================= */}

              <tbody>

                {observationPoints.map((item) => (
                  <tr
                    key={item.sno}
                    className="h-[27px]"
                  >

                    <td className="border border-black text-center text-[8px]">
                      {item.sno}
                    </td>

                    <td className="border border-black px-1 text-[8px] leading-[9px]">
                      {item.description}
                    </td>

                    <td className="border border-black text-center text-[8px]">
                      {item.cycle}
                    </td>

                    <td className="border border-black px-1 text-center text-[7px] leading-[8px]">
                      {item.method}
                    </td>

                    {/* 70 OBSERVATION CELLS */}

                    {days.map((day, dayIndex) =>
                      cycles.map((cycle) => {

                        const key =
                          `${dayIndex + 1}-${cycle}-${item.sno}`;

                        return (
                          <td
                            key={key}
                            className="border border-black p-0 text-center"
                          >

                            <select
                              value={
                                formData.observations[
                                  key
                                ] || ""
                              }
                              onChange={(e) =>
                                handleObservationChange(
                                  dayIndex + 1,
                                  cycle,
                                  item.sno,
                                  e.target.value
                                )
                              }
                              className="h-[26px] w-full cursor-pointer appearance-none bg-transparent p-0 text-center text-[8px] outline-none"
                            >

                              <option value="">
                                {" "}
                              </option>

                              <option value="○">
                                ○
                              </option>

                              <option value="Δ">
                                Δ
                              </option>

                              <option value="X">
                                X
                              </option>

                            </select>

                          </td>
                        );
                      })
                    )}

                  </tr>
                ))}

              </tbody>

            </table>

            {/* ================================================= */}
            {/* THEORETICAL QUESTIONS */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
              }}
            >

              <colgroup>

                <col style={{ width: "125px" }} />

                <col style={{ width: "35px" }} />

                <col style={{ width: "250px" }} />

                <col style={{ width: "30px" }} />

                <col style={{ width: "30px" }} />

                <col style={{ width: "30px" }} />

                <col style={{ width: "150px" }} />

                <col style={{ width: "150px" }} />

                <col style={{ width: "70px" }} />

                <col style={{ width: "140px" }} />

              </colgroup>

              <tbody>

                {theoreticalQuestions.map(
                  (question, index) => (
                    <tr
                      key={index}
                      className="h-[24px]"
                    >

                      {/* THEORETICAL QUESTIONS */}

                      {index === 0 && (
                        <td
                          rowSpan="5"
                          className="border border-black text-center text-[10px]"
                        >
                          Theoretical
                          <br />
                          Questions
                        </td>
                      )}

                      {/* QUESTION NUMBER */}

                      <td className="border border-black text-center text-[9px]">
                        Q{index + 1}
                      </td>

                      {/* QUESTION */}

                      <td className="border border-black px-2 text-[9px]">
                        {question}
                      </td>

                      {/* YES */}

                      <td className="border border-black text-center text-[9px]">
                        Y
                      </td>

                      {/* NO */}

                      <td className="border border-black text-center text-[9px]">
                        N
                      </td>

                      {/* NA */}

                      <td className="border border-black text-center text-[9px]">
                        NA
                      </td>

                      {/* SCORE */}

                      {index === 0 && (
                        <td
                          rowSpan="5"
                          className="border border-black p-0 text-center text-[9px]"
                        >
                          Score for theoretical
                          <br />
                          Exam %
                        </td>
                      )}

                      {/* TOTAL MARKS */}

                      {index === 0 && (
                        <td
                          rowSpan="5"
                          className="border border-black p-0 text-[9px]"
                        >

                          <div className="border-b border-black px-2 py-2">
                            Total Marks Obtained
                            <span className="float-right">
                              *
                            </span>
                          </div>

                          <div className="px-2 py-2">
                            Total Questions
                          </div>

                        </td>
                      )}

                      {/* 100 */}

                      {index === 0 && (
                        <td
                          rowSpan="5"
                          className="border border-black text-center text-[9px]"
                        >
                          100
                        </td>
                      )}

                      {/* PASSING */}

                      {index === 0 && (
                        <td
                          rowSpan="5"
                          className="border border-black p-0 text-center text-[9px]"
                        >

                          <div className="border-b border-black py-2">
                            Passing Criteria
                          </div>

                          <div className="py-2">
                            Minimum 80%
                          </div>

                        </td>
                      )}

                    </tr>
                  )
                )}

              </tbody>

            </table>

            {/* ================================================= */}
            {/* JUDGEMENT / ACTION TAKEN */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
              }}
            >

              <colgroup>

                <col style={{ width: "45px" }} />

                <col style={{ width: "100px" }} />

                <col style={{ width: "420px" }} />

                <col />

              </colgroup>

              <thead>

                <tr>

                  <th
                    colSpan="4"
                    className="border border-black px-1 py-1 text-left text-[9px] font-bold"
                  >
                    Judgement
                  </th>

                </tr>

                <tr className="h-[20px]">

                  <th className="border border-black text-[8px]">
                    Sr.No
                  </th>

                  <th className="border border-black text-[8px]">
                    Date
                  </th>

                  <th className="border border-black text-[8px]">
                    Observation Point
                  </th>

                  <th className="border border-black text-[8px]">
                    Action Taken
                  </th>

                </tr>

              </thead>

              <tbody>

                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <tr
                    key={index}
                    className="h-[25px]"
                  >

                    <td className="border border-black text-center text-[8px]">
                      {index + 1}
                    </td>

                    <td className="border border-black">

                      <input
                        type="text"
                        className="h-full w-full bg-transparent px-1 text-[8px] outline-none"
                      />

                    </td>

                    <td className="border border-black">

                      <input
                        type="text"
                        className="h-full w-full bg-transparent px-1 text-[8px] outline-none"
                      />

                    </td>

                    <td className="border border-black">

                      <input
                        type="text"
                        className="h-full w-full bg-transparent px-1 text-[8px] outline-none"
                      />

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            {/* ================================================= */}
            {/* BOTTOM SECTION */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
              }}
            >

              <colgroup>

                <col style={{ width: "400px" }} />

                <col style={{ width: "650px" }} />

                <col />

              </colgroup>

              <tbody>

                <tr>

                  {/* =========================================== */}
                  {/* REMARKS */}
                  {/* =========================================== */}

                  <td
                    className="border border-black p-1 align-top"
                  >

                    <p className="m-0 text-[7px] leading-[9px]">
                      <b>Remarks:</b> Mention details
                      of WI adherence wherever any NG
                      point is observed.
                    </p>

                    <p className="m-0 text-[7px] leading-[9px]">
                      7 Days observation-For New Operator,
                      Rejoin After Some Time & Transfer
                      from other station.
                    </p>

                    <p className="m-0 text-[7px] leading-[9px]">
                      1 Day observation-For Existing
                      Operator
                    </p>

                  </td>

                  {/* =========================================== */}
                  {/* LEVEL */}
                  {/* =========================================== */}

                  <td className="border border-black">

                    <div className="border-b border-black px-1 py-1 text-center text-[8px] font-bold">
                      If Passed in theoretical and
                      Practical test upgraded to Next Level
                    </div>

                    <div className="grid grid-cols-2">

                      <div className="border-b border-r border-black p-1 text-[7px] leading-[8px]">
                        4. Know the Process & can do
                        the process & can teach others
                        (if know, I can do, I can set,
                        I can teach)
                      </div>

                      <div className="border-b border-black p-1 text-[7px] leading-[8px]">
                        1. Know the process
                        (if know)
                      </div>

                      <div className="border-r border-black p-1 text-[7px] leading-[8px]">
                        3. Know the Process & can do
                        the process
                        (if know, I can do, I can set)
                      </div>

                      <div className="p-1 text-[7px] leading-[8px]">
                        2. Know the Process & can do
                        the process
                        (if know, I can do)
                      </div>

                    </div>

                  </td>

                  {/* =========================================== */}
                  {/* JUDGEMENT LEGEND */}
                  {/* =========================================== */}

                  <td className="border border-black p-0">

                    <table className="w-full border-collapse">

                      <thead>

                        <tr>

                          <th className="border border-black p-1 text-[7px]">
                            Judgement
                          </th>

                          <th className="border border-black p-1 text-[7px]">
                            Sym.
                          </th>

                          <th className="border border-black p-1 text-[7px]">
                            Min Req. for 1 day
                            observation
                          </th>

                          <th className="border border-black p-1 text-[7px]">
                            Min Req. for 7 days
                            observation
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        <tr>

                          <td className="border border-black p-1 text-center text-[7px]">
                            Ok condition
                          </td>

                          <td className="border border-black p-1 text-center text-[8px]">
                            ○
                          </td>

                          <td className="border border-black p-1 text-center text-[7px]">
                            AR = all 0
                          </td>

                          <td className="border border-black p-1 text-center text-[7px]">
                            AR = all 0
                          </td>

                        </tr>

                        <tr>

                          <td className="border border-black p-1 text-center text-[7px]">
                            Needs improvement
                          </td>

                          <td className="border border-black p-1 text-center text-[8px]">
                            Δ
                          </td>

                          <td className="border border-black p-1 text-center text-[7px]">
                            &lt; AR = 0
                          </td>

                          <td className="border border-black p-1 text-center text-[7px]">
                            &lt; AR = 4
                          </td>

                        </tr>

                        <tr>

                          <td className="border border-black p-1 text-center text-[7px]">
                            Not ok
                          </td>

                          <td className="border border-black p-1 text-center text-[8px]">
                            X
                          </td>

                          <td className="border border-black p-1 text-center text-[7px]">
                            0
                          </td>

                          <td className="border border-black p-1 text-center text-[7px]">
                            0
                          </td>

                        </tr>

                      </tbody>

                    </table>

                  </td>

                </tr>

              </tbody>

            </table>

            {/* ================================================= */}
            {/* SIGNATURE SECTION */}
            {/* ================================================= */}

            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed"
                ,
              }}
            >

              <tbody>

                <tr className="h-[55px]">

                  <td className="w-1/3 border border-black align-bottom px-2 pb-1 text-[8px]">
                    Prepared by:
                  </td>

                  <td className="w-1/3 border border-black align-bottom px-2 pb-1 text-[8px]">
                    Checked by:
                  </td>

                  <td className="w-1/3 border border-black align-bottom px-2 pb-1 text-[8px]">
                    Approved by:
                  </td>

                </tr>

              </tbody>

            </table>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="flex h-[22px] items-center justify-between border-t border-black px-2 text-[7px]">

              <span>
                FORMAT: F11(AMD-02)
              </span>

              <span>
                Rev.02
              </span>

            </div>

          </div>

          {/* ================================================= */}
          {/* SAVE BUTTON */}
          {/* ================================================= */}

          <div className="mt-4 flex justify-end print:hidden">

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded bg-[#6F4AE7] px-5 py-2 text-sm font-medium text-white"
            >
              Save Form
            </button>

          </div>

        </div>
      </div>

      {/* ===================================================== */}
      {/* PRINT CSS */}
      {/* ===================================================== */}
      <style>
        {`
          @media print {
            html,
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }

            @page {
              size: A4 landscape;
              margin: 0;
            }

            input,
            select {
              color: black !important;
              background: transparent !important;
            }

            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OperatorObservanceForm;



