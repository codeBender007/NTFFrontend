import { useState } from "react";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import logo from "../../../assets/images/NTF_logo_black.png";



const questions = [
  {
    english: "The objectives of the training were met",
    hindi: "प्रशिक्षण के उद्देश्य पूरे हो गए",
  },
  {
    english: "The presenters were engaging",
    hindi: "प्रस्तुतकर्ताओं की प्रस्तुति आकर्षक और रोचक थी",
  },
  {
    english: "The presentation materials were relevant",
    hindi: "प्रस्तुति में दी गई जानकारी विषय के अनुसार थी",
  },
  {
    english: "The content of the course was organised and easy to follow",
    hindi: "पाठ्यक्रम की विषय वस्तु व्यवस्थित और समझने में आसान थी",
  },
  {
    english: "The trainers were well prepared and able to answer any questions",
    hindi:
      "प्रशिक्षक अच्छी तरह से तैयार थे और सभी प्रश्नों का उत्तर देने में सक्षम थे",
  },
  {
    english: "The course length was appropriate",
    hindi: "कोर्स की समयावधि उपयुक्त थी",
  },
  {
    english:
      "The pace of the course was appropriate to the content and attendees",
    hindi: "कोर्स की गति, विषय और उपस्थित लोगों के लिए सही थी",
  },
  {
    english: "The exercises/role play were helpful and relevant",
    hindi: "अभ्यास/भूमिका-निर्वाह उपयोगी और उपयुक्त थे",
  },
];



