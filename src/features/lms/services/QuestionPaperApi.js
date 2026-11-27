import api from "../../../api/axios";

/**
 * Normalizes backend error responses (FastAPI HTTPException / ValidationError)
 * into a human-readable message string.
 */
export const getApiErrorMessage = (error, fallback = "An unexpected error occurred.") => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "";
        const msg = item?.msg || "Invalid value";
        return field ? `${field}: ${msg}` : msg;
      })
      .join("; ");
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

/**
 * Computes total marks and question count from sections array.
 */
const computeSectionStats = (sections = []) => {
  let totalQuestions = 0;
  let totalMarks = 0;

  if (Array.isArray(sections)) {
    sections.forEach((sec) => {
      const qs = Array.isArray(sec?.questions) ? sec.questions : [];
      totalQuestions += qs.length;
      qs.forEach((q) => {
        totalMarks += Number(q?.marks) || 0;
      });
    });
  }

  return { totalQuestions, totalMarks };
};

/**
 * Maps editor state (meta, sections, level) into the backend QuestionPaperCreate / QuestionPaperUpdate schema.
 */
export const mapEditorStateToApiPayload = ({ meta = {}, sections = [], level = "L0" }) => {
  const { totalQuestions, totalMarks } = computeSectionStats(sections);

  const title =
    meta.testTitle?.trim() ||
    meta.headerTitle?.trim() ||
    "SKILL EVALUATION TEST PAPER";

  const durationMinutes = Math.max(1, parseInt(meta.duration, 10) || 60);
  const parsedPass = parseInt(meta.passPercentage, 10);
  const passPercentage = Number.isNaN(parsedPass)
    ? 80
    : Math.min(100, Math.max(0, parsedPass));

  const dayType = (meta.levels?.trim() || level || "L0").toString();

  // Flatten questions for backend compatibility while preserving full sections structure
  const flattenedQuestions = [];
  let qCounter = 1;
  (Array.isArray(sections) ? sections : []).forEach((sec) => {
    const qs = Array.isArray(sec?.questions) ? sec.questions : [];
    qs.forEach((q) => {
      flattenedQuestions.push({
        ...q,
        questionNumber: qCounter++,
        sectionId: sec.id,
        sectionName: sec.name,
      });
    });
  });

  const course =
    meta.departments?.trim() ||
    meta.subTitle?.trim() ||
    "DOJO Technical Evaluation";

  const payload = {
    title: title.slice(0, 255),
    description: meta.description?.trim() ? meta.description.trim().slice(0, 1000) : null,
    day_type: dayType,
    document_code: meta.documentCode?.trim() || "F18(AMD-02)",
    revision: meta.revision?.trim() || "Rev. 00",
    duration_minutes: durationMinutes,
    duration_label: `${durationMinutes} Minutes`,
    total_marks: Math.max(0, Math.round(totalMarks)),
    pass_percentage: passPercentage,
    total_questions: totalQuestions,
    passing_instruction: `${passPercentage}% or Above`,
    plant_id: meta.plantId ? Number(meta.plantId) : null,
    department_id: meta.departmentId ? Number(meta.departmentId) : null,
    sub_department_id: meta.subDepartmentId ? Number(meta.subDepartmentId) : null,
    line_id: meta.lineId ? Number(meta.lineId) : null,
    machine_id: meta.machineId ? Number(meta.machineId) : null,
    sections,
    questions: flattenedQuestions,
    metadata: {
      ...meta,
      testTitle: title,
      headerTitle: meta.headerTitle?.trim() || title,
      subTitle: meta.subTitle?.trim() || "",
      duration: durationMinutes,
      passPercentage,
      testType: meta.testType || "Online",
      target: meta.target || `${passPercentage}% or Above`,
      course,
      level: level || dayType,
    },
    is_active: true,
  };

  return payload;
};

/**
 * Reconstructs sections array from a backend QuestionPaperResponse.
 */
