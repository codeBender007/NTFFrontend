/**
 * Frontend persistence for Supervisor evaluation & grading of employee test submissions.
 * Keyed by submission ID so graded marks sync cleanly between Supervisor -> Submitted Papers
 * and that specific employee's Past Question Papers view.
 */

const SUBMISSION_GRADES_KEY = "ntf_supervisor_submission_grades";

export const getAllSubmissionGrades = () => {
  try {
    const raw = localStorage.getItem(SUBMISSION_GRADES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

export const getGradeForSubmission = (submissionId) => {
  if (submissionId == null) return null;
  const all = getAllSubmissionGrades();
  return all[String(submissionId)] || null;
};

export const saveGradeForSubmission = (submissionId, gradeData) => {
  if (submissionId == null) return null;
  const key = String(submissionId);
  const all = getAllSubmissionGrades();

  const record = {
    submissionId: key,
    questionMarks: gradeData.questionMarks || {},
    totalMarksObtained: Number(gradeData.totalMarksObtained) || 0,
    maxMarks: Number(gradeData.maxMarks) || 0,
    percentage:
      gradeData.percentage != null ? Number(gradeData.percentage) : null,
    passed:
      gradeData.passed !== undefined ? Boolean(gradeData.passed) : null,
    remarks: gradeData.remarks || "",
    status: "Graded",
    gradedBy: gradeData.gradedBy || "Supervisor",
    gradedAt: new Date().toISOString(),
  };

  all[key] = record;

  try {
    localStorage.setItem(SUBMISSION_GRADES_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save submission grade:", err);
  }

  return record;
};

/**
 * Merges a normalized backend submission model with any Supervisor-assigned grade.
 */
export const mergeSubmissionWithGrade = (submission) => {
  if (!submission) return null;
  const grade = getGradeForSubmission(submission.id);

  if (!grade) {
    return {
      ...submission,
      isGraded: false,
      evaluationStatus: "Pending Review",
      questionMarks: {},
    };
  }

  return {
    ...submission,
    isGraded: true,
    evaluationStatus: "Graded",
    score: grade.totalMarksObtained,
    maxScore: grade.maxMarks || submission.maxScore,
    percentage:
      grade.percentage != null ? grade.percentage : submission.percentage,
    passed: grade.passed !== null ? grade.passed : submission.passed,
    remarks: grade.remarks || submission.remarks || "",
    questionMarks: grade.questionMarks || {},
    gradedBy: grade.gradedBy,
    gradedAt: grade.gradedAt,
  };
};
