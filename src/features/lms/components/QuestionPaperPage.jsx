import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import TopActions from "./TopActions";
import BasicInformation from "./BasicInformation";
import QuestionSectionsCard from "./QuestionSectionsCard";
import QuestionListCard from "./QuestionListCard";
import QuestionForm from "./QuestionForm";
import { savePaperToStore } from "../utils/testPapers";

const DEFAULT_OPTIONS = [
  { id: 1, label: "A", value: "Option A" },
  { id: 2, label: "B", value: "Option B" },
  { id: 3, label: "C", value: "Option C" },
  { id: 4, label: "D", value: "Option D" },
];

const createQuestion = (id, qNum = 1) => ({
  id,
  title: `Q${qNum}`,
  question: "Write your question here.",
  options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
  correctOption: 2,
  marks: 1,
  negativeMarks: 0,
  difficulty: "Medium",
  required: true,
  questionType: "Multiple Choice (MCQ)",
  saved: true,
});

const createSection = (id) => {
  const letters = ["A", "B", "C", "D", "E"];
  const letter = letters[id - 1] || String.fromCharCode(64 + id);
  const subtitles = [
    "Multiple Choice Questions",
    "Short Answer Questions",
    "Long Answer Questions",
  ];
  return {
    id,
    name: `Section ${letter}`,
    subtitle: subtitles[id - 1] || "Assessment Questions",
    questions: [createQuestion(id * 100 + 1, 1), createQuestion(id * 100 + 2, 2)],
  };
};

const createInitialPaper = () => [
  createSection(1),
  createSection(2),
  createSection(3),
];

const loadPaper = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let loadedSections = parsed;
        if (!parsed.some((s) => s.questions)) {
          loadedSections = [{ id: 1, name: "Section A", subtitle: "Multiple Choice Questions", questions: parsed }];
        }
        return loadedSections.map((sec, secIdx) => ({
          ...sec,
          name: sec.name || `Section ${String.fromCharCode(65 + secIdx)}`,
          questions: sec.questions.map((q, idx) => ({
            ...q,
            title: q.title && !/^Q\d+$/.test(q.title) ? q.title : `Q${idx + 1}`,
          })),
        }));
      }
    }
  } catch {
    /* error */
  }
  return createInitialPaper();
};