const normalizeSectionsFromApi = (apiPaper) => {
  if (Array.isArray(apiPaper?.sections) && apiPaper.sections.length > 0) {
    if (apiPaper.sections.some((s) => Array.isArray(s?.questions))) {
      return apiPaper.sections.map((sec, idx) => ({
        ...sec,
        id: sec.id ?? idx + 1,
        name: sec.name || `Section ${String.fromCharCode(65 + idx)}`,
        questions: Array.isArray(sec.questions) ? sec.questions : [],
      }));
    }
  }

  if (Array.isArray(apiPaper?.questions) && apiPaper.questions.length > 0) {
    // Group flat questions by sectionId/sectionName if present
    const grouped = new Map();
    apiPaper.questions.forEach((q, idx) => {
      const secKey = q.sectionId ?? q.sectionName ?? 1;
      if (!grouped.has(secKey)) {
        grouped.set(secKey, {
          id: q.sectionId ?? grouped.size + 1,
          name: q.sectionName || `Section ${String.fromCharCode(65 + grouped.size)}`,
          subtitle: "Assessment Questions",
          questions: [],
        });
      }
      grouped.get(secKey).questions.push({
        ...q,
        id: q.id ?? idx + 1,
      });
    });
    return Array.from(grouped.values());
  }

  return [];
};

/**
 * Maps a backend QuestionPaperResponse into the normalized frontend paper model
 * used across QuestionPaperTable, QuestionPaperPage, and QuestionPaperPreview.
 */
export const mapApiResponseToPaper = (apiPaper) => {
  if (!apiPaper || typeof apiPaper !== "object") return null;

  const sections = normalizeSectionsFromApi(apiPaper);
  const { totalQuestions: computedQuestions, totalMarks: computedMarks } =
    computeSectionStats(sections);

  const metaObj =
    apiPaper.metadata && typeof apiPaper.metadata === "object"
      ? apiPaper.metadata
      : {};

  const passPercentage =
    apiPaper.pass_percentage ?? metaObj.passPercentage ?? 80;
  const totalMarks = apiPaper.total_marks ?? computedMarks;
  const totalQuestions = apiPaper.total_questions ?? computedQuestions;
  const duration = apiPaper.duration_minutes ?? metaObj.duration ?? 60;

  const title =
    apiPaper.title || metaObj.testTitle || metaObj.headerTitle || "Untitled Test Paper";

  const course =
    apiPaper.department_name ||
    metaObj.departments ||
    metaObj.course ||
    metaObj.subTitle ||
    "DOJO Technical Evaluation";

  const passingText =
    apiPaper.passing_instruction || `${passPercentage}% or Above`;

  return {
    id: apiPaper.id,
    title,
    description: apiPaper.description || metaObj.description || "",
    dayType: apiPaper.day_type || "L0",
    level: metaObj.level || apiPaper.day_type || "L0",
    target: metaObj.target || passingText,
    testType: metaObj.testType || "Online",
    course,
    passing: passingText,
    marks: `${totalMarks} Marks`,
    totalMarks,
    totalQuestions,
    fullMarks: "Full Marks",
    sections,
    meta: {
      ...metaObj,
      testTitle: title,
      description: apiPaper.description || metaObj.description || "",
      headerTitle: metaObj.headerTitle || title,
      subTitle: metaObj.subTitle || "",
      departments: apiPaper.department_name || metaObj.departments || "",
      sections: apiPaper.sub_department_name || metaObj.sections || "",
      lines: apiPaper.line_name || metaObj.lines || "",
      machines: apiPaper.machine_name || metaObj.machines || "",
      levels: metaObj.levels || apiPaper.day_type || "",
      duration,
      passPercentage,
      documentCode: apiPaper.document_code || metaObj.documentCode || "F18(AMD-02)",
      revision: apiPaper.revision || metaObj.revision || "Rev. 00",
      plantId: apiPaper.plant_id ?? metaObj.plantId ?? null,
      departmentId: apiPaper.department_id ?? metaObj.departmentId ?? null,
      subDepartmentId: apiPaper.sub_department_id ?? metaObj.subDepartmentId ?? null,
      lineId: apiPaper.line_id ?? metaObj.lineId ?? null,
      machineId: apiPaper.machine_id ?? metaObj.machineId ?? null,
    },
    isActive: apiPaper.is_active ?? true,
    createdBy: apiPaper.created_by ?? null,
    createdByName: apiPaper.created_by_name ?? null,
    createdAt: apiPaper.created_at ?? null,
    updatedAt: apiPaper.updated_at ?? null,
    raw: apiPaper,
  };
};

