import { useState } from "react";
import ntfLogo from "../../../assets/images/NTF_logo_black.png";

const TrainingEffectivenessForm = () => {
  const [formData, setFormData] = useState({
    trainingTopic: "",
    trainingDateVenue: "",
    evaluationDate: "",
    trainer: "",
    participant: "",
    department: "",
    coordinator: "",

    ratings: {
      awareness: "",
      knowledge: "",
      skill: "",
      confidence: "",
      attitude: "",
      trainOthers: "",
      other: "",
    },

    remarks: {
      awareness: "",
      knowledge: "",
      skill: "",
      confidence: "",
      attitude: "",
      trainOthers: "",
      other: "",
    },

    otherObjective: "",
    actionRequired: "",
    retraining: false,
    furtherTraining: false,
    furtherTrainingArea: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [name]: value,
      },
    }));
  };

  const handleRemarksChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      remarks: {
        ...prev.remarks,
        [name]: value,
      },
    }));
  };

  const totalRating = Object.values(formData.ratings).reduce(
    (total, value) => total + (Number(value) || 0),
    0
  );

  const effectivenessIndex =
    totalRating > 0 ? ((totalRating / 28) * 100).toFixed(2) : "";

  const getEffectivenessRating = () => {
    if (!effectivenessIndex) return "";

    const percentage = Number(effectivenessIndex);

    if (percentage < 60) return "Not Effective";
    if (percentage <= 75) return "Effective";
    if (percentage <= 90) return "Highly Effective";

    return "Excellent";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Training Effectiveness Form:", formData);
    console.log("Total Rating:", totalRating);
    console.log("Effectiveness Index:", effectivenessIndex);
  };

  const ratingOptions = (
    value,
    onChange
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rating-select"
    >
      <option value=""></option>
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
    </select>
  );

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            background: #eeeeee;
            font-family: Arial, Helvetica, sans-serif;
            color: #111111;
          }

          /* =========================
             A4 PAGE
          ========================= */
