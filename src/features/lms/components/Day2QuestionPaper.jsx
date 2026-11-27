import { useState, useEffect } from "react";
import logo from "../../../assets/images/NTF_logo_black.png";

const QUESTIONS = {
  1: {
    q: "पार्ट की कलर वैल्यू किस इंस्ट्रूमेंट से चेक करते हैं?",
    options: ["हाईएस्ट गेज कैलिपर", "वर्नियर", "कलर मीटर", "माइक्रोमीटर"],
  },

  2: {
    q: "पेंटेड पार्ट की DFT किस यंत्र से चेक करते हैं?",
    options: ["Gloss मीटर", "टेपर स्केल", "DFT मीटर", "माइक्रोमीटर"],
  },

  3: {
    q: "पार्ट की ग्लॉस वैल्यू कैसे चेक करते हैं?",
    options: ["Gloss मीटर", "वर्नियर कैलिपर", "स्केल", "कलर मीटर"],
  },

  4: {
    q: "इंजेक्शन मोल्डिंग में इस्तेमाल किया मोल्ड कैसे ठंडा होता है?",
    options: ["ठंडे सतह से संपर्क करें", "वायु", "पानी", "इनमें से कोई नहीं"],
  },

  5: {
    q: "प्लास्टिक रॉ मटेरियल मशीन में कहाँ लोड होता हैं",
    options: ["हॉपर", "बैरल", "मोल्ड", "इनमें से कोई नहीं"],
  },

  6: {
    q: "इंजेक्शन मोल्डिंग द्वारा निम्न में से कौनसी सामग्री नहीं बनाई गई है?",
    options: ["नट्स", "कार बम्पर", "इलेक्ट्रिकल स्विच", "कुर्सी"],
  },

  7: {
    q: "HRTC का प्रयोग किया जाता है?",
    options: [
      "मोल्ड को गर्म करने में",
      "रनर को गर्म रखने में",
      "पार्ट को गर्म करने में",
      "मटेरियल को गर्म करने में",
    ],
  },

  8: {
    q: "PP मटेरियल का पूरा नाम क्या है?",
    options: [
      "पॉली इथिलीन",
      "पॉली कार्बोनेट",
      "पॉली प्रोपलिन",
      "प्लास्टिक पॉलिमर",
    ],
  },

  9: {
    q: "स्प्रे गन से पार्ट की दूरी कितनी होनी चाहिए?",
    options: ["152-228 mm", "250-400 mm", "100-200 mm", "200-400 mm"],
  },

  10: {
    q: "प्राइमर कोट की DFT कितनी माइक्रोन होनी चाहिए?",
    options: ["8 से 14", "10 से 16", "12 से 18", "14 से 20"],
  },

  11: {
    q: "असेम्बली करते समय किन-किन बातों का ध्यान देना चाहिए?",
    options: [
      "कोई Child part मिस ना हो",
      "सबसे पहले ध्यान देना चाहिए कि कोई डिफेक्ट ना जाये।",
      "दोनों हैं",
      "इनमें से कोई नहीं।",
    ],
  },

  12: {
    q: "PU Rim में कौन सा मटेरियल यूज़ होता है?",
    options: ["ABC", "PP", "N-66", "ISO/POLYOL"],
  },

  13: {
    q: "PU Rim में कौन-कौन से डिफेक्ट आते हैं?",
    options: ["बर्स", "एयर बबल", "पिन होल", "B & C"],
  },

  14: {
    q: "TCM में यूज होने वाले RAW मटेरियल हैं।",
    options: [
      "फॉम कोर",
      "पी यू",
      "प्लास्टिक ग्रेनुअल्स",
      "वुडस्टॉक, फैब्रिक, PPGF",
    ],
  },

  15: {
    q: "TCM में क्या-क्या प्रॉब्लम आ सकती हैं।",
    options: ["सिल्वर स्टिक्स", "सिंक मार्क", "शार्ट मोल्डिंग", "उपरोक्त सभी"],
  },

  16: {
    q: "फैब्रिक ka Material kya होता है।",
    options: ["PVC", "प्लास्टिक का", "धागे का", "फाइबर का"],
  },

  17: {
    q: "L.F में उपयोग होने वाले मटेरियल का नाम लिखे",
    options: ["ISO & POLYOL", "फाइबर ग्लास", "सरफेस मैट", "उपरोक्त सभी"],
  },

  18: {
    q: "LF process में कौन सा part बनाया जाता है",
    options: ["Spoiler", "Luggage Board", "Rear Parcel Tray", "Bumper"],
  },

  19: {
    q: "फैब्रिक में क्या-क्या प्रॉब्लम आती हैं?",
    options: [
      "ओवर GSM",
      "वाइट मार्क या लाइन मार्क",
      "अनइक्वल कटिंग",
      "उपरोक्त सभी",
    ],
  },

  20: {
    q: "LB में क्या-क्या डिफेक्ट्स आते हैं :",
    options: ["पिन होल", "शॉर्ट मोल्डिंग", "एयर बबल", "उपरोक्त सभी"],
  },
};

