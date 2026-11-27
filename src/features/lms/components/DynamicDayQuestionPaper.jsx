import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import logo from "../../../assets/images/NTF_logo_black.png";
import { getUser } from "@/features/auth/utils/authStorage.js";
import QuestionPaperApi, {
  calculatePaperScore,
  extractSectionsForDisplay,
  findCanonicalDayPaper,
  getApiErrorMessage,
  mapApiResponseToPaper,
  mapApiSubmissionToModel,
  normalizeDayType,
} from "../services/QuestionPaperApi";
import {
  getDefaultDayPaper,
  buildSeedPayloadForDayPaper,
} from "../utils/defaultDayPapers";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const PAGE_WIDTH = 1000;
const PAGE_GAP = 24;
const QUESTIONS_PER_PAGE = 10;

/**
 * Splits sections & questions into balanced A4 pages (up to QUESTIONS_PER_PAGE questions per page),
 * each page having a left column and right column.
 */
const paginateSections = (sections = []) => {
  const flatItems = [];
  sections.forEach((sec) => {
    (sec.questions || []).forEach((q, idx) => {
      flatItems.push({
        sectionId: sec.id,
        sectionName: idx === 0 ? sec.name : null,
        question: q,
      });
    });
  });

  if (flatItems.length === 0) return [];

  const pages = [];
  for (let i = 0; i < flatItems.length; i += QUESTIONS_PER_PAGE) {
    const chunk = flatItems.slice(i, i + QUESTIONS_PER_PAGE);
    const mid = Math.ceil(chunk.length / 2);
    pages.push({
      left: chunk.slice(0, mid),
      right: chunk.slice(mid),
    });
  }
  return pages;
};

const DynamicDayQuestionPaper = ({
  dayType = "DAY_1",
  paper: externalPaper = null,
  paperId = null,
  onSubmitSuccess,
  initialAnswers = {},
  isAlreadySubmitted = false,
  readOnly = false,
  initialInfo = {},
  submission = null,
} = {}) => {
  const canonicalDayType = normalizeDayType(dayType);
  const dayLabel = canonicalDayType === "DAY_2" ? "Day 2" : "Day 1";
  const isViewMode = Boolean(isAlreadySubmitted || readOnly);

  const [paper, setPaper] = useState(externalPaper);
  const [loadingPaper, setLoadingPaper] = useState(!externalPaper);
  const [paperError, setPaperError] = useState(null);

  const [info, setInfo] = useState({
    time: "30 मिनट",
    date: "",
    name: "",
    designation: "",
    qualification: "",
    unit: "",
    ...initialInfo,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const controlRef = useRef(null);

  const [answers, setAnswers] = useState(() => initialAnswers || {});
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submittedResult, setSubmittedResult] = useState(submission);

  const fetchPaperFromApi = useCallback(
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
            { day_type: canonicalDayType, is_active: true },
            signal ? { signal } : {}
          );
          const list = Array.isArray(listRes.data) ? listRes.data : [];
          const match = findCanonicalDayPaper(list, canonicalDayType);

          if (!match) {
            // Fall back to canonical Day 1 / Day 2 template when DB has no record yet
            setPaper(getDefaultDayPaper(canonicalDayType));
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
        setPaper(mapped || getDefaultDayPaper(canonicalDayType));
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        // Keep the paper usable with the canonical template while surfacing the API warning
        setPaper(getDefaultDayPaper(canonicalDayType));
        setPaperError(
          getApiErrorMessage(
            err,
            `Could not reach backend for ${dayLabel} Question Paper; showing standard paper.`
          )
        );
      } finally {
        setLoadingPaper(false);
      }
    },
    [externalPaper, paperId, canonicalDayType, dayLabel]
  );

  const handlePublishTemplateToDb = async () => {
    if (publishing) return;
    setPublishing(true);
    setPublishMessage(null);
    setPaperError(null);
    try {
      const seedPayload = buildSeedPayloadForDayPaper(canonicalDayType);
      const res = await QuestionPaperApi.createQuestionPaper(seedPayload);
      const saved = mapApiResponseToPaper(res.data);
      if (saved) {
        setPaper(saved);
        setPublishMessage(`${dayLabel} Question Paper saved to database.`);
      }
    } catch (err) {
      setPaperError(
        getApiErrorMessage(err, `Failed to save ${dayLabel} Question Paper to database.`)
      );
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPaperFromApi(controller.signal);
    return () => controller.abort();
  }, [fetchPaperFromApi]);

  useEffect(() => {
    if (externalPaper) {
      setPaper(externalPaper);
      setLoadingPaper(false);
      setPaperError(null);
    }
  }, [externalPaper]);

  useEffect(() => {
    if (paper) {
      const durationText =
        paper.raw?.duration_label ||
        (paper.meta?.duration ? `${paper.meta.duration} मिनट` : "30 मिनट");
      setInfo((prev) => ({
        ...prev,
        time: prev.time || durationText,
      }));
    }
  }, [paper]);

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
  const pages = useMemo(() => paginateSections(sections), [sections]);
  const totalPages = Math.max(1, pages.length);

  const totalQuestions = useMemo(
    () => sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0),
    [sections]
  );

  const totalMarks = useMemo(() => {
    if (paper?.totalMarks != null) return paper.totalMarks;
    return sections.reduce(
      (sum, s) =>
        sum + (s.questions?.reduce((qSum, q) => qSum + (Number(q.marks) || 1), 0) || 0),
      0
    );
  }, [paper, sections]);

  const passPercentage = Number(paper?.meta?.passPercentage ?? paper?.raw?.pass_percentage ?? 80);
  const documentCode = paper?.meta?.documentCode || paper?.raw?.document_code || "F18(AMD-02)";
  const revision = paper?.meta?.revision || paper?.raw?.revision || "Rev. 00";
  const paperTitle =
    paper?.title ||
    (canonicalDayType === "DAY_2" ? "DOJO TEST PAPER-DAY-2" : "DOJO TEST PAPER- DAY-1");
  const passingInstruction =
    paper?.raw?.passing_instruction ||
    (canonicalDayType === "DAY_2"
      ? `(संकेत- टेस्ट में पास होने के लिए ${passPercentage}% अंक लाना अनिवार्य है।)`
      : `(ऑब्जेक्टिव टेस्ट में पास होने के लिए ${passPercentage}% अंक लाना अनिवार्य है।)`);

  const handleAnswerChange = (questionNumber, value) => {
    if (isViewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
    if (submitError) setSubmitError(null);
  };

  const handleInfoChange = (field) => (event) => {
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

    // If parent manages submission (e.g. Employee Portal Day 1/2 or Supervisor-assigned papers)
    if (onSubmitSuccess) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmitSuccess(answers, {
          participantInfo: info,
          paper,
          scoreSummary,
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Standalone submission (e.g. Admin Portal Day 1 / Day 2 view)
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUser = getUser();
      const numericUserId =
        currentUser?.id != null && !Number.isNaN(Number(currentUser.id))
          ? Number(currentUser.id)
          : null;

      const payload = {
        question_paper_id: paper.id,
        user_id: numericUserId,
        day_type: paper.raw?.day_type || canonicalDayType,
        answers,
        participant_info: info,
        score: scoreSummary.score,
        max_score: scoreSummary.maxScore,
        percentage: scoreSummary.percentage,
        passed: scoreSummary.passed,
        status: "SUBMITTED",
      };

      const res = paper.id != null
        ? await QuestionPaperApi.submitQuestionPaperById(paper.id, payload)
        : await QuestionPaperApi.submitQuestionPaper(payload);

      let mappedResult = mapApiSubmissionToModel(res.data);

      // Verify & fetch persisted submission details via GET /submissions/{submission_id}
      if (mappedResult?.id != null) {
        try {
          const fetched = await QuestionPaperApi.getSubmissionById(mappedResult.id);
          mappedResult = mapApiSubmissionToModel(fetched.data) || mappedResult;
        } catch {
          // Keep POST response if immediate follow-up GET fails
        }
      }

      setSubmittedResult(mappedResult);
    } catch (err) {
      setSubmitError(
        getApiErrorMessage(err, `Failed to submit ${dayLabel} Question Paper.`)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const rowWidth = totalPages * PAGE_WIDTH + (totalPages - 1) * PAGE_GAP;
  const offset = safePageIndex * (PAGE_WIDTH + PAGE_GAP);

  const goToPage = (index) => {
    setPageIndex(Math.max(0, Math.min(totalPages - 1, index)));
  };

  if (loadingPaper) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-12 flex flex-col items-center justify-center gap-3">
        <span className="h-7 w-7 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Loading {dayLabel} Question Paper...
        </p>
      </div>
    );
  }

  if (!paper || pages.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-10 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">
          No {dayLabel} Question Paper Available
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No active question paper with day type <strong>{canonicalDayType}</strong> was found in the database.
        </p>
        <button
          type="button"
          onClick={() => fetchPaperFromApi()}
          className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
        >
          Refresh
        </button>
      </div>
    );
  }

  const QuestionItem = ({ question }) => {
    const number = question.number;

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

    const textValue =
      answers[number] !== undefined
        ? answers[number]
        : answers[String(number)] || "";

    return (
      <div className="mb-5 break-inside-avoid">
        <p className="text-[12px] font-medium leading-[1.4] text-black">
          <span className="mr-1">{number}.</span>
          {question.text}
        </p>

        {question.options && question.options.length > 0 ? (
          <div className="mt-2 pl-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {question.options.map((option, index) => {
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
                      name={`${canonicalDayType}-question-${number}`}
                      value={index}
                      checked={checked}
                      disabled={isViewMode}
                      onChange={() => !isViewMode && handleAnswerChange(number, index)}
                      className={`mr-1.5 mt-0.5 h-3.5 w-3.5 accent-[#0b295c] shrink-0 ${
                        isViewMode ? "cursor-default" : "cursor-pointer"
                      }`}
                    />
                    <span className="mr-1 font-medium">
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
        ) : (
          <div className="ml-4 mt-2 w-4/5">
            <input
              type="text"
              placeholder={isViewMode ? "(No answer submitted)" : "उत्तर लिखें..."}
              value={textValue}
              readOnly={isViewMode}
              disabled={isViewMode}
              onChange={(e) => handleAnswerChange(number, e.target.value)}
              className={`w-full border-b border-dotted border-gray-500 bg-transparent px-1 py-0.5 text-[11px] outline-none ${
                isViewMode && textValue
                  ? "font-bold text-[#0b295c] bg-blue-50/50 rounded px-2"
                  : "text-black"
              }`}
            />
          </div>
        )}
      </div>
    );
  };

  const Footer = () => (
    <div className="mt-auto flex items-center justify-between px-2 pt-8 text-[10px] text-black">
      <span>{documentCode}</span>
      <span>{revision}</span>
    </div>
  );

  const qualificationValue = info.qualification || info.designation || "";
  const qualificationField = canonicalDayType === "DAY_2" ? "qualification" : "designation";

  return (
    <>
      {/* =====================================================
          DB PUBLISH NOTICE (When displaying default template before DB seed)
      ====================================================== */}
      {paper?.isTemplateFallback && !isViewMode && !onSubmitSuccess && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900 print:hidden">
          <span>
            Showing standard <strong>{dayLabel}</strong> question paper. Save it to the database so it is managed via API.
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
            onClick={() => fetchPaperFromApi()}
            className="px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-semibold cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          SUBMISSION RESULT SUMMARY BANNER (Read-only / Submitted)
      ====================================================== */}
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
      <div
        ref={controlRef}
        className="mb-4 flex items-center justify-between print:hidden"
      >
        <span className="text-sm font-medium text-gray-600">
          {safePageIndex + 1} / {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(safePageIndex - 1)}
            disabled={safePageIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-xl text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Previous page"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => goToPage(safePageIndex + 1)}
            disabled={safePageIndex >= totalPages - 1}
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
        className="day-paper-pager relative mx-auto overflow-hidden"
        style={{ width: PAGE_WIDTH }}
      >
        <div
          className="day-paper-pager-row flex transition-transform duration-500 ease-in-out"
          style={{
            width: rowWidth,
            gap: PAGE_GAP,
            transform: `translateX(${-offset}px)`,
          }}
        >
          {pages.map((pageData, idx) => (
            <div
              key={idx}
              className="day-paper-page-box shrink-0"
              style={{ width: PAGE_WIDTH }}
            >
              <div className="h-full w-full bg-white text-black">
                <div className="flex min-h-[1120px] flex-col px-[35px] py-[35px]">
                  {/* HEADER + INFO BOX ON PAGE 1 */}
                  {idx === 0 && (
                    <>
                      <div className="relative">
                        <div className="absolute left-0 top-0">
                          <img
                            src={logo}
                            alt="NTF Logo"
                            className="h-[58px] w-auto object-contain"
                          />
                        </div>

                        <div className="pt-[40px] text-center">
                          <h1 className="text-[16px] font-bold uppercase">
                            {paperTitle}
                          </h1>
                        </div>
                      </div>

                      <div className="mt-4 border border-black px-5 py-4">
                        <div className="flex items-center text-[12px]">
                          <span>अंक -</span>
                          <span className="ml-2">
                            {submittedResult?.score != null ? `${submittedResult.score} ` : ""}/ {totalMarks}
                          </span>
                        </div>

                        <p className="mt-4 text-[11px]">{passingInstruction}</p>

                        <div className="mt-4 grid grid-cols-2 text-[12px]">
                          <div className="flex items-center">
                            <span>समय -</span>
                            <input
                              type="text"
                              value={info.time}
                              readOnly={isViewMode}
                              onChange={handleInfoChange("time")}
                              className={`ml-2 w-[150px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                                isViewMode ? "cursor-default font-medium" : ""
                              }`}
                            />
                          </div>

                          <div className="flex items-center">
                            <span>दिनांक-</span>
                            <input
                              type="text"
                              value={info.date}
                              readOnly={isViewMode}
                              onChange={handleInfoChange("date")}
                              className={`ml-2 w-[180px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                                isViewMode ? "cursor-default font-medium" : ""
                              }`}
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex items-center text-[12px]">
                          <span className="whitespace-nowrap">सदस्य का नाम</span>
                          <input
                            type="text"
                            value={info.name}
                            readOnly={isViewMode}
                            onChange={handleInfoChange("name")}
                            className={`mx-2 w-[240px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                              isViewMode ? "cursor-default font-medium" : ""
                            }`}
                          />

                          <span className="whitespace-nowrap">क्वालिफिकेशन</span>
                          <input
                            type="text"
                            value={qualificationValue}
                            readOnly={isViewMode}
                            onChange={handleInfoChange(qualificationField)}
                            className={`mx-2 w-[220px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                              isViewMode ? "cursor-default font-medium" : ""
                            }`}
                          />

                          <span className="whitespace-nowrap">यूनिट नाम</span>
                          <input
                            type="text"
                            value={info.unit}
                            readOnly={isViewMode}
                            onChange={handleInfoChange("unit")}
                            className={`ml-2 w-[180px] border-0 border-b border-dotted border-black bg-transparent px-1 outline-none ${
                              isViewMode ? "cursor-default font-medium" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* TWO-COLUMN QUESTIONS GRID */}
                  <div className={`${idx === 0 ? "mt-8" : ""} grid grid-cols-2 gap-x-[80px]`}>
                    <div>
                      {pageData.left.map((item) => (
                        <div key={item.question.number}>
                          {item.sectionName && (
                            <h2 className="mb-5 mt-2 text-[15px] font-bold leading-tight text-black">
                              {item.sectionName}
                            </h2>
                          )}
                          <QuestionItem question={item.question} />
                        </div>
                      ))}
                    </div>

                    <div>
                      {pageData.right.map((item) => (
                        <div key={item.question.number}>
                          {item.sectionName && (
                            <h2 className="mb-5 mt-2 text-[15px] font-bold leading-tight text-black">
                              {item.sectionName}
                            </h2>
                          )}
                          <QuestionItem question={item.question} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Footer />
                </div>
              </div>
            </div>
          ))}
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

            .day-paper-pager {
              overflow: visible !important;
            }

            .day-paper-pager-row {
              display: block !important;
              width: auto !important;
              height: auto !important;
              gap: 0 !important;
              transform: none !important;
              transition: none !important;
            }

            .day-paper-page-box {
              width: auto !important;
              height: auto !important;
            }

            .day-paper-page-box + .day-paper-page-box {
              page-break-before: always;
            }
          }
        `}
      </style>
    </>
  );
};

export default DynamicDayQuestionPaper;