.training-page {
  width: 100%;
  min-height: 1123px;
  margin: 0;
  background: #ffffff;
  position: relative;
  padding: 32px 56px 55px 56px;
  overflow: hidden;
}

          /* =========================
             HEADER
          ========================= */

          .training-header {
            position: relative;
            width: 100%;
            height: 60px;
            border-bottom: 1px solid #4f81bd;
            margin-bottom: 20px;
          }

          .training-logo {
            position: absolute;
            left: 0;
            top: -2px;
            width: 74px;
            height: 48px;
            object-fit: contain;
            object-position: left top;
          }

          .training-title {
            position: absolute;
            left: 50%;
            top: 24px;
            transform: translateX(-50%);
            font-size: 20px;
            line-height: 22px;
            font-weight: 400;
            color: #1f4e79;
            white-space: nowrap;
            text-align: center;
          }

          /* =========================
             TOP FIELDS
          ========================= */

          .top-fields {
            margin-top: 0;
          }

          .field-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0;
            margin-bottom: 4px;
          }

          .field-row.single {
            grid-template-columns: 1fr;
          }

          .field {
            display: flex;
            align-items: flex-end;
            min-height: 19px;
          }

          .field-label {
            font-size: 14px;
            line-height: 18px;
            white-space: nowrap;
            margin-right: 4px;
          }

          .field-input {
            flex: 1;
            min-width: 0;
            height: 20px;
            padding: 0 2px;
            border: none;
            border-bottom: 1px solid #555555;
            outline: none;
            background: transparent;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
          }

          /* =========================
             SECTION TITLES
          ========================= */

          .section-title {
            font-size: 14px;
            line-height: 17px;
            font-weight: bold;
            color: #1f4e79;
            margin-top: 27px;
            margin-bottom: 4px;
          }

          .instruction {
            font-size: 13px;
            line-height: 17px;
            margin-bottom: 8px;
          }

          /* =========================
             RATING TABLE
          ========================= */

          .rating-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 13px;
          }

          .rating-table th,
          .rating-table td {
            border: 1px solid #777777;
            padding: 5px 7px;
            vertical-align: middle;
          }

          .rating-table th {
            font-size: 13px;
            font-weight: bold;
            text-align: left;
            height: 44px;
          }

          .rating-table th.serial,
          .rating-table th.rating {
            text-align: center;
          }

          .rating-table .serial {
            width: 7%;
            text-align: center;
          }

          .rating-table .objective {
            width: 40%;
          }

          .rating-table .rating {
            width: 16%;
            text-align: center;
          }

          .rating-table .remarks {
            width: 37%;
          }

          .rating-table td {
            height: 43px;
          }

          .rating-table td.objective-cell {
            line-height: 16px;
          }

          .rating-select {
            width: 100%;
            height: 30px;
            border: none;
            outline: none;
            background: transparent;
            font-size: 13px;
            text-align: center;
            cursor: pointer;
          }

          .remarks-input {
            width: 100%;
            height: 30px;
            border: none;
            outline: none;
            background: transparent;
            font-size: 13px;
          }

          .other-input {
            display: block;
            width: 90%;
            height: 19px;
            margin-top: 2px;
            border: none;
            border-bottom: 1px solid #777777;
            outline: none;
            background: transparent;
            font-size: 12px;
          }

          .total-row td {
            height: 27px;
            font-weight: normal;
          }

          .total-label {
            text-align: right;
            padding-right: 10px !important;
          }

          /* =========================
             FINAL REVIEW
          ========================= */

          .review-section {
            margin-top: 20px;
          }

          .review-title {
            font-size: 14px;
            line-height: 18px;
            color: #1f4e79;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .index-row {
            display: flex;
            align-items: flex-end;
            font-size: 12px;
            margin-bottom: 3px;
          }

          .index-line {
            width: 190px;
            height: 19px;
            margin-left: 5px;
            padding: 0 2px;
            border: none;
            border-bottom: 1px solid #777777;
            outline: none;
            background: transparent;
            font-size: 12px;
          }

          .formula {
            font-size: 9px;
            color: #333333;
            margin-left: 0;
            margin-bottom: 11px;
          }

          .effectiveness-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 6px;
          }

          .checkbox-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            font-size: 11px;
            width: 100%;
          }

          .checkbox-item {
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          }

          .checkbox-item input {
            appearance: none;
            width: 12px;
            height: 12px;
            margin: 0;
            border: 1px solid #555555;
            background: #ffffff;
            position: relative;
          }

          .checkbox-item input:checked::after {
            content: "✓";
            position: absolute;
            left: 1px;
            top: -4px;
            font-size: 13px;
          }

          .action-row {
            margin-top: 13px;
            font-size: 12px;
          }

          .action-options {
            display: inline-flex;
            gap: 38px;
            margin-left: 25px;
          }

          .if-yes {
            margin-top: 7px;
            font-size: 11px;
          }

          .further-row {
            display: flex;
            align-items: center;
            gap: 30px;
            margin-top: 5px;
            font-size: 11px;
          }

          .training-area {
            margin-top: 7px;
            font-size: 10px;
            line-height: 13px;
          }

          .area-line {
            display: block;
            width: 100%;
            height: 21px;
            border: none;
            border-bottom: 1px solid #777777;
            outline: none;
            background: transparent;
          }

          /* =========================
             SIGNATURE
          ========================= */

          .signature-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-top: 19px;
          }

          .signature-table td {
            border: 1px solid #777777;
            height: 57px;
            vertical-align: bottom;
            text-align: center;
            padding-bottom: 7px;
            font-size: 11px;
          }

          /* =========================
             FOOTER
          ========================= */

          .footer {
            position: absolute;
            left: 56px;
            right: 56px;
            bottom: 25px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #222222;
          }

          /* =========================
             PAGE 2
          ========================= */

          .page-break {
            page-break-before: always;
          }

          .criteria-page-header {
            margin-bottom: 50px;
          }

          .criteria-title {
            text-align: center;
            font-size: 13px;
            line-height: 17px;
            font-weight: bold;
            color: #1f4e79;
            margin-bottom: 4px;
          }

          .criteria-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 11px;
          }

          .criteria-table th,
          .criteria-table td {
            border: 1px solid #777777;
            padding: 5px 7px;
            vertical-align: middle;
          }

          .criteria-table th {
            font-size: 11px;
            font-weight: bold;
            text-align: left;
            height: 32px;
          }

          .criteria-table .score-col {
            width: 9%;
            text-align: center;
          }

          .criteria-table .level-col {
            width: 23%;
          }

          .criteria-table .explanation-col {
            width: 68%;
          }

          .criteria-table td {
            line-height: 14px;
          }

          .criteria-table .score-cell {
            text-align: center;
          }

          .criteria-table .level-cell {
            font-weight: normal;
          }

          /* =========================
             PRINT
          ========================= */

          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            .training-page {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 32px 56px 55px 56px;
              border: none;
              page-break-after: always;
              overflow: hidden;
            }

            .training-page:last-child {
              page-break-after: auto;
            }
          }

          /* =========================
             SCREEN RESPONSIVE
          ========================= */

          @media screen and (max-width: 820px) {
            body {
              overflow-x: auto;
              background: #f4f4f4;
            }

            .training-page {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 16px 14px 40px 14px;
              overflow: visible;
            }

            .training-header {
              height: auto;
              min-height: 46px;
              margin-bottom: 12px;
              position: relative;
            }

            .training-logo {
              width: 50px;
              height: 36px;
              top: 0;
            }

            .training-title {
              left: 58px;
              top: 9px;
              transform: none;
              font-size: 13px;
              line-height: 16px;
              white-space: normal;
              text-align: left;
            }

            .field-row {
              grid-template-columns: 1fr;
            }

            .field-label {
              font-size: 12px;
              white-space: normal;
            }

            .field-input {
              font-size: 13px;
            }

            .section-title {
              margin-top: 18px;
              font-size: 13px;
            }

            .instruction {
              font-size: 12px;
            }

            .rating-table {
              font-size: 11px;
            }

            .rating-table th,
            .rating-table td {
              padding: 4px 3px;
            }

            .rating-table th {
              font-size: 11px;
              height: auto;
            }

            .rating-table td {
              height: 40px;
            }

            .rating-table .objective {
              width: 38%;
            }

            .rating-table .rating {
              width: 18%;
            }

            .rating-table .remarks {
              width: 37%;
            }

            .rating-select {
              font-size: 12px;
              height: 26px;
            }

            .remarks-input {
              font-size: 11px;
            }

            .other-input {
              width: 100%;
              font-size: 11px;
            }

            .review-section {
              margin-top: 14px;
            }

            .index-line {
              width: 140px;
            }

            .checkbox-row {
              flex-wrap: wrap;
              gap: 6px 14px;
              align-items: flex-start;
            }

            .checkbox-item {
              font-size: 10px;
            }

            .action-options {
              margin-left: 8px;
              gap: 20px;
            }

            .signature-table {
              font-size: 10px;
            }

            .signature-table td {
              height: 48px;
            }

            .criteria-title {
              font-size: 12px;
            }

            .criteria-table {
              font-size: 10px;
            }

            .criteria-table th,
            .criteria-table td {
              padding: 4px 3px;
            }

            .criteria-table th {
              font-size: 10px;
              height: auto;
            }

            .footer {
              left: 14px;
              right: 14px;
              bottom: 14px;
            }
          }
        `}
      </style>

      {/* =====================================================
          PAGE 1
      ===================================================== */}

      <div className="training-page">

        <div className="training-header">
          <img
            src={ntfLogo}
            alt="NTF"
            className="training-logo"
          />

          <div className="training-title">
            Training Effectiveness Evaluation Form
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* TOP FIELDS */}

          <div className="top-fields">

            <div className="field-row single">
              <div className="field">
                <span className="field-label">
                  Training Subject/Topic:
                </span>

                <input
                  type="text"
                  name="trainingTopic"
                  value={formData.trainingTopic}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-row">

              <div className="field">
                <span className="field-label">
                  Date & Venue of Training:
                </span>

                <input
                  type="text"
                  name="trainingDateVenue"
                  value={formData.trainingDateVenue}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

              <div className="field">
                <span className="field-label">
                  Effectiveness Evaluation Date:
                </span>

                <input
                  type="text"
                  name="evaluationDate"
                  value={formData.evaluationDate}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

            </div>

            <div className="field-row">

              <div className="field">
                <span className="field-label">
                  Trainer/Faculty:
                </span>

                <input
                  type="text"
                  name="trainer"
                  value={formData.trainer}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

              <div className="field">
                <span className="field-label">
                  Name of Participant:
                </span>

                <input
                  type="text"
                  name="participant"
                  value={formData.participant}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

            </div>

            <div className="field-row">

              <div className="field">
                <span className="field-label">
                  Department:
                </span>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

              <div className="field">
                <span className="field-label">
                  Training Coordinator:
                </span>

                <input
                  type="text"
                  name="coordinator"
                  value={formData.coordinator}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

            </div>

          </div>

          {/* INSTRUCTION */}

          <div className="section-title">
            Instruction:
          </div>

          <div className="instruction">
            <strong>Rating by HOD</strong> (On scale of 0-4, refer to
            effectiveness scoring criteria):
          </div>

          {/* RATING TABLE */}

          <table className="rating-table">

            <thead>
              <tr>
                <th className="serial">
                  S.NO
                </th>

                <th className="objective">
                  Training Objectives
                </th>

                <th className="rating">
                  Rating (0–4)
                </th>

                <th className="remarks">
                  Remarks (Optional)
                </th>
              </tr>
            </thead>

            <tbody>

              {/* 1 */}

              <tr>
                <td className="serial">1</td>

                <td className="objective-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                  General Awareness
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.awareness,
                    (value) =>
                      handleRatingChange("awareness", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.awareness}
                    onChange={(e) =>
                      handleRemarksChange(
                        "awareness",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* 2 */}

              <tr>
                <td className="serial">2</td>

                <td className="objective-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                  Improvement in Knowledge
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.knowledge,
                    (value) =>
                      handleRatingChange("knowledge", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.knowledge}
                    onChange={(e) =>
                      handleRemarksChange(
                        "knowledge",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* 3 */}

              <tr>
                <td className="serial">3</td>

                <td className="objective-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                  Improvement in Skill
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.skill,
                    (value) =>
                      handleRatingChange("skill", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.skill}
                    onChange={(e) =>
                      handleRemarksChange(
                        "skill",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* 4 */}

              <tr>
                <td className="serial">4</td>

                <td className="objective-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                  Build Confidence
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.confidence,
                    (value) =>
                      handleRatingChange("confidence", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.confidence}
                    onChange={(e) =>
                      handleRemarksChange(
                        "confidence",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* 5 */}

              <tr>
                <td className="serial">5</td>

                <td className="objective-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                  Develop positive attitude towards the subject
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.attitude,
                    (value) =>
                      handleRatingChange("attitude", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.attitude}
                    onChange={(e) =>
                      handleRemarksChange(
                        "attitude",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* 6 */}

              <tr>
                <td className="serial">6</td>

                <td className="objective-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                  Potential to Train/Guide others
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.trainOthers,
                    (value) =>
                      handleRatingChange("trainOthers", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.trainOthers}
                    onChange={(e) =>
                      handleRemarksChange(
                        "trainOthers",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* 7 */}

              <tr>
                <td className="serial">7</td>

                <td className="objective-cell">
                  <span contentEditable suppressContentEditableWarning spellCheck={false}>
                    Other (Specify):
                  </span>

                  <input
                    type="text"
                    value={formData.otherObjective}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        otherObjective: e.target.value,
                      }))
                    }
                    className="other-input"
                  />
                </td>

                <td>
                  {ratingOptions(
                    formData.ratings.other,
                    (value) =>
                      handleRatingChange("other", value)
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    value={formData.remarks.other}
                    onChange={(e) =>
                      handleRemarksChange(
                        "other",
                        e.target.value
                      )
                    }
                    className="remarks-input"
                  />
                </td>
              </tr>

              {/* TOTAL */}

              <tr className="total-row">
                <td
                  colSpan="2"
                  className="total-label"
                >
                  Total Rating
                </td>

                <td className="rating">
                  {totalRating}
                </td>

                <td></td>
              </tr>

            </tbody>
          </table>

          {/* FINAL REVIEW */}

          <div className="review-section">

            <div className="review-title">
              Final Review & Action:
            </div>

            <div className="index-row">
              <span>
                Overall Training Effectiveness Index %:
              </span>

              <input
                type="text"
                value={effectivenessIndex}
                readOnly
                className="index-line"
              />
            </div>

            <div className="formula">
              <span>
                Effectiveness Index =
              </span>
              <span style={{ marginLeft: "5px" }}>
                Total Rating
              </span>
              <span style={{ margin: "0 4px" }}>
                × 100
              </span>
              <br />
              <span style={{ marginLeft: "107px" }}>
                No. of Objectives Rated × 4
              </span>
            </div>

            <div className="effectiveness-title">
              Effectiveness Rating:
            </div>

            <div className="checkbox-row">

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={
                    getEffectivenessRating() ===
                    "Not Effective"
                  }
                  readOnly
                />
                Not Effective (&lt;60%)
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={
                    getEffectivenessRating() ===
                    "Effective"
                  }
                  readOnly
                />
                Effective (60–75%)
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={
                    getEffectivenessRating() ===
                    "Highly Effective"
                  }
                  readOnly
                />
                Highly Effective (76–90%)
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={
                    getEffectivenessRating() ===
                    "Excellent"
                  }
                  readOnly
                />
                Excellent (&gt;90%)
              </label>

            </div>

            {/* FURTHER ACTION */}

            <div className="action-row">

              <strong>
                Further Action Required:
              </strong>

              <span className="action-options">

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={
                      formData.actionRequired === "yes"
                    }
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        actionRequired:
                          prev.actionRequired === "yes"
                            ? ""
                            : "yes",
                      }))
                    }
                  />
                  Yes
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={
                      formData.actionRequired === "no"
                    }
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        actionRequired:
                          prev.actionRequired === "no"
                            ? ""
                            : "no",
                      }))
                    }
                  />
                  No
                </label>

              </span>

            </div>

            <div className="if-yes">
              - If Yes:
            </div>

            <div className="further-row">

              <label className="checkbox-item">

                <input
                  type="checkbox"
                  checked={formData.retraining}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      retraining: !prev.retraining,
                    }))
                  }
                />

                Retraining

              </label>

              <label className="checkbox-item">

                <input
                  type="checkbox"
                  checked={formData.furtherTraining}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      furtherTraining:
                        !prev.furtherTraining,
                    }))
                  }
                />

                Further Training Required on subject

              </label>

            </div>

            <div className="training-area">
              Further Training Required on subject
              (Specify the area or competency need to be addressed)
            </div>

            <input
              type="text"
              value={formData.furtherTrainingArea}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  furtherTrainingArea:
                    e.target.value,
                }))
              }
              className="area-line"
            />

            <div className="area-line"></div>
            <div className="area-line"></div>

          </div>

          {/* SIGNATURE */}

          <table className="signature-table">
            <tbody>
              <tr>
                <td>
                  Head of Department
                </td>

                <td>
                  Manager - HRD/Training
                </td>
              </tr>
            </tbody>
          </table>

        </form>

        {/* FOOTER */}

        <div className="footer">
          <span>
            FORMAT: F11(AMD-02)
          </span>

          <span>
            Rev:02
          </span>
        </div>

      </div>

      {/* =====================================================
          PAGE 2
      ===================================================== */}

      <div className="training-page page-break">

        <div className="training-header">
          <img
            src={ntfLogo}
            alt="NTF"
            className="training-logo"
          />

          <div className="training-title">
            Training Effectiveness Evaluation Form
          </div>
        </div>

        <div className="criteria-title">
          Effectiveness Scoring Criteria (for HOD Ratings)
        </div>

        <table className="criteria-table">

          <thead>
            <tr>

              <th className="score-col">
                Score
                <br />
                Range
              </th>

              <th className="level-col">
                Level
              </th>

              <th className="explanation-col">
                Detailed Explanation
              </th>

            </tr>
          </thead>

          <tbody>

            <tr>

              <td className="score-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                0
              </td>

              <td className="level-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                Not Achieved
              </td>

              <td contentEditable suppressContentEditableWarning spellCheck={false}>
                No noticeable improvement or understanding of the topic.
                Unable to apply the knowledge/skill covered during the
                training.
              </td>

            </tr>

            <tr>

              <td className="score-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                1
              </td>

              <td className="level-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                Minimal
                <br />
                Achievement
              </td>

              <td contentEditable suppressContentEditableWarning spellCheck={false}>
                A little understanding on the subject. Very little
                improvement observed. Employee remembers training points
                only superficially or inconsistently. No significant
                application in daily work. Performance/behavior remains
                largely unchanged. Requires retraining or close supervision.
              </td>

            </tr>

            <tr>

              <td className="score-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                2
              </td>

              <td className="level-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                Partial
                <br />
                Achievement
              </td>

              <td contentEditable suppressContentEditableWarning spellCheck={false}>
                Subject understanding is satisfactory. Some improvement
                visible but inconsistent. Employee applies training
                occasionally or in limited situations. Awareness exists but
                not translated into reliable practice. Still requires
                support, reminders, or monitoring to sustain.
              </td>

            </tr>

            <tr>

              <td className="score-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                3
              </td>

              <td className="level-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                Largely
                <br />
                Achieved
              </td>

              <td contentEditable suppressContentEditableWarning spellCheck={false}>
                Understand the subject fairly and Clear improvement seen.
                Employee regularly applies learning in work, shows good
                awareness and consistency. Training objectives are mostly
                met and benefits (quality, productivity, safety, behavior)
                are noticeable. Requires little supervision.
              </td>

            </tr>

            <tr>

              <td className="score-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                4
              </td>

              <td className="level-cell" contentEditable suppressContentEditableWarning spellCheck={false}>
                Fully Achieved
              </td>

              <td contentEditable suppressContentEditableWarning spellCheck={false}>
                Understand the subject completely and Training objectives
                completely achieved. Employee demonstrates strong,
                consistent, and independent application of learning.
                Sustained improvement is evident. Acts as a role model or
                reference for others, adding measurable value to the
                organization.
              </td>

            </tr>

          </tbody>

        </table>

        <div className="footer">
          <span>
            FORMAT: F11(AMD-02)
          </span>

          <span>
            Rev:02
          </span>
        </div>

      </div>
    </>
  );
};

export default TrainingEffectivenessForm;