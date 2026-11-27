/**
 * Frontend persistence for Supervisor -> Operator Question Paper assignments.
 * Keyed strictly per Operator (by employee ID / paycode / normalized name)
 * so assignments remain cleanly isolated per employee for the Employee Portal.
 */

const SUPERVISOR_ASSIGNMENTS_KEY = "ntf_supervisor_paper_assignments";

export const getOperatorAssignmentKey = (operator) => {
  if (!operator) return "unknown_operator";
  const payCode = String(
    operator.payCode || operator.paycode || operator.employeeId || ""
  ).trim();
  if (payCode) return `paycode_${payCode.toLowerCase()}`;

  const id = operator.id != null ? String(operator.id).trim() : "";
  if (id && id !== "undefined" && id !== "null") return `id_${id.toLowerCase()}`;

  const name = String(operator.empName || operator.name || operator.username || "")
    .trim()
    .toLowerCase();
  if (name) return `name_${name.replace(/\s+/g, "_")}`;

  return "unknown_operator";
};

export const getAllAssignments = () => {
  try {
    const raw = localStorage.getItem(SUPERVISOR_ASSIGNMENTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

/**
 * Assign a question paper to one or more selected Operators.
 * Deduplicates by paperId per operator and updates assignedAt timestamp.
 */
export const assignPaperToOperators = (
  paper,
  operators = [],
  assignedBy = "Supervisor"
) => {
  if (!paper || !Array.isArray(operators) || operators.length === 0) {
    return { assignedCount: 0, assignedOperators: [], paper };
  }

  const store = getAllAssignments();
  const timestamp = new Date().toISOString();
  const paperId = String(paper.id ?? paper.title ?? Date.now());

  const assignmentEntry = {
    paperId,
    title: paper.title || "Untitled Test Paper",
    description: paper.description || "",
    level: paper.level || "L0",
    dayType: paper.dayType || paper.level || "L0",
    totalMarks: paper.totalMarks ?? 0,
    totalQuestions: paper.totalQuestions ?? 0,
    duration: paper.meta?.duration || 60,
    passPercentage: paper.meta?.passPercentage || 80,
    assignedAt: timestamp,
    assignedBy,
    status: "ASSIGNED",
  };

  operators.forEach((op) => {
    const opKey = getOperatorAssignmentKey(op);
    const existingRecord = store[opKey] || {
      operatorKey: opKey,
      operator: {
        id: op.id ?? null,
        empName: op.empName || op.name || "",
        payCode: op.payCode || op.paycode || "",
        email: op.email || "",
        department: op.department || "",
        line: op.line || "",
        joiningDate: op.joiningDate || op.dateOfJoining || "",
        designation: op.designation || "Operator",
      },
      papers: [],
    };

    const existingPapers = Array.isArray(existingRecord.papers)
      ? existingRecord.papers
      : [];
    const filtered = existingPapers.filter((p) => String(p.paperId) !== paperId);

    store[opKey] = {
      ...existingRecord,
      operator: {
        ...existingRecord.operator,
        id: op.id ?? existingRecord.operator.id,
        empName: op.empName || op.name || existingRecord.operator.empName,
        payCode: op.payCode || op.paycode || existingRecord.operator.payCode,
        email: op.email || existingRecord.operator.email,
        department: op.department || existingRecord.operator.department,
        line: op.line || existingRecord.operator.line,
        joiningDate:
          op.joiningDate || op.dateOfJoining || existingRecord.operator.joiningDate,
      },
      papers: [assignmentEntry, ...filtered],
      updatedAt: timestamp,
    };
  });

  try {
    localStorage.setItem(SUPERVISOR_ASSIGNMENTS_KEY, JSON.stringify(store));
  } catch (err) {
    console.error("Failed to persist operator assignments:", err);
  }

  return {
    assignedCount: operators.length,
    assignedOperators: operators,
    paper,
  };
};

/**
 * Returns a Set of operator keys that have already been assigned the given paperId.
 */
export const getAssignedOperatorKeysForPaper = (paperId) => {
  if (paperId == null) return new Set();
  const targetId = String(paperId);
  const store = getAllAssignments();
  const keys = new Set();

  Object.entries(store).forEach(([opKey, record]) => {
    const papers = Array.isArray(record?.papers) ? record.papers : [];
    if (papers.some((p) => String(p.paperId) === targetId)) {
      keys.add(opKey);
    }
  });

  return keys;
};

/**
 * Retrieve all papers assigned to a specific employee (matched by payCode, id, email, or name).
 */
export const getAssignedPapersForOperator = (userOrOperator) => {
  if (!userOrOperator) return [];
  const store = getAllAssignments();
  const directKey = getOperatorAssignmentKey(userOrOperator);

  if (store[directKey]?.papers) {
    return store[directKey].papers;
  }

  const userPayCode = String(
    userOrOperator.payCode || userOrOperator.paycode || ""
  )
    .trim()
    .toLowerCase();
  const userId =
    userOrOperator.id != null ? String(userOrOperator.id).trim() : "";
  const userEmail = String(userOrOperator.email || "").trim().toLowerCase();
  const userName = String(
    userOrOperator.empName || userOrOperator.name || userOrOperator.username || ""
  )
    .trim()
    .toLowerCase();

  const matched = Object.values(store).find((record) => {
    const op = record?.operator || {};
    if (userPayCode && String(op.payCode || "").trim().toLowerCase() === userPayCode) {
      return true;
    }
    if (userId && op.id != null && String(op.id).trim() === userId) {
      return true;
    }
    if (userEmail && String(op.email || "").trim().toLowerCase() === userEmail) {
      return true;
    }
    if (userName && String(op.empName || "").trim().toLowerCase() === userName) {
      return true;
    }
    return false;
  });

  return Array.isArray(matched?.papers) ? matched.papers : [];
};