const QuestionPaperApi = {
  // GET /api/v1/lms/question-papers/
  getQuestionPapers: (params = {}, config = {}) =>
    api.get("/lms/question-papers/", { params, ...config }),

  // GET /api/v1/lms/question-papers/{paper_id}
  getQuestionPaperById: (paperId, config = {}) =>
    api.get(`/lms/question-papers/${paperId}`, config),

  // POST /api/v1/lms/question-papers/
  createQuestionPaper: (payload) =>
    api.post("/lms/question-papers/", payload),

  // PUT /api/v1/lms/question-papers/{paper_id}
  updateQuestionPaper: (paperId, payload) =>
    api.put(`/lms/question-papers/${paperId}`, payload),

  // DELETE /api/v1/lms/question-papers/{paper_id}
  deleteQuestionPaper: (paperId) =>
    api.delete(`/lms/question-papers/${paperId}`),

  // POST /api/v1/lms/question-papers/submissions
  submitQuestionPaper: (payload) =>
    api.post("/lms/question-papers/submissions", payload),

  // POST /api/v1/lms/question-papers/{paper_id}/submit
  submitQuestionPaperById: (paperId, payload) =>
    api.post(`/lms/question-papers/${paperId}/submit`, payload),

  // GET /api/v1/lms/question-papers/submissions
  getSubmissions: (params = {}, config = {}) =>
    api.get("/lms/question-papers/submissions", { params, ...config }),

  // GET /api/v1/lms/question-papers/submissions/{submission_id}
  getSubmissionById: (submissionId, config = {}) =>
    api.get(`/lms/question-papers/submissions/${submissionId}`, config),
};

/**
 * Normalizes day_type strings (e.g. "DAY_1", "Day 1", "day1") into canonical "DAY_1" / "DAY_2" or uppercase string.
 */
export const normalizeDayType = (value) => {
  const raw = String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (raw === "DAY1" || raw === "DAY_1") return "DAY_1";
  if (raw === "DAY2" || raw === "DAY_2") return "DAY_2";
  return raw;
};

/**
 * Strictly selects the official Day 1 or Day 2 DOJO question paper from a list of papers.
 * Prevents custom/generic test papers (e.g. "Level 2") from accidentally hijacking
 * the official Day 1 or Day 2 DOJO assessment pages.
 */
export const findCanonicalDayPaper = (papers = [], targetDayType = "DAY_1") => {
  if (!Array.isArray(papers) || papers.length === 0) return null;
  const canonical = normalizeDayType(targetDayType);
  const dayNum = canonical === "DAY_2" ? "2" : "1";

  const matchingDayType = papers.filter((p) => {
    const rawType = p?.day_type ?? p?.dayType ?? p?.raw?.day_type;
    return normalizeDayType(rawType) === canonical;
  });

  if (matchingDayType.length === 0) return null;

  // 1. Prefer explicitly flagged official DOJO Day 1 / Day 2 papers
  const flagged = matchingDayType.find(
    (p) =>
      p?.metadata?.isOfficialDayPaper === true ||
      p?.meta?.isOfficialDayPaper === true ||
      p?.raw?.metadata?.isOfficialDayPaper === true
  );
  if (flagged) return flagged;

  // 2. Next prefer papers whose title explicitly indicates DOJO Day 1 / Day 2
  const titleRegex = new RegExp(`(dojo.*day[-\\s]?${dayNum}|day[-\\s]?${dayNum})`, "i");
  const titled = matchingDayType.find((p) => titleRegex.test(String(p?.title || "")));
  if (titled) return titled;

  return null;
};

