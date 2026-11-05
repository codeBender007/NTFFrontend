import { useRef, useState } from "react";
import logo from "../../../assets/images/NTF_logo_black.png";

const QUESTIONS = {
  general: [
    {
      q: "कंपनी कब START हुई?",
      options: ["1990", "1984", "2000", "1980"],
    },
    {
      q: "कंपनी का MAIN प्लांट कहाँ है?",
      options: ["Sanand Gujarat", "Neemrana", "IMT Manesar", "Delhi"],
    },
    {
      q: "NTF की उत्पाद श्रेणी क्या है?",
      options: ["Metal", "Plastic", "Plating", "Rubber"],
    },
    {
      q: "NTF का पहला प्रोडक्ट कौन सा है?",
      options: ["Hard Top", "Bumper", "Spoiler", "Roof Garnish"],
    },
    {
      q: "NTF में कौन सा Process नहीं है?",
      options: ["PIM", "Paint Shop", "Casting", "TCM"],
    },
    {
      q: "निम्नलिखित में से कौन सा 5S नहीं है",
      options: ["Seiri", "Seiketsu", "Seiso", "Shitsuke"],
    },
    {
      q: "काइज़न क्या है?",
      options: ["निरंतर सुधार", "अंतरायिक सुधार", "असंतत सुधार", "सुधार रोकें"],
    },
    {
      q: "पर्यावरण को क्या दूषित करता है?",
      options: ["Waste", "Process", "Part", "Man"],
    },
  ],

  safety: [
    {
      q: "आग कितने प्रकार की होती है?",
      options: ["3", "4", "5", "6"],
    },
    {
      q: "प्राथमिक चिकित्सा से क्या अभिप्राय है?",
      options: [
        "मरीज को दी जाने वाली पूर्व चिकित्सा",
        "मरीज को दी जाने वाली अस्पताल चिकित्सा",
        "दोनों हैं",
        "इनमें से कोई नहीं",
      ],
    },
    {
      q: "निम्नलिखित में से कौन PPE किट का हिस्सा नहीं है?",
      options: ["दस्ताने", "सुरक्षा चश्मा", "हेलमेट", "पेचकस"],
    },
    {
      q: "फायर एक्सटिंगुइशर में PASS शब्द की परिभाषा में इनमें से कौन सा शब्द नहीं है",
      options: ["Pull", "Squeeze", "Alert", "Sweep"],
    },
    {
      q: "ABC Type Fire Extinguisher को कौन-सी आग पर प्रयोग करेंगे?",
      options: [
        "हर प्रकार की आग पर",
        "केवल बिजली के सामान पर",
        "केवल लकड़ी की वस्तुओं पर",
        "इनमें से कोई भी नहीं",
      ],
    },
  ],

  maintenance: [
    {
      q: "Maintenance क्या होता है?",
      options: [],
    },
    {
      q: "इंडस्ट्री में कितना वोल्टेज यूज़ करते हैं?",
      options: ["100", "440", "200", "50"],
    },
    {
      q: "Break down maintenance क्या है?",
      options: [
        "First Maintenance",
        "Maintenance when machine stops",
        "Last Maintenance",
        "None of above",
      ],
    },
  ],

  stores: [
    {
      q: "FIFO से आप क्या समझते हो?",
      options: [
        "First In First Out",
        "Last in Last Out",
        "Out first Out last",
        "Thermocompression",
      ],
    },
    {
      q: "मटेरियल इश्यू करते समय किन किन बातों का ध्यान रखना चाहिए?",
      options: ["DATE", "SAFETY", "GRADE", "All of the above"],
    },
  ],

  abnormality: [
    {
      q: "बिजली जाने के दौरान बने हुए पार्ट की हैंडलिंग:",
      options: [
        "बिजली जाने के दौरान बने हुए पार्ट को बिना मार्क किये ना रखें",
        "बिजली जाने के दौरान बने हुए पार्ट को लाल बिन में रखें",
        "उपरोक्त दोनों कथन सही हैं",
        "उपरोक्त दोनों कथन गलत हैं",
      ],
    },
    {
      q: "Inspection के दौरान Reject पार्ट की हैंडलिंग:",
      options: [
        "Reject पार्ट को बिना मार्क किये और लाल बिन के बाहर ना रखें",
        "Reject पार्ट को हमेशा मार्क करके लाल बिन में रखें",
        "उपरोक्त दोनों कथन सही हैं",
        "उपरोक्त दोनों कथन गलत हैं",
      ],
    },
  ],
};

