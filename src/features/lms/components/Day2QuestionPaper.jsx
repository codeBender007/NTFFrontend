import { useState, useEffect, useCallback, useMemo } from "react";
import logo from "../../../assets/images/NTF_logo_black.png";
import { getUser } from "@/features/auth/utils/authStorage.js";
import QuestionPaperApi, {
  calculatePaperScore,
  extractSectionsForDisplay,
  findCanonicalDayPaper,
  getApiErrorMessage,
  mapApiResponseToPaper,
  mapApiSubmissionToModel,
} from "../services/QuestionPaperApi";
import {
  getDefaultDayPaper,
  buildSeedPayloadForDayPaper,
} from "../utils/defaultDayPapers";

const ALPHABET = ["a", "b", "c", "d", "e", "f"];
const PAGE_WIDTH = 1000;
const PAGE_GAP = 24;
const TOTAL_PAGES = 2;

const SectionHeading = ({ children }) => (
  <h2 className="mb-5 text-[15px] font-bold leading-tight text-black">
    {children}
  </h2>
);

const Day2QuestionPaper = ({
  paper: externalPaper = null,
  paperId = null,
  onSubmitSuccess,
  initialAnswers = {},
  isAlreadySubmitted = false,
  readOnly = false,
  initialInfo = {},
  submission = null,
} = {}) => {
  const isViewMode = Boolean(isAlreadySubmitted || readOnly);

  const [paper, setPaper] = useState(externalPaper);
  const [loadingPaper, setLoadingPaper] = useState(!externalPaper);
  const [paperError, setPaperError] = useState(null);

  const [info, setInfo] = useState({
    date: "",
    name: "",
    qualification: "",
    unit: "",
    ...initialInfo,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState(() => initialAnswers || {});
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submittedResult, setSubmittedResult] = useState(submission);

  const fetchDay2Paper = useCallback(
    async (signal) => {
      if (externalPaper) {
        setPaper(externalPaper);
        setLoadingPaper(false);
        setPaperError(null);
        return;
      }

      setLoadingPaper(true);
      setPaperError(null);
      try {
        let targetId = paperId;

        if (targetId == null) {
          const listRes = await QuestionPaperApi.getQuestionPapers(
            { day_type: "DAY_2", is_active: true },
            signal ? { signal } : {}
          );
          const list = Array.isArray(listRes.data) ? listRes.data : [];
          const match = findCanonicalDayPaper(list, "DAY_2");

          if (!match) {
            setPaper(getDefaultDayPaper("DAY_2"));
            setLoadingPaper(false);
            return;
          }
          targetId = match.id;
        }

        const detailRes = await QuestionPaperApi.getQuestionPaperById(
          targetId,
          signal ? { signal } : {}
        );
        const mapped = mapApiResponseToPaper(detailRes.data);
        setPaper(mapped || getDefaultDayPaper("DAY_2"));
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        setPaper(getDefaultDayPaper("DAY_2"));
        setPaperError(
          getApiErrorMessage(
            err,
            "Could not reach backend for Day 2 Question Paper; showing standard Day 2 paper."
          )
        );
      } finally {
        setLoadingPaper(false);
      }
    },
    [externalPaper, paperId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDay2Paper(controller.signal);
    return () => controller.abort();
  }, [fetchDay2Paper]);

  useEffect(() => {
    if (externalPaper) {
      setPaper(externalPaper);
      setLoadingPaper(false);
      setPaperError(null);
    }
  }, [externalPaper]);

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

  useEffect(() => {
    if (submission) {
      setSubmittedResult(submission);
    }
  }, [submission]);

  const sections = useMemo(() => extractSectionsForDisplay(paper), [paper]);

  // Build quick lookup map by question number (1..20) for the exact original 2-page layout
  const questionsByNumber = useMemo(() => {
    const map = {};
    sections.forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        map[q.number] = q;
      });
    });
    return map;
  }, [sections]);

  const totalQuestions = useMemo(
    () => sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0),
    [sections]
  );

  const totalMarks = paper?.totalMarks ?? 20;
  const passPercentage = Number(
    paper?.meta?.passPercentage ?? paper?.raw?.pass_percentage ?? 80
  );
  const documentCode =
    paper?.meta?.documentCode || paper?.raw?.document_code || "F18(AMD-02)";
  const revision =
    paper?.meta?.revision || paper?.raw?.revision || "Rev. 00";
  const paperTitle = paper?.title || "DOJO TEST PAPER-DAY-2";
  const passingInstruction =
    paper?.raw?.passing_instruction ||
    `(संकेत- टेस्ट में पास होने के लिए ${passPercentage}% अंक लाना अनिवार्य है।)`;
  const durationLabel =
    paper?.raw?.duration_label ||
    (paper?.meta?.duration ? `${paper.meta.duration} मिनिट्स` : "30 मिनिट्स");

  const handlePublishTemplateToDb = async () => {
    if (publishing) return;
    setPublishing(true);
    setPublishMessage(null);
    setPaperError(null);
    try {
      const seedPayload = buildSeedPayloadForDayPaper("DAY_2");
      const res = await QuestionPaperApi.createQuestionPaper(seedPayload);
      const saved = mapApiResponseToPaper(res.data);
      if (saved) {
        setPaper(saved);
        setPublishMessage("Day 2 Question Paper saved to database.");
      }
    } catch (err) {
      setPaperError(
        getApiErrorMessage(err, "Failed to save Day 2 Question Paper to database.")
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleAnswerChange = (questionNumber, optionIndex) => {
    if (isViewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: optionIndex,
    }));
    if (submitError) setSubmitError(null);
  };

  const handleChange = (field) => (event) => {
    if (isViewMode) return;
    setInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isViewMode || submitting || !paper) return;

    const scoreSummary = calculatePaperScore(sections, answers, passPercentage);

    if (onSubmitSuccess) {
      onSubmitSuccess(answers, {
        participantInfo: info,
        paper,
        scoreSummary,
      });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUser = getUser();
      const numericUserId =
        currentUser?.id != null && !Number.isNaN(Number(currentUser.id))
          ? Number(currentUser.id)
          : null;

      const payload = {
        question_paper_id: paper.id ?? null,
        user_id: numericUserId,
        day_type: paper.raw?.day_type || "DAY_2",
        answers,
        participant_info: info,
        score: scoreSummary.score,
        max_score: scoreSummary.maxScore,
        percentage: scoreSummary.percentage,
        passed: scoreSummary.passed,
        status: "SUBMITTED",
      };

      const res =
        paper.id != null
          ? await QuestionPaperApi.submitQuestionPaperById(paper.id, payload)
          : await QuestionPaperApi.submitQuestionPaper(payload);

      let mappedResult = mapApiSubmissionToModel(res.data);
      if (mappedResult?.id != null) {
        try {
          const fetched = await QuestionPaperApi.getSubmissionById(mappedResult.id);
          mappedResult = mapApiSubmissionToModel(fetched.data) || mappedResult;
        } catch {
          // Keep POST response if follow-up GET fails
        }
      }

      setSubmittedResult(mappedResult);
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(err, "Failed to submit Day 2 Question Paper.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const Question = ({ number }) => {
    const question = questionsByNumber[number];
    if (!question) return null;

    const isSelected = (idx, opt) => {
      const ans =
        answers[number] !== undefined
          ? answers[number]
          : answers[String(number)];
      if (ans === undefined || ans === null) return false;
      return (
        String(ans) === String(idx) ||
        (opt?.id != null && String(ans) === String(opt.id))
      );
    };

    return (
      <div className="mb-7 break-inside-avoid">
        <p className="text-[12px] font-medium leading-[1.45] text-black">
          <span className="mr-2">{number}.</span>
          {question.text}
        </p>

        <div className="mt-3 pl-7">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {(question.options || []).map((option, index) => {
              const checked = isSelected(index, option);
              return (
                <label
                  key={option.id ?? index}
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
                    onChange={() =>
                      !isViewMode && handleAnswerChange(number, index)
                    }
                    className={`mr-1.5 mt-0.5 h-3.5 w-3.5 accent-[#0b295c] shrink-0 ${
                      isViewMode ? "cursor-default" : "cursor-pointer"
                    }`}
                  />
                  <span className="mr-1.5 shrink-0 font-medium">
                    ({ALPHABET[index] || option.label?.toLowerCase()})
                  </span>
                  <span className={checked ? "font-bold text-[#0b295c]" : ""}>
                    {option.value}
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

  const Footer = () => (
    <div className="mt-auto flex items-center justify-between px-1 pt-8 text-[10px] text-black">
      <span>{documentCode}</span>
      <span>{revision}</span>
    </div>
  );

  if (loadingPaper) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-12 flex flex-col items-center justify-center gap-3">
        <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Loading Day 2 Question Paper...
        </p>
      </div>
    );
  }

  const rowWidth = TOTAL_PAGES * PAGE_WIDTH + (TOTAL_PAGES - 1) * PAGE_GAP;
  const offset = pageIndex * (PAGE_WIDTH + PAGE_GAP);

  const goToPage = (index) => {
    setPageIndex(Math.max(0, Math.min(TOTAL_PAGES - 1, index)));
  };

  return (
    <>
      {paper?.isTemplateFallback && !isViewMode && !onSubmitSuccess && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900 print:hidden">
          <span>
            Showing standard <strong>Day 2</strong> question paper. Save it to the database so it is managed via API.
          </span>
          <button
            type="button"
            disabled={publishing}
            onClick={handlePublishTemplateToDb}
            className="px-3.5 py-1.5 rounded-lg bg-[#0b295c] hover:bg-[#082046] text-white font-semibold text-xs shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {publishing ? "Saving..." : "Save to Database"}
          </button>
        </div>
      )}

      {publishMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 print:hidden">
          {publishMessage}
        </div>
      )}

      {paperError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-medium text-amber-800 print:hidden">
          <span>{paperError}</span>
          <button
            type="button"
            onClick={() => fetchDay2Paper()}
            className="px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-semibold cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {submittedResult && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-emerald-600 text-white">
              {submittedResult.status || "SUBMITTED"}
            </span>
            <span className="font-semibold text-emerald-950">
              Answered: {submittedResult.answeredCount ?? Object.keys(answers).length} /{" "}
              {submittedResult.totalQuestions || totalQuestions}
            </span>
            {submittedResult.score != null && submittedResult.maxScore != null && (
              <span className="font-semibold text-emerald-950">
                Score: {submittedResult.score} / {submittedResult.maxScore}
                {submittedResult.percentage != null ? ` (${submittedResult.percentage}%)` : ""}
              </span>
            )}
            {submittedResult.passed !== null && submittedResult.passed !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full font-bold ${
                  submittedResult.passed
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {submittedResult.passed ? "PASSED" : "NEEDS IMPROVEMENT"}
              </span>
            )}
          </div>
          {submittedResult.submittedAt && (
            <span className="text-[11px] font-medium text-emerald-800">
              Submitted: {new Date(submittedResult.submittedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* =====================================================
          CONTROL BAR (PAGINATION + PRINT)
      ====================================================== */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <span className="text-sm font-medium text-gray-600">
          {pageIndex + 1} / {TOTAL_PAGES}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-xl text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Previous page"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex >= TOTAL_PAGES - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-xl text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Next page"
          >
            ›
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer"
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
                {/* HEADER */}
                <div className="relative">
                  <div className="absolute left-[25px] top-0">
                    <img
                      src={logo}
                      alt="NTF Logo"
                      className="h-[55px] w-auto object-contain"
                    />
                  </div>

                  <div className="pt-[42px] text-center">
                    <h1 className="text-[16px] font-bold uppercase">
                      {paperTitle}
                    </h1>
                  </div>
                </div>

                {/* INFORMATION BOX */}
                <div className="mt-3 border border-black px-4 py-3">
                  <div className="text-[11px]">
                    अंक - &nbsp;&nbsp;{" "}
                    {submittedResult?.score != null ? `${submittedResult.score} ` : ""}
                    / {totalMarks}
                  </div>

                  <p className="mt-4 text-[11px]">{passingInstruction}</p>

                  <div className="mt-4 grid grid-cols-2 text-[11px]">
                    <div className="flex items-center">
                      <span>समय - {durationLabel}</span>
                    </div>

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
                      value={info.qualification || info.designation || ""}
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

                {/* PAGE 1 QUESTIONS */}
                <div className="mt-14 grid grid-cols-2 gap-x-[80px]">
                  <div>
                    <SectionHeading>Process Questions: (Quality)</SectionHeading>
                    <Question number={1} />
                    <Question number={2} />
                    <Question number={3} />

                    <SectionHeading>
                      Process Questions: (Plastic Injection Moulding)
                    </SectionHeading>
                    <Question number={4} />
                  </div>

                  <div>
                    <div className="h-[35px]" />
                    <Question number={5} />
                    <Question number={6} />
                    <Question number={7} />
                    <Question number={8} />
                  </div>
                </div>

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
                {/* PAGE 2 QUESTIONS */}
                <div className="grid grid-cols-2 gap-x-[80px]">
                  <div>
                    <SectionHeading>Process Questions: (Paint Shop)</SectionHeading>
                    <Question number={9} />
                    <Question number={10} />
                    <Question number={11} />

                    <SectionHeading>Process Questions: ( PU Rim )</SectionHeading>
                    <Question number={12} />
                    <Question number={13} />

                    <SectionHeading>Process Questions: (TCM)</SectionHeading>
                    <Question number={14} />
                  </div>

                  <div>
                    <div className="h-[25px]" />
                    <Question number={15} />
                    <Question number={16} />

                    <SectionHeading>Process Questions: (LB)</SectionHeading>
                    <Question number={17} />
                    <Question number={18} />
                    <Question number={19} />
                    <Question number={20} />
                  </div>
                </div>

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
          {submitError && (
            <div className="flex items-center gap-2 text-rose-800 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xs">
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-[#0b295c] hover:bg-[#123977] active:scale-[0.99] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit</span>
            )}
          </button>
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
