import { getSavedPapers, savePaperToStore, deletePaperFromStore } from "@/features/lms/utils/testPapers.js";

const SUPERVISOR_TEST_PAPERS_KEY = "ntf_supervisor_test_papers";
const SUPERVISOR_ACTIVE_PAPER_KEY = "ntf_supervisor_active_paper";

/**
 * Retrieve all test papers saved by or accessible to Supervisor
 */
export const getSupervisorPapers = () => {
  let supList = [];
  try {
    const raw = localStorage.getItem(SUPERVISOR_TEST_PAPERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) supList = parsed;
    }
  } catch (err) {
    console.warn("Could not read supervisor test papers:", err);
  }

  const centralPapers = getSavedPapers();
  const allMap = new Map();
  if (Array.isArray(centralPapers)) {
    centralPapers.forEach((p) => {
      if (p && p.id) allMap.set(p.id, p);
    });
  }
  supList.forEach((p) => {
    if (p && p.id) allMap.set(p.id, p);
  });

  return Array.from(allMap.values()).sort(
    (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
  );
};

/**
 * Save a newly created/edited test paper into Supervisor storage and sync with central store
 */
export const saveSupervisorPaper = (paper) => {
  try {
    const paperId = paper.id || `sup_paper_${Date.now()}`;
    const timestamp = Date.now();

    const formattedPaper = {
      ...paper,
      id: paperId,
      createdRole: "supervisor",
      updatedAt: timestamp,
      createdAt: paper.createdAt || timestamp,
    };

    // 1. Save in supervisor-specific storage
    const existing = getSupervisorPapers();
    const existingIndex = existing.findIndex((p) => p.id === paperId);
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = existing.map((p) => (p.id === paperId ? formattedPaper : p));
    } else {
      updatedList = [formattedPaper, ...existing];
    }
    localStorage.setItem(SUPERVISOR_TEST_PAPERS_KEY, JSON.stringify(updatedList));

    // 2. Also save into central test papers store
    savePaperToStore(formattedPaper);

    // 3. Mark as currently active paper for upcoming operator assignment step
    localStorage.setItem(SUPERVISOR_ACTIVE_PAPER_KEY, JSON.stringify(formattedPaper));

    return formattedPaper;
  } catch (err) {
    console.error("Failed to save supervisor test paper:", err);
    return null;
  }
};

/**
 * Get active paper selected or recently created by Supervisor
 */
export const getActiveSupervisorPaper = () => {
  try {
    const raw = localStorage.getItem(SUPERVISOR_ACTIVE_PAPER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Set active supervisor test paper
 */
export const setActiveSupervisorPaper = (paper) => {
  try {
    if (paper) {
      localStorage.setItem(SUPERVISOR_ACTIVE_PAPER_KEY, JSON.stringify(paper));
    } else {
      localStorage.removeItem(SUPERVISOR_ACTIVE_PAPER_KEY);
    }
  } catch {
    /* ignore */
  }
};

/**
 * Delete a test paper from supervisor storage and central store
 */
export const deleteSupervisorPaper = (paperId) => {
  try {
    const raw = localStorage.getItem(SUPERVISOR_TEST_PAPERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const updated = parsed.filter((p) => p.id !== paperId);
        localStorage.setItem(SUPERVISOR_TEST_PAPERS_KEY, JSON.stringify(updated));
      }
    }
    deletePaperFromStore(paperId);

    const active = getActiveSupervisorPaper();
    if (active?.id === paperId) {
      localStorage.removeItem(SUPERVISOR_ACTIVE_PAPER_KEY);
    }
    return true;
  } catch (err) {
    console.error("Failed to delete supervisor paper:", err);
    return false;
  }
};