const ALPHABET = ["a", "b", "c", "d"];

const PAGE_WIDTH = 1000;
const PAGE_GAP = 24;
const TOTAL_PAGES = 2;

// Section heading
const SectionHeading = ({ children }) => {
  return (
    <h2 className="mb-5 text-[15px] font-bold leading-tight text-black">
      {children}
    </h2>
  );
};

// Footer
const Footer = () => {
  return (
    <div className="mt-auto flex items-center justify-between px-1 pt-8 text-[10px] text-black">
      <span>F18(AMD-02)</span>

      <span>Rev. 00</span>
    </div>
  );
};

const Day2QuestionPaper = ({
  onSubmitSuccess,
  initialAnswers = {},
  isAlreadySubmitted = false,
  readOnly = false,
  initialInfo = {},
} = {}) => {
  const isViewMode = Boolean(isAlreadySubmitted || readOnly);

  const [info, setInfo] = useState({
    date: "",
    name: "",
    qualification: "",
    unit: "",
    ...initialInfo,
  });

  const [pageIndex, setPageIndex] = useState(0);

  const [answers, setAnswers] = useState(() => initialAnswers || {});
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  useEffect(() => {
    if (initialInfo && Object.keys(initialInfo).length > 0) {
      setInfo((prev) => ({ ...prev, ...initialInfo }));
    }
  }, [initialInfo]);

  const handleAnswerChange = (questionNumber, optionIndex) => {
    if (isViewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: optionIndex,
    }));
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isViewMode) return;
    const answeredCount = Object.keys(answers).length;
    setSubmitted(true);
    setSubmitMessage(
      `Day 2 Question Paper submitted successfully! (${answeredCount}/20 questions answered)`
    );
    if (onSubmitSuccess) {
      onSubmitSuccess(answers);
    }
  };

  // Interactive Question component
  const Question = ({ number }) => {
    const question = QUESTIONS[number];
    if (!question) return null;
    const isSelected = (idx) => {
      const ans =
        answers[number] !== undefined
          ? answers[number]
          : answers[String(number)];
      if (ans === undefined || ans === null) return false;
      return String(ans) === String(idx);
    };

    return (
      <div className="mb-7 break-inside-avoid">
        {/* Question */}
        <p className="text-[12px] font-medium leading-[1.45] text-black">
          <span className="mr-2">{number}.</span>
          {question.q}
        </p>

        {/* Options */}
        <div className="mt-3 pl-7">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {question.options.map((option, index) => {
              const checked = isSelected(index);
              return (
                <label
                  key={index}
                  className={`flex items-start text-[11px] leading-[1.4] rounded-md transition-all ${
                    isViewMode
                      ? checked
                        ? "bg-blue-50 text-[#0b295c] font-semibold px-2 py-1 border border-blue-200 select-text shadow-2xs"
                        : "text-slate-600 px-2 py-1 opacity-70"
                      : "text-black cursor-pointer select-none group"
                  }`}
                >
                  <input
                    type="radio"
                    name={`day2-question-${number}`}
                    value={index}
                    checked={checked}
                    disabled={isViewMode}
                    onChange={() => !isViewMode && handleAnswerChange(number, index)}
                    className={`mr-1.5 mt-0.5 h-3.5 w-3.5 accent-[#0b295c] shrink-0 ${
                      isViewMode ? "cursor-default" : "cursor-pointer"
                    }`}
                  />
                  <span className="mr-1.5 shrink-0 font-medium">({ALPHABET[index]})</span>
                  <span className={checked ? "font-bold text-[#0b295c]" : ""}>
                    {option}
                  </span>
                  {isViewMode && checked && (
                    <span className="ml-auto shrink-0 inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#0b295c] text-white">
                      ✓ Selected
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const rowWidth = TOTAL_PAGES * PAGE_WIDTH + (TOTAL_PAGES - 1) * PAGE_GAP;
  const offset = pageIndex * (PAGE_WIDTH + PAGE_GAP);

  const goToPage = (index) => {
    setPageIndex(Math.max(0, Math.min(TOTAL_PAGES - 1, index)));
  };

  // Handle input changes
  const handleChange = (field) => (event) => {
    if (isViewMode) return;
    setInfo({
      ...info,
      [field]: event.target.value,
    });
  };

  return (
    <>
      {/* =====================================================
          CONTROL BAR (PAGINATION + PRINT)
      ====================================================== */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <span className="text-sm font-medium text-gray-600">
          {pageIndex + 1} / {TOTAL_PAGES}
        </span>

        <div className="flex items-center gap-2">
          {/* PREVIOUS PAGE */}
          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-xl text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* NEXT PAGE */}
          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex >= TOTAL_PAGES - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-xl text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            ›
          </button>

          {/* PRINT */}
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Print
          </button>
        </div>
      </div>

      {/* =====================================================
          PAGER (HORIZONTAL SLIDE)
      ====================================================== */}
      <div
        className="day2-pager relative mx-auto overflow-hidden"
        style={{ width: PAGE_WIDTH }}
      >
        <div
          className="day2-pager-row flex transition-transform duration-500 ease-in-out"
          style={{
            width: rowWidth,
            gap: PAGE_GAP,
            transform: `translateX(${-offset}px)`,
          }}
        >
          {/* =====================================================
              PAGE 1
          ====================================================== */}
          <div
            className="day2-page-box shrink-0"
            style={{ width: PAGE_WIDTH }}
          >
            <div className="h-full w-full bg-white text-black">
              <div className="flex min-h-[1120px] flex-col px-[35px] py-[35px]">
                {/* =================================================
              HEADER
          ================================================== */}
                <div className="relative">
                  {/* NTF LOGO */}
                  <div className="absolute left-[25px] top-0">
                    <img
                      src={logo}
                      alt="NTF Logo"
                      className="h-[55px] w-auto object-contain"
                    />
                  </div>

                  {/* TITLE */}
                  <div className="pt-[42px] text-center">
                    <h1 className="text-[16px] font-bold uppercase">
                      DOJO TEST PAPER-DAY-2
                    </h1>
                  </div>
                </div>

                {/* =================================================
              INFORMATION BOX
          ================================================== */}
                <div className="mt-3 border border-black px-4 py-3">
                  {/* MARKS */}
                  <div className="text-[11px]">अंक - &nbsp;&nbsp; / 20</div>

                  {/* PASSING INFORMATION */}
                  <p className="mt-4 text-[11px]">
                    (संकेत- टेस्ट में पास होने के लिए 80% अंक लाना अनिवार्य है।)
                  </p>

                  {/* TIME + DATE */}
                  <div className="mt-4 grid grid-cols-2 text-[11px]">
                    {/* TIME */}
                    <div className="flex items-center">
                      <span>समय - 30 मिनिट्स</span>
                    </div>

                    {/* DATE */}
                    <div className="flex items-center">
                      <span>दिनांक-</span>

                      <input
                        type="text"
                        value={info.date}
                        readOnly={isViewMode}
                        onChange={handleChange("date")}
                        className={`ml-2 w-[180px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                          isViewMode ? "cursor-default font-medium" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* NAME / QUALIFICATION / UNIT */}
                  <div className="mt-4 flex items-center text-[11px]">
                    <span className="whitespace-nowrap">सदस्य का नाम</span>

                    <input
                      type="text"
                      value={info.name}
                      readOnly={isViewMode}
                      onChange={handleChange("name")}
                      className={`mx-2 w-[240px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                        isViewMode ? "cursor-default font-medium" : ""
                      }`}
                    />

                    <span className="whitespace-nowrap">क्वालिफिकेशन</span>

                    <input
                      type="text"
                      value={info.qualification}
                      readOnly={isViewMode}
                      onChange={handleChange("qualification")}
                      className={`mx-2 w-[220px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                        isViewMode ? "cursor-default font-medium" : ""
                      }`}
                    />

                    <span className="whitespace-nowrap">यूनिट नाम</span>

                    <input
                      type="text"
                      value={info.unit}
                      readOnly={isViewMode}
                      onChange={handleChange("unit")}
                      className={`ml-2 w-[180px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                        isViewMode ? "cursor-default font-medium" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* =================================================
              QUESTIONS
          ================================================== */}
                <div className="mt-14 grid grid-cols-2 gap-x-[80px]">
                  {/* =================================================
                LEFT COLUMN
            ================================================== */}
                  <div>
                    {/* QUALITY */}
                    <SectionHeading>Process Questions: (Quality)</SectionHeading>

                    <Question number={1} />

                    <Question number={2} />

                    <Question number={3} />

                    {/* PLASTIC INJECTION */}
                    <SectionHeading>
                      Process Questions: (Plastic Injection Moulding)s
                    </SectionHeading>

                    <Question number={4} />
                  </div>

                  {/* =================================================
                RIGHT COLUMN
            ================================================== */}
                  <div>
                    {/* EMPTY SPACE TO ALIGN QUESTION 5 */}
                    <div className="h-[35px]" />

                    <Question number={5} />

                    <Question number={6} />

                    <Question number={7} />

                    <Question number={8} />
                  </div>
                </div>

                {/* FOOTER */}
                <Footer />
              </div>
            </div>
          </div>

          {/* =====================================================
              PAGE 2
          ====================================================== */}
          <div
            className="day2-page-box shrink-0"
            style={{ width: PAGE_WIDTH }}
          >
            <div className="h-full w-full bg-white text-black">
              <div className="flex min-h-[1120px] flex-col px-[35px] py-[35px]">
                {/* =================================================
              QUESTIONS
          ================================================== */}
                <div className="grid grid-cols-2 gap-x-[80px]">
                  {/* =================================================
                LEFT COLUMN
            ================================================== */}
                  <div>
                    {/* PAINT SHOP */}
                    <SectionHeading>Process Questions: (Paint Shop)</SectionHeading>

                    <Question number={9} />

                    <Question number={10} />

                    <Question number={11} />

                    {/* PU RIM */}
                    <SectionHeading>Process Questions: ( PU Rim )</SectionHeading>

                    <Question number={12} />

                    <Question number={13} />

                    {/* TCM */}
                    <SectionHeading>Process Questions: (TCM)</SectionHeading>

                    <Question number={14} />
                  </div>

                  {/* =================================================
                RIGHT COLUMN
            ================================================== */}
                  <div>
                    {/* TOP SPACE */}
                    <div className="h-[25px]" />

                    {/* QUESTION 15 */}
                    <Question number={15} />

                    {/* QUESTION 16 */}
                    <Question number={16} />

                    {/* LB */}
                    <SectionHeading>Process Questions: (LB)</SectionHeading>

                    <Question number={17} />

                    <Question number={18} />

                    <Question number={19} />

                    <Question number={20} />
                  </div>
                </div>

                {/* FOOTER */}
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUBMIT ACTION BUTTON
      ====================================================== */}
      {!isViewMode && (
        <div className="mt-8 mb-12 flex flex-col items-center justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-[#0b295c] hover:bg-[#123977] active:scale-[0.99] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Submit</span>
          </button>

          {submitted && (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{submitMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          PRINT CSS
      ====================================================== */}
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
              size: A4 portrait;
              margin: 0;
            }

            input {
              color: black !important;
              background: transparent !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            .break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .day2-pager {
              overflow: visible !important;
            }

            .day2-pager-row {
              display: block !important;
              width: auto !important;
              height: auto !important;
              gap: 0 !important;
              transform: none !important;
              transition: none !important;
            }

            .day2-page-box {
              width: auto !important;
              height: auto !important;
            }

            .day2-page-box + .day2-page-box {
              page-break-before: always;
            }
          }
        `}
      </style>
    </>
  );
};

export default Day2QuestionPaper;