const TrainingFeedback = () => {
  

  const [details, setDetails] = useState({
    participant: "",
    unit: "",
    department: "",
    designation: "",
    staffId: "",
    email: "",
    trainingTitle: "",
    trainingDate: "",
    faculty: "",
    duration: "",
  });


  const [answers, setAnswers] = useState(questions.map(() => ""));

  

  const handleDetailChange = (field) => (event) => {
    setDetails({
      ...details,
      [field]: event.target.value,
    });
  };

 

  const handleAnswerChange = (questionIndex, answer) => {
    const updatedAnswers = [...answers];

    updatedAnswers[questionIndex] = answer;

    setAnswers(updatedAnswers);
  };


  const renderRatingMark = (answer, option) => {
    if (answer === option) {
      return <span className="text-[25px] font-normal">✓</span>;
    }

    if (answer !== "") {
      return <span className="text-[25px] font-normal">✗</span>;
    }

    return null;
  };



  return (
    <>


      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="
            flex
            items-center
            gap-2
            bg-black
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-gray-800
          "
        >
          <PrintOutlinedIcon sx={{ fontSize: 19 }} />
          Print
        </button>
      </div>

      {/* ======================================================
          MAIN FORM
      ======================================================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1100px]
          bg-white
          p-3
          text-black
          sm:p-5
          print:max-w-none
          print:p-0
        "
      >
        {/* ====================================================
            OUTER BORDER
        ===================================================== */}

        <div className="border border-black">
          {/* ==================================================
              HEADER
          =================================================== */}

          <div className="px-4 py-5 sm:px-6">
            {/*  NTF LOGO + DOCUMENT DETAILS */}

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-center sm:text-left">
                <img
                  src={logo}
                  alt="NTF Logo"
                  className="mx-auto h-18 w-auto object-contain sm:mx-0"
                />
              </div>

              <div className="text-center text-[13px] font-semibold leading-6 sm:text-right">
                <p>Doc. No.- TF06(AMD-02)</p>

                <p>Issue Date- 18/04/2025</p>

                <p>Rev. No.- 01</p>
              </div>
            </div>

            {/* ------------------------------------------------
                FORM TITLE
            ------------------------------------------------- */}

            <div className="mt-4 flex flex-col items-center">
              <h1 className="text-center text-[20px] font-bold underline sm:text-[24px]">
                Training Feedback Form
              </h1>

              <p className="mt-1 text-[12px] font-medium text-center sm:text-[13px]">
                कृपया इस फॉर्म को ध्यानपूर्वक और ध्यानपूर्वक भरें।
              </p>
            </div>
          </div>

          {/* ==================================================
              PARTICIPANT INFORMATION TABLE
          =================================================== */}

          <div className="mx-3 border border-black sm:mx-6">
            {/* ------------------------------------------------
                NAME
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                  leading-5
                "
              >
                Name of the Participant/Employee
                <br />
                (प्रतिभागी/कर्मचारी का नाम)
              </div>

              <input
                type="text"
                value={details.participant}
                onChange={handleDetailChange("participant")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                UNIT
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Unit (यूनिट)
              </div>

              <input
                type="text"
                value={details.unit}
                onChange={handleDetailChange("unit")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                DEPARTMENT
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Department (विभाग)
              </div>

              <input
                type="text"
                value={details.department}
                onChange={handleDetailChange("department")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                DESIGNATION
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Designation (पदनाम)
              </div>

              <input
                type="text"
                value={details.designation}
                onChange={handleDetailChange("designation")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                STAFF ID
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Staff ID (स्टाफ आईडी)
              </div>

              <input
                type="text"
                value={details.staffId}
                onChange={handleDetailChange("staffId")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                EMAIL
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Email ID (ईमेल आईडी)
              </div>

              <input
                type="text"
                value={details.email}
                onChange={handleDetailChange("email")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                TRAINING TITLE
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Title of the Training (प्रशिक्षण का शीर्षक)
              </div>

              <input
                type="text"
                value={details.trainingTitle}
                onChange={handleDetailChange("trainingTitle")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                TRAINING DATE
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Date of Training (प्रशिक्षण की तिथि)
              </div>

              <input
                type="text"
                value={details.trainingDate}
                onChange={handleDetailChange("trainingDate")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                TRAINING FACULTY
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  border-b
                  sm:border-r
                  border-black
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                  leading-5
                "
              >
                Training Conducting Faculty
                <br />
                (प्रशिक्षण संचालित करने वाले प्रशिक्षक का नाम)
              </div>

              <input
                type="text"
                value={details.faculty}
                onChange={handleDetailChange("faculty")}
                className="
                  border-b
                  border-black
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>

            {/* ------------------------------------------------
                DURATION
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-[360px_1fr]">
              <div
                className="
                  px-2
                  py-[7px]
                  text-[13px]
                  font-semibold
                "
              >
                Duration (From – To) प्रशिक्षण अवधि
              </div>

              <input
                type="text"
                value={details.duration}
                onChange={handleDetailChange("duration")}
                className="
                  bg-transparent
                  px-2
                  text-[14px]
                  outline-none
                "
              />
            </div>
          </div>

          {/* ==================================================
              TRAINING FEEDBACK REPORT TITLE
          =================================================== */}

          <div className="mt-3 text-center">
            <h2 className="text-[21px] font-bold underline">
              Training Feedback Report
            </h2>
          </div>

          {/* ==================================================
              FEEDBACK TABLE
          =================================================== */}

          <div className="mx-3 mt-1 overflow-x-auto sm:mx-6">
            <table
              className="
                w-full
                min-w-[700px]
                table-fixed
                border-collapse
                border
                border-black
              "
            >
              {/* =================================================
                  TABLE HEADER
              ================================================== */}

              <thead>
                <tr>
                  {/* QUESTION */}
                  <th
                    className="
                      w-[53%]
                      border
                      border-black
                      px-2
                      py-3
                      text-left
                      text-[13px]
                      font-bold
                    "
                  >
                    <div>
                      Please rate the following points on a given scale.
                    </div>

                    <div className="mt-1 font-medium">
                      कृपया नीचे दिए गए बिंदुओं को रेटिंग दें।
                    </div>
                  </th>

                  {/* STRONGLY AGREE */}
                  <th
                    className="
                      w-[9.4%]
                      border
                      border-black
                      px-1
                      py-2
                      text-center
                      text-[12px]
                      font-bold
                      leading-4
                    "
                  >
                    Strongly
                    <br />
                    Agree
                  </th>

                  {/* AGREE */}
                  <th
                    className="
                      w-[9.4%]
                      border
                      border-black
                      px-1
                      py-2
                      text-center
                      text-[12px]
                      font-bold
                    "
                  >
                    Agree
                  </th>

                  {/* DISAGREE */}
                  <th
                    className="
                      w-[9.4%]
                      border
                      border-black
                      px-1
                      py-2
                      text-center
                      text-[12px]
                      font-bold
                    "
                  >
                    Disagree
                  </th>

                  {/* STRONGLY DISAGREE */}
                  <th
                    className="
                      w-[9.4%]
                      border
                      border-black
                      px-1
                      py-2
                      text-center
                      text-[12px]
                      font-bold
                      leading-4
                    "
                  >
                    Strongly
                    <br />
                    Disagree
                  </th>

                  {/* NOT RELEVANT */}
                  <th
                    className="
                      w-[9.4%]
                      border
                      border-black
                      px-1
                      py-2
                      text-center
                      text-[12px]
                      font-bold
                      leading-4
                    "
                  >
                    Not
                    <br />
                    relevant
                    <br />
                    to this
                    <br />
                    event
                  </th>
                </tr>
              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================== */}

              <tbody>
                {questions.map((question, index) => (
                  <tr key={index}>
                    {/* QUESTION */}
                    <td
                      className="
                        border
                        border-black
                        px-2
                        py-[6px]
                        align-middle
                        text-[12px]
                        font-semibold
                        leading-[15px]
                      "
                    >
                      <div>
                        {index + 1}. {question.english}
                      </div>

                      <div className="font-medium">({question.hindi})</div>
                    </td>

                    {/* STRONGLY AGREE */}
                    <td
                      onClick={() =>
                        handleAnswerChange(index, "Strongly Agree")
                      }
                      className="
                        h-[48px]
                        cursor-pointer
                        border
                        border-black
                        text-center
                        align-middle
                      "
                    >
                      {renderRatingMark(answers[index], "Strongly Agree")}
                    </td>

                    {/* AGREE */}
                    <td
                      onClick={() => handleAnswerChange(index, "Agree")}
                      className="
                        h-[48px]
                        cursor-pointer
                        border
                        border-black
                        text-center
                        align-middle
                      "
                    >
                      {renderRatingMark(answers[index], "Agree")}
                    </td>

                    {/* DISAGREE */}
                    <td
                      onClick={() => handleAnswerChange(index, "Disagree")}
                      className="
                        h-[48px]
                        cursor-pointer
                        border
                        border-black
                        text-center
                        align-middle
                      "
                    >
                      {renderRatingMark(answers[index], "Disagree")}
                    </td>

                    {/* STRONGLY DISAGREE */}
                    <td
                      onClick={() =>
                        handleAnswerChange(index, "Strongly Disagree")
                      }
                      className="
                        h-[48px]
                        cursor-pointer
                        border
                        border-black
                        text-center
                        align-middle
                      "
                    >
                      {renderRatingMark(answers[index], "Strongly Disagree")}
                    </td>

                    {/* NOT RELEVANT */}
                    <td
                      onClick={() => handleAnswerChange(index, "Not Relevant")}
                      className="
                        h-[48px]
                        cursor-pointer
                        border
                        border-black
                        text-center
                        align-middle
                      "
                    >
                      {renderRatingMark(answers[index], "Not Relevant")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              SIGNATURE
          =================================================== */}

          <div className="flex justify-end px-4 pb-16 pt-10 sm:px-12 sm:pb-24 sm:pt-16">
            <div className="text-right text-[13px] font-medium">
              (Signature of participant/ &nbsp;प्रतिभागी के हस्ताक्षर)
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          PRINT CSS
      ======================================================= */}

      <style>
        {`
          @media print {

            body {
              margin: 0;
              padding: 0;
              background: white;
            }

            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            .print\\:hidden {
              display: none !important;
            }

            input {
              color: black !important;
              background: transparent !important;
            }

            * {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default TrainingFeedback;