const QuestionPaperPage = ({
  level = "L0",
  initialPaper = null,
  storageKey: customStorageKey,
  previewPath: customPreviewPath,
  onPreview: customOnPreview,
  onSaveSuccess,
  bannerTitle,
  onBack,
}) => {
  const navigate = useNavigate();
  const storageKey =
    customStorageKey ||
    (initialPaper?.id ? `paper_${initialPaper.id}` : `${level.toLowerCase()}_question_paper`);
  const previewPath = customPreviewPath || `/lms/${level.toLowerCase()}/preview`;

  const [sections, setSections] = useState(() => {
    if (initialPaper?.sections?.length) {
      return initialPaper.sections;
    }
    return loadPaper(storageKey);
  });
  const [selectedSection, setSelectedSection] = useState(
    () => (initialPaper?.sections?.[0]?.id || sections[0]?.id)
  );
  const [selectedQuestion, setSelectedQuestion] = useState(
    () => (initialPaper?.sections?.[0]?.questions?.[0]?.id || sections[0]?.questions[0]?.id)
  );
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (initialPaper) {
      if (initialPaper.sections?.length) {
        setSections(initialPaper.sections);
        setSelectedSection(initialPaper.sections[0]?.id);
        setSelectedQuestion(initialPaper.sections[0]?.questions?.[0]?.id);
      }
      if (initialPaper.meta) {
        localStorage.setItem(`${storageKey}_meta`, JSON.stringify(initialPaper.meta));
      }
    }
  }, [initialPaper, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sections));
  }, [storageKey, sections]);

  const activeSection =
    sections.find((s) => s.id === selectedSection) || sections[0];

  const activeQuestionIndex =
    activeSection?.questions?.findIndex((q) => q.id === selectedQuestion) ?? 0;

  const selected =
    activeSection?.questions[activeQuestionIndex] ||
    activeSection?.questions[0];

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const totalQuestions = sections.reduce(
    (acc, s) => acc + (s.questions?.length || 0),
    0
  );

  const totalMarks = sections.reduce(
    (acc, s) =>
      acc +
      (s.questions?.reduce((qAcc, q) => qAcc + (Number(q.marks) || 0), 0) || 0),
    0
  );

  const handleMetaChange = (meta) => {
    try {
      localStorage.setItem(`${storageKey}_meta`, JSON.stringify(meta));
    } catch {
      /* ignore */
    }
  };

  const nextQuestionId = () =>
    sections.reduce(
      (max, s) => Math.max(max, ...s.questions.map((q) => q.id)),
      0
    ) + 1;

  const updateQuestion = (id, updates) => {
    if (!activeSection || !id) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSection.id
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === id ? { ...q, ...updates } : q
              ),
            }
          : s
      )
    );
  };

  const saveAll = () => {
    const paperId = getPaperId();

    let meta = {};
    try {
      meta = JSON.parse(localStorage.getItem(`${storageKey}_meta`)) || {};
    } catch {
      /* ignore */
    }

    const passPercentage = Number(meta.passPercentage) || 80;
    const testTitle =
      meta.testTitle?.trim() ||
      meta.headerTitle?.trim() ||
      "SKILL EVALUATION TEST PAPER";
    const course =
      meta.departments?.trim() ||
      meta.subTitle?.trim() ||
      "DOJO Technical Evaluation";

    const paperData = {
      id: paperId,
      title: testTitle,
      target: meta.target || `${passPercentage}% or Above`,
      testType: meta.testType || "Online",
      course: course,
      passing: `${passPercentage}% or Above`,
      marks: `${totalMarks} Marks`,
      fullMarks: "Full Marks",
      level,
      sections,
      meta: {
        ...meta,
        testTitle,
        headerTitle: meta.headerTitle || testTitle,
        duration: meta.duration || 60,
        passPercentage,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdRole: "supervisor",
    };

    savePaperToStore(paperData);
    if (onSaveSuccess) {
      onSaveSuccess(paperData);
    }

    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: s.questions.map((q) => ({ ...q, saved: true })),
      }))
    );
    showToast("Question paper saved successfully");

    // Clear stored paper ID so creating a subsequent paper generates a fresh unique ID
    try {
      localStorage.removeItem(`${storageKey}_paper_id`);
    } catch {
      /* ignore */
    }
  };

  const getPaperId = () => {
    if (initialPaper?.id) return initialPaper.id;
    try {
      const key = `${storageKey}_paper_id`;
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      const id = `paper_${Date.now()}`;
      localStorage.setItem(key, id);
      return id;
    } catch {
      return `paper_${Date.now()}`;
    }
  };

  const selectSection = (id) => {
    setSelectedSection(id);
    const section = sections.find((s) => s.id === id);
    setSelectedQuestion(section?.questions[0]?.id ?? null);
  };

  const addSection = () => {
    const nextId = sections.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    const newSection = createSection(nextId);
    setSections([...sections, newSection]);
    setSelectedSection(nextId);
    setSelectedQuestion(newSection.questions[0].id);
    showToast(`Added ${newSection.name}`);
  };

  const deleteSection = (id) => {
    if (sections.length <= 1) return;
    const remaining = sections.filter((s) => s.id !== id);
    setSections(remaining);

    if (selectedSection === id) {
      const next = remaining[0];
      setSelectedSection(next?.id ?? null);
      setSelectedQuestion(next?.questions[0]?.id ?? null);
    }
    showToast("Section deleted");
  };

  const renameSection = (id, name) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
    showToast("Section name updated");
  };

  const addQuestion = () => {
    if (!activeSection) return;

    const qNum = (activeSection.questions?.length || 0) + 1;
    const newQuestion = createQuestion(nextQuestionId(), qNum);
    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSection.id
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      )
    );
    setSelectedQuestion(newQuestion.id);
  };

  const deleteQuestion = (id) => {
    if (!activeSection || activeSection.questions.length <= 1) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSection.id
          ? { ...s, questions: s.questions.filter((q) => q.id !== id) }
          : s
      )
    );

    if (selectedQuestion === id) {
      const remaining = activeSection.questions.filter((q) => q.id !== id);
      setSelectedQuestion(remaining[0]?.id ?? null);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setSelectedQuestion(activeSection.questions[activeQuestionIndex - 1].id);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < activeSection.questions.length - 1) {
      setSelectedQuestion(activeSection.questions[activeQuestionIndex + 1].id);
    }
  };

  const handlePreview = () => {
    saveAll();
    if (customOnPreview) {
      customOnPreview();
    } else {
      navigate(previewPath);
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Banner - Exact pattern from main Dashboard */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Back"
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
          )}
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            {bannerTitle || `Question Paper Editor (${level})`}
          </h2>
        </div>
      </div>

      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 backdrop-blur-md transition-all">
          <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} />
          <span>{toast}</span>
        </div>
      )}

      <TopActions
        title={bannerTitle || (initialPaper ? `Editing: ${initialPaper.title}` : `Question Paper Editor (${level})`)}
        level={level}
        totalQuestions={totalQuestions}
        totalMarks={totalMarks}
        sectionsCount={sections.length}
        onPreview={handlePreview}
        onSave={saveAll}
      />

      <BasicInformation
        key={initialPaper?.id || "new_paper"}
        onChange={handleMetaChange}
        initialData={initialPaper?.meta || {}}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-5">
          <QuestionSectionsCard
            sections={sections}
            selectedSection={selectedSection}
            onSelectSection={selectSection}
            onAddSection={addSection}
            onDeleteSection={deleteSection}
            onRenameSection={renameSection}
          />

          <QuestionListCard
            sectionName={activeSection?.name || "Section A"}
            questions={activeSection?.questions || []}
            selectedQuestion={selectedQuestion}
            onSelectQuestion={setSelectedQuestion}
            onAddQuestion={addQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col h-full">
          <QuestionForm
            activeSection={activeSection}
            question={selected}
            questionIndex={activeQuestionIndex}
            totalQuestionsCount={activeSection?.questions?.length || 1}
            onChange={(updates) => updateQuestion(selected?.id, updates)}
            onPrevQuestion={handlePrevQuestion}
            onNextQuestion={handleNextQuestion}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperPage;