/**
 * Normalizes a single question object from any backend shape into:
 * { id, number, text, options: [{ id, label, value }], correctOption, marks }
 */
const normalizeQuestionItem = (q, fallbackNumber) => {
  const text = q?.question ?? q?.q ?? q?.text ?? `Question ${fallbackNumber}`;
  const rawOptions = Array.isArray(q?.options) ? q.options : [];
  const options = rawOptions.map((opt, idx) => {
    if (typeof opt === "string") {
      return {
        id: idx,
        label: String.fromCharCode(65 + idx),
        value: opt,
      };
    }
    return {
      id: opt?.id ?? idx,
      label: opt?.label || String.fromCharCode(65 + idx),
      value: opt?.value ?? opt?.text ?? opt?.label ?? String(opt ?? ""),
    };
  });

  return {
    id: q?.id ?? fallbackNumber,
    number: q?.questionNumber ?? q?.number ?? fallbackNumber,
    text,
    options,
    correctOption: q?.correctOption ?? q?.correct_option ?? q?.correctAnswer ?? null,
    marks: Number(q?.marks) > 0 ? Number(q.marks) : 1,
  };
};

/**
 * Extracts normalized sections with sequentially numbered questions from a backend QuestionPaperResponse
 * or mapped frontend paper object.
 */
export const extractSectionsForDisplay = (paper) => {
  if (!paper) return [];
  const source = paper.raw || paper;
  const rawSections = source.sections;
  const rawQuestions = source.questions;

  let sectionList = [];

  if (Array.isArray(rawSections) && rawSections.length > 0 && rawSections.some((s) => Array.isArray(s?.questions))) {
    sectionList = rawSections.map((sec, idx) => ({
      id: sec.id ?? idx + 1,
      name: sec.name || sec.title || `Section ${String.fromCharCode(65 + idx)}`,
      questions: Array.isArray(sec.questions) ? sec.questions : [],
    }));
  } else if (rawSections && typeof rawSections === "object" && !Array.isArray(rawSections)) {
    sectionList = Object.entries(rawSections).map(([key, qs], idx) => ({
      id: idx + 1,
      name: key,
      questions: Array.isArray(qs) ? qs : [],
    }));
  } else if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
    const grouped = new Map();
    rawQuestions.forEach((q) => {
      const secName = q.sectionName || q.section_name || q.section || "Questions";
      if (!grouped.has(secName)) {
        grouped.set(secName, {
          id: q.sectionId ?? grouped.size + 1,
          name: secName,
          questions: [],
        });
      }
      grouped.get(secName).questions.push(q);
    });
    sectionList = Array.from(grouped.values());
  } else if (rawQuestions && typeof rawQuestions === "object" && !Array.isArray(rawQuestions)) {
    // Handle keyed question objects like { general: [...], safety: [...] } or { 1: { q, options }, 2: ... }
    const entries = Object.entries(rawQuestions);
    const hasArrayValues = entries.some(([, val]) => Array.isArray(val));
    if (hasArrayValues) {
      sectionList = entries.map(([key, val], idx) => ({
        id: idx + 1,
        name: key.charAt(0).toUpperCase() + key.slice(1) + " Questions",
        questions: Array.isArray(val) ? val : [],
      }));
    } else {
      sectionList = [
        {
          id: 1,
          name: "Assessment Questions",
          questions: entries
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([num, q]) => ({ ...q, number: Number(num) || undefined })),
        },
      ];
    }
  }

  let runningNumber = 1;
  return sectionList
    .map((sec) => {
      const normalizedQuestions = (sec.questions || []).map((q) => {
        const item = normalizeQuestionItem(q, runningNumber);
        item.number = runningNumber++;
        return item;
      });
      return {
        ...sec,
        questions: normalizedQuestions,
      };
    })
    .filter((sec) => sec.questions.length > 0);
};

