import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import logo from "../../../assets/images/NTF_logo_black.png";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

const loadSavedPaper = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    if (parsed.some((s) => s.questions)) return parsed;
    if (parsed.length > 0) return [{ id: 1, name: "Section A", questions: parsed }];
    return [];
  } catch {
    return [];
  }
};

const loadMeta = (storageKey) => {
  try {
    const raw = localStorage.getItem(`${storageKey}_meta`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const QuestionPaperPreview = ({ level = "L0", paper = null }) => {
  const navigate = useNavigate();
  const storageKey = `${level.toLowerCase()}_question_paper`;
  const editorPath = paper
    ? `/lms/${level.toLowerCase()}/editor`
    : `/lms/${level.toLowerCase()}`;
  const [sections] = useState(() =>
    paper
      ? paper.sections?.length
        ? paper.sections
        : loadSavedPaper(storageKey)
      : loadSavedPaper(storageKey)
  );
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [paperMeta] = useState(() => (paper ? paper.meta || {} : loadMeta(storageKey)));

  const totalQuestions = sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const totalMarks = sections.reduce(
    (acc, s) => acc + (s.questions?.reduce((qa, q) => qa + (Number(q.marks) || 0), 0) || 0),
    0
  );

  const testTitle = paperMeta.headerTitle || "SKILL EVALUATION TEST PAPER";
  const subTitle = paperMeta.subTitle || "New Manpower for DOJO Hiring";
  const duration = paperMeta.duration || 60;
  const passPercentage = Number(paperMeta.passPercentage) || 80;

  const Question = ({ number, question }) => (
    <div className="mb-5 break-inside-avoid">
      <p className="text-[12px] font-medium leading-[1.4] text-black">
        <span className="mr-1">{number}.</span>
        {question.question || `Question ${number}`}
      </p>

      {question.options && question.options.length > 0 ? (
        <div className="mt-2 pl-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {question.options.map((option, index) => {
              const isCorrect = showAnswerKey && question.correctOption === option.id;
              return (
                <div
                  key={option.id}
                  className={`flex items-start text-[11px] leading-[1.4] ${
                    isCorrect ? "font-bold text-emerald-700" : "text-black"
                  }`}
                >
                  <span className="mr-1">({ALPHABET[index]})</span>
                  <span>{option.value || `Option ${option.label}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="ml-4 mt-3 w-4/5 border-b border-dotted border-gray-500" />
      )}
    </div>
  );

  const renderFooter = () => (
    <div className="mt-auto flex items-center justify-between px-2 pt-8 text-[10px] text-black">
      <span>F18(AMD-02)</span>
      <span>Rev. 00</span>
    </div>
  );

  let compiledSections = [];
  let globalNumber = 1;

  sections.forEach((section) => {
    const qs = section.questions || [];
    if (qs.length === 0) return;

    const numbered = qs.map((q) => ({ ...q, number: globalNumber++ }));

    compiledSections.push({
      section,
      leftQs: numbered.filter((q, i) => i % 2 === 0),
      rightQs: numbered.filter((q, i) => i % 2 !== 0),
    });
  });

  return (
    <>
      {/* ── Sticky Top Toolbar (hidden in print) ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-xs print:hidden">
        <div className="h-14 px-4 sm:px-8 flex items-center justify-between max-w-5xl mx-auto gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/lms")}
              className="h-9 w-9 rounded-xl bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition flex items-center justify-center shrink-0"
              title="Back to Dojo Hiring"
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate leading-tight">
                Question Paper Preview
              </h1>
              <p className="text-[11px] text-gray-500 truncate">Print-ready examination layout</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                showAnswerKey
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
              }`}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
              <span className="hidden sm:inline">{showAnswerKey ? "Answer Key" : "Student View"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(editorPath)}
              className="h-9 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              <EditOutlinedIcon sx={{ fontSize: 15 }} />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 text-xs font-semibold text-white shadow-md shadow-primary/20 hover:opacity-95 transition flex items-center gap-1.5"
            >
              <PrintOutlinedIcon sx={{ fontSize: 15 }} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          PAPER SHEET (Day-1 style)
      ====================================================== */}
      {compiledSections.length === 0 || totalQuestions === 0 ? (
        <div className="mx-auto mt-10 max-w-[760px] border-2 border-dashed border-gray-200 rounded-xl py-14 text-center bg-white">
          <p className="text-sm font-semibold text-gray-500">No questions added yet.</p>
          <button
            type="button"
            onClick={() => navigate(editorPath)}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-5 text-xs font-semibold text-white shadow-sm"
          >
            Go to Editor &amp; Add Questions
          </button>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1100px] bg-white text-black print:max-w-none">
          <div className="min-h-[1120px] px-[35px] py-[35px]">
            {/* =================================================
                HEADER
            ================================================== */}
            <div className="relative">
              <div className="absolute left-0 top-0">
                <img src={logo} alt="NTF Logo" className="h-[58px] w-auto object-contain" />
              </div>

              <div className="pt-[40px] text-center">
                <h1 className="text-[16px] font-bold uppercase leading-tight">{testTitle}</h1>
                {subTitle && (
                  <p className="mt-1 text-[11px] text-gray-700">{subTitle}</p>
                )}
              </div>
            </div>

            {/* =================================================
                INFORMATION BOX
            ================================================== */}
            <div className="mt-4 border border-black px-5 py-4">
              <div className="flex items-center text-[12px]">
                <span>अंक -</span>
                <span
                  className="ml-2 min-w-[40px] border-b border-dotted border-black px-1 outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                >
                  / {totalMarks}
                </span>
              </div>

              <p
                className="mt-4 text-[11px] outline-none"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
              >
                (ऑब्जेक्टिव टेस्ट में पास होने के लिए {passPercentage}% अंक लाना अनिवार्य है।)
              </p>

              <div className="mt-4 grid grid-cols-2 text-[12px]">
                <div className="flex items-center">
                  <span>समय -</span>
                  <span
                    className="ml-2 inline-block min-h-[16px] w-[130px] border-b border-dotted border-black px-1 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                  >
                    {duration} मिनट
                  </span>
                </div>

                <div className="flex items-center">
                  <span>दिनांक-</span>
                  <span
                    className="ml-2 inline-block min-h-[16px] w-[180px] border-b border-dotted border-black px-1 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-y-3 text-[12px]">
                <span className="whitespace-nowrap">सदस्य का नाम</span>
                <span
                  className="mx-2 inline-block min-h-[16px] w-[250px] border-b border-dotted border-black px-1 outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                />
                <span className="whitespace-nowrap">क्वालिफिकेशन</span>
                <span
                  className="mx-2 inline-block min-h-[16px] w-[220px] border-b border-dotted border-black px-1 outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                />
                <span className="whitespace-nowrap">यूनिट नाम</span>
                <span
                  className="ml-2 inline-block min-h-[16px] w-[180px] border-b border-dotted border-black px-1 outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                />
              </div>
            </div>

            {/* =================================================
                QUESTIONS
            ================================================== */}
            <div className="mt-8 grid grid-cols-2 gap-x-[80px]">
              {compiledSections.map(({ section, leftQs, rightQs }) => (
                <Fragment key={section.id}>
                  <div className="col-span-2">
                    <h2 className="mb-4 mt-6 text-[16px] font-bold uppercase">
                      {section.name || "Section"}
                    </h2>
                  </div>

                  <div>
                    {leftQs.map((q) => (
                      <Question key={q.id} number={q.number} question={q} />
                    ))}
                  </div>

                  <div>
                    {rightQs.map((q) => (
                      <Question key={q.id} number={q.number} question={q} />
                    ))}
                  </div>
                </Fragment>
              ))}
            </div>

            {/* FOOTER */}
            {renderFooter()}
          </div>
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

            .print\\:hidden {
              display: none !important;
            }

            .break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>
    </>
  );
};

export default QuestionPaperPreview;