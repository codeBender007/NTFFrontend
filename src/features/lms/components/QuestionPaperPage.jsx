import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import TopActions from "./TopActions";
import BasicInformation from "./BasicInformation";
import QuestionSectionsCard from "./QuestionSectionsCard";
import QuestionListCard from "./QuestionListCard";
import QuestionForm from "./QuestionForm";
import QuestionFooterStats from "./QuestionFooterStats";
import { savePaperToStore } from "../utils/testPapers";
import { lmsMenus } from "../data/LMSMenu";

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

const QuestionPaperPage = ({ level = "L0" }) => {
  const navigate = useNavigate();
  const storageKey = `${level.toLowerCase()}_question_paper`;
  const previewPath = `/lms/${level.toLowerCase()}/preview`;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("DOJO Hiring");

  const [sections, setSections] = useState(() => loadPaper(storageKey));
  const [selectedSection, setSelectedSection] = useState(
    () => sections[0]?.id
  );
  const [selectedQuestion, setSelectedQuestion] = useState(
    () => sections[0]?.questions[0]?.id
  );
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

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

    savePaperToStore({
      id: paperId,
      title: meta.testTitle || "UNTITLED TEST PAPER",
      target: `${passPercentage}% or Above`,
      testType: "Online",
      course: meta.subTitle || meta.departments || "-",
      passing: `${passPercentage}% or Above`,
      marks: `${totalMarks} Marks`,
      fullMarks: "Full Marks",
      level,
      sections,
      meta,
    });

    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: s.questions.map((q) => ({ ...q, saved: true })),
      }))
    );
    showToast("Question paper saved successfully");
  };

  const getPaperId = () => {
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
    navigate(previewPath);
  };

  return (
    <div className="flex h-screen bg-[#F4F5F9]">
      <Sidebar
        menuItems={lmsMenus}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="sticky top-0 z-30 bg-white shadow-xs">
          <Navbar activeMenu="LMS / DOJO Hiring" setMobileOpen={setMobileOpen} />
        </div>

        {toast && (
          <div className="fixed top-16 right-6 z-50 bg-gray-900/95 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md transition-all">
            <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} />
            <span>{toast}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F5F9] space-y-5">
          {/* Top Actions Sticky Header Bar */}
          <TopActions
            title="Question Paper Editor"
            level={level}
            totalQuestions={totalQuestions}
            totalMarks={totalMarks}
            sectionsCount={sections.length}
            onPreview={handlePreview}
            onSave={saveAll}
          />

          {/* Collapsible Paper Details & Header Config */}
          <BasicInformation onChange={handleMetaChange} />

          {/* Main 2-Column Grid matching reference mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Sections & Questions Selector Panels */}
            <div className="lg:col-span-4 space-y-5">
              <QuestionSectionsCard
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={selectSection}
                onAddSection={addSection}
                onDeleteSection={deleteSection}
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

            {/* Right Column: Main Edit Question Sheet */}
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

          {/* Bottom Footer 5 KPI Metric Cards */}
          <QuestionFooterStats
            totalSections={sections.length}
            totalQuestions={totalQuestions}
            totalMarks={totalMarks}
            duration="60 min"
            lastUpdated="2 mins ago"
          />
        </main>
      </div>
    </div>
  );
};

export default QuestionPaperPage;