/**
 * Computes score/percentage/passed summary if questions have correctOption defined.
 */
export const calculatePaperScore = (sections = [], answers = {}, passPercentage = 80) => {
  const allQuestions = sections.flatMap((s) => s.questions || []);
  const totalQuestions = allQuestions.length;
  let answeredCount = 0;
  let maxScore = 0;
  let score = 0;
  let gradableCount = 0;

  allQuestions.forEach((q) => {
    const ans =
      answers[q.number] !== undefined
        ? answers[q.number]
        : answers[String(q.number)];
    const hasAnswer = ans !== undefined && ans !== null && String(ans).trim() !== "";
    if (hasAnswer) {
      answeredCount += 1;
    }

    const marks = Number(q.marks) || 1;
    maxScore += marks;

    if (q.correctOption !== null && q.correctOption !== undefined && q.options?.length > 0) {
      gradableCount += 1;
      if (hasAnswer) {
        const selectedOpt = q.options[Number(ans)] || q.options.find((o) => String(o.id) === String(ans));
        const isMatch =
          String(ans) === String(q.correctOption) ||
          (selectedOpt &&
            (String(selectedOpt.id) === String(q.correctOption) ||
              String(selectedOpt.label).toUpperCase() === String(q.correctOption).toUpperCase()));
        if (isMatch) {
          score += marks;
        }
      }
    }
  });

  const isGradable = gradableCount > 0 && maxScore > 0;
  const percentage = isGradable ? Number(((score / maxScore) * 100).toFixed(2)) : null;
  const passed = isGradable ? percentage >= Number(passPercentage || 80) : null;

  return {
    answeredCount,
    totalQuestions,
    score: isGradable ? score : null,
    maxScore: maxScore > 0 ? maxScore : null,
    percentage,
    passed,
    isGradable,
  };
};

/**
 * Normalizes a backend QuestionPaperSubmissionResponse into a clean UI model.
 */
export const mapApiSubmissionToModel = (apiSub) => {
  if (!apiSub || typeof apiSub !== "object") return null;

  return {
    id: apiSub.id,
    questionPaperId: apiSub.question_paper_id,
    questionPaperTitle:
      apiSub.question_paper_title ||
      (normalizeDayType(apiSub.day_type) === "DAY_1"
        ? "Day 1 Question Paper"
        : normalizeDayType(apiSub.day_type) === "DAY_2"
          ? "Day 2 Question Paper"
          : "Question Paper"),
    userId: apiSub.user_id,
    userName: apiSub.user_name || "",
    userPayCode: apiSub.user_pay_code || "",
    userEmail: apiSub.user_email || "",
    dayType: normalizeDayType(apiSub.day_type),
    rawDayType: apiSub.day_type,
    answers: apiSub.answers && typeof apiSub.answers === "object" ? apiSub.answers : {},
    participantInfo:
      apiSub.participant_info && typeof apiSub.participant_info === "object"
        ? apiSub.participant_info
        : {},
    trainingSchedule: apiSub.training_schedule || null,
    answeredCount: apiSub.answered_count ?? 0,
    totalQuestions: apiSub.total_questions ?? 0,
    score: apiSub.score,
    maxScore: apiSub.max_score,
    percentage: apiSub.percentage,
    passed: apiSub.passed,
    status: apiSub.status || "SUBMITTED",
    remarks: apiSub.remarks || "",
    submittedAt: apiSub.submitted_at || null,
    updatedAt: apiSub.updated_at || null,
    raw: apiSub,
  };
};

export default QuestionPaperApi;