const ALPHABET = ["a", "b", "c", "d"];

const PAGE_WIDTH = 1000;
const PAGE_GAP = 24;
const TOTAL_PAGES = 2;

const Day1QuestionPaper = () => {
  const [info, setInfo] = useState({
    time: "30 मिनट",
    date: "",
    name: "",
    designation: "",
    unit: "",
  });

  const [pageIndex, setPageIndex] = useState(0);
  const controlRef = useRef(null);

  const rowWidth = TOTAL_PAGES * PAGE_WIDTH + (TOTAL_PAGES - 1) * PAGE_GAP;
  const offset = pageIndex * (PAGE_WIDTH + PAGE_GAP);

  const goToPage = (index) => {
    setPageIndex(Math.max(0, Math.min(TOTAL_PAGES - 1, index)));
  };

  // Change information fields
  const handleInfoChange = (field) => (event) => {
    setInfo({
      ...info,
      [field]: event.target.value,
    });
  };

  // Question component
  const Question = ({ number, question }) => {
    return (
      <div className="mb-5 break-inside-avoid">
        <p className="text-[12px] font-medium leading-[1.4] text-black">
          <span className="mr-1">{number}.</span>
          {question.q}
        </p>

        {question.options.length > 0 ? (
          <div className="mt-2 pl-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start text-[11px] leading-[1.4] text-black"
                >
                  <span className="mr-1">({ALPHABET[index]})</span>

                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="ml-4 mt-3 w-4/5 border-b border-dotted border-gray-500" />
        )}
      </div>
    );
  };

  // Footer
  const Footer = () => {
    return (
      <div className="mt-auto flex items-center justify-between px-2 pt-8 text-[10px] text-black">
        <span>F18(AMD-02)</span>

        <span>Rev. 00</span>
      </div>
    );
  };

  return (
    <>
      {/* =====================================================
          CONTROL BAR (PAGINATION + PRINT)
      ====================================================== */}
      <div
        ref={controlRef}
        className="mb-4 flex items-center justify-between print:hidden"
      >
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
        className="day1-pager relative mx-auto overflow-hidden"
        style={{ width: PAGE_WIDTH }}
      >
        <div
          className="day1-pager-row flex transition-transform duration-500 ease-in-out"
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
            className="day1-page-box shrink-0"
            style={{ width: PAGE_WIDTH }}
          >
            <div className="h-full w-full bg-white text-black">
              <div className="min-h-[1120px] px-[35px] py-[35px]">
                {/* =====================================================
              HEADER
          ====================================================== */}
                <div className="relative">
                  {/* NTF LOGO */}
                  <div className="absolute left-0 top-0">
                    <img
                      src={logo}
                      alt="NTF Logo"
                      className="h-[58px] w-auto object-contain"
                    />
                  </div>

                  {/* TITLE */}
                  <div className="pt-[40px] text-center">
                    <h1 className="text-[16px] font-bold">DOJO TEST PAPER- DAY-1</h1>
                  </div>
                </div>

                {/* =====================================================
              INFORMATION BOX
          ====================================================== */}
                <div className="mt-4 border border-black px-5 py-4">
                  {/* MARKS */}
                  <div className="flex items-center text-[12px]">
                    <span>अंक -</span>

                    <span className="ml-2">/ 20</span>
                  </div>

                  {/* PASSING INFORMATION */}
                  <p className="mt-4 text-[11px]">
                    (ऑब्जेक्टिव टेस्ट में पास होने के लिए 80% अंक लाना अनिवार्य है।)
                  </p>

                  {/* TIME + DATE */}
                  <div className="mt-4 grid grid-cols-2 text-[12px]">
                    {/* TIME */}
                    <div className="flex items-center">
                      <span>समय -</span>

                      <input
                        type="text"
                        value={info.time}
                        onChange={handleInfoChange("time")}
                        className="ml-2 w-[130px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                      />
                    </div>

                    {/* DATE */}
                    <div className="flex items-center">
                      <span>दिनांक-</span>

                      <input
                        type="text"
                        value={info.date}
                        onChange={handleInfoChange("date")}
                        className="ml-2 w-[180px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                      />
                    </div>
                  </div>

                  {/* NAME / DESIGNATION / UNIT */}
                  <div className="mt-5 flex items-center text-[12px]">
                    <span className="whitespace-nowrap">सदस्य का नाम</span>

                    <input
                      type="text"
                      value={info.name}
                      onChange={handleInfoChange("name")}
                      className="mx-2 w-[250px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                    />

                    <span className="whitespace-nowrap">क्वालिफिकेशन</span>

                    <input
                      type="text"
                      value={info.designation}
                      onChange={handleInfoChange("designation")}
                      className="mx-2 w-[220px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                    />

                    <span className="whitespace-nowrap">यूनिट नाम</span>

                    <input
                      type="text"
                      value={info.unit}
                      onChange={handleInfoChange("unit")}
                      className="ml-2 w-[180px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none"
                    />
                  </div>
                </div>

                {/* =====================================================
              QUESTIONS
          ====================================================== */}
                <div className="mt-8 grid grid-cols-2 gap-x-[80px]">
                  {/* =================================================
                LEFT COLUMN
            ================================================== */}
                  <div>
                    {/* GENERAL QUESTIONS */}
                    <h2 className="mb-5 text-[16px] font-bold">General Questions:</h2>

                    <Question number={1} question={QUESTIONS.general[0]} />

                    <Question number={2} question={QUESTIONS.general[1]} />

                    <Question number={3} question={QUESTIONS.general[2]} />

                    <Question number={4} question={QUESTIONS.general[3]} />

                    <Question number={5} question={QUESTIONS.general[4]} />

                    <Question number={6} question={QUESTIONS.general[5]} />
                  </div>

                  {/* =================================================
                RIGHT COLUMN
            ================================================== */}
                  <div>
                    {/* SPACE TO ALIGN QUESTION 7 */}
                    <div className="h-[40px]" />

                    <Question number={7} question={QUESTIONS.general[6]} />

                    <Question number={8} question={QUESTIONS.general[7]} />

                    {/* SAFETY QUESTIONS */}
                    <h2 className="mb-5 mt-10 text-[16px] font-bold">
                      Safety Questions:
                    </h2>

                    <Question number={9} question={QUESTIONS.safety[0]} />

                    <Question number={10} question={QUESTIONS.safety[1]} />
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
            className="day1-page-box shrink-0"
            style={{ width: PAGE_WIDTH }}
          >
            <div className="h-full w-full bg-white text-black">
              <div className="flex min-h-[1120px] flex-col px-[35px] py-[35px]">
                {/* =====================================================
              QUESTIONS PAGE 2
          ====================================================== */}
                <div className="grid grid-cols-2 gap-x-[80px]">
                  {/* =================================================
                LEFT COLUMN
            ================================================== */}
                  <div>
                    {/* QUESTION 11 */}
                    <Question number={11} question={QUESTIONS.safety[2]} />

                    {/* QUESTION 12 */}
                    <Question number={12} question={QUESTIONS.safety[3]} />

                    {/* QUESTION 13 */}
                    <Question number={13} question={QUESTIONS.safety[4]} />

                    {/* MAINTENANCE QUESTIONS */}
                    <h2 className="mb-5 mt-10 text-[16px] font-bold">
                      Maintenance Questions:
                    </h2>

                    <Question number={14} question={QUESTIONS.maintenance[0]} />

                    <Question number={15} question={QUESTIONS.maintenance[1]} />

                    <Question number={16} question={QUESTIONS.maintenance[2]} />
                  </div>

                  {/* =================================================
                RIGHT COLUMN
            ================================================== */}
                  <div>
                    {/* STORES QUESTIONS */}
                    <h2 className="mb-5 text-[16px] font-bold">Stores Questions:</h2>

                    <Question number={17} question={QUESTIONS.stores[0]} />

                    <Question number={18} question={QUESTIONS.stores[1]} />

                    {/* ABNORMALITY HANDLING */}
                    <h2 className="mb-5 mt-12 text-[16px] font-bold">
                      Abnormality Handling:
                    </h2>

                    <Question number={19} question={QUESTIONS.abnormality[0]} />

                    <Question number={20} question={QUESTIONS.abnormality[1]} />
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

            .day1-pager {
              overflow: visible !important;
            }

            .day1-pager-row {
              display: block !important;
              width: auto !important;
              height: auto !important;
              gap: 0 !important;
              transform: none !important;
              transition: none !important;
            }

            .day1-page-box {
              width: auto !important;
              height: auto !important;
            }

            .day1-page-box + .day1-page-box {
              page-break-before: always;
            }
          }
        `}
      </style>
    </>
  );
};

export default Day1QuestionPaper;
