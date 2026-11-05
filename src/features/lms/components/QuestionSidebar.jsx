import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

import { useMemo, useState } from "react";

const QuestionSidebar = ({
  sections,
  selectedQuestion,
  setSelectedQuestion,
  addQuestion,
  addSection,
  deleteQuestion,
  deleteSection,
}) => {
  const [search, setSearch] = useState("");
  const [collapsedSections, setCollapsedSections] = useState({});

  // =====================================================
  // TOGGLE SECTION
  // =====================================================

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // =====================================================
  // QUESTION NUMBER
  // =====================================================

  const getQuestionNumber = (sectionId, questionIndex) => {
    let number = 0;

    for (const section of sections) {
      if (section.id === sectionId) {
        return number + questionIndex + 1;
      }

      number += section.questions.length;
    }

    return questionIndex + 1;
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;

    return sections
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (question) =>
            question.question?.toLowerCase().includes(search.toLowerCase()) ||
            question.title?.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((section) => section.questions.length > 0);
  }, [sections, search]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <aside className="w-[310px] shrink-0 bg-[#fafbfe] border-r border-gray-200 flex flex-col">
      {/* =================================================
          SECTIONS HEADER
      ================================================= */}

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-700">
              Sections
            </h2>

            <span className="text-[10px] font-semibold text-gray-400">
              ({sections.length})
            </span>
          </div>

          <button
            type="button"
            onClick={addSection}
            className="
              h-8
              px-3
              rounded-lg
              border
              border-[#e2edf2]
              bg-white
              text-[#0d9488]
              text-[11px]
              font-semibold
              flex
              items-center
              gap-1
              hover:bg-[#e6f7f5]
              transition
            "
          >
            <AddOutlinedIcon sx={{ fontSize: 15 }} />
            Add Section
          </button>
        </div>

        {/* =================================================
            SECTION CARDS
        ================================================= */}

        <div className="space-y-2">
          {sections.map((section) => {
            const sectionActive = section.questions.some(
              (question) => question.id === selectedQuestion,
            );

            return (
              <div
                key={section.id}
                className={`
                  relative
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  bg-white
                  transition
                  ${
                    sectionActive
                      ? "border-[#0d9488] bg-[#e6f7f5]/40"
                      : "border-[#e2edf2]"
                  }
                `}
              >
                {sectionActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-[#0d9488]" />
                )}

                <div className="flex items-center gap-2">
                  <DragIndicatorOutlinedIcon
                    sx={{
                      fontSize: 15,
                      color: "#9ca3af",
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700">
                      {section.title}
                    </p>

                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {section.description}
                    </p>
                  </div>

                  <span className="px-2 py-1 rounded-md bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0f766e] text-[9px] font-semibold whitespace-nowrap">
                    {section.questions.length} Qs
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete section"
                  >
                    <MoreVertOutlinedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================
          QUESTIONS
      ================================================= */}

      <div className="flex-1 min-h-0 border-t border-gray-200 px-4 pt-4 flex flex-col">
        {/* HEADER */}

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-wide text-gray-700">
            Questions in Section A
          </h2>

          <span className="text-[9px] text-gray-400">
            {sections.find((section) =>
              section.questions.some(
                (question) => question.id === selectedQuestion,
              ),
            )?.questions.length || 0}{" "}
            Questions
          </span>
        </div>

        {/* SEARCH */}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-8 rounded-lg border border-gray-200 bg-white flex items-center px-2.5">
            <SearchOutlinedIcon
              sx={{
                fontSize: 15,
                color: "#9ca3af",
              }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="
                ml-2
                w-full
                outline-none
                text-[10px]
                text-gray-600
                placeholder:text-gray-300
                bg-transparent
              "
            />
          </div>

          <button
            type="button"
            className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-400 flex items-center justify-center"
          >
            <TuneOutlinedIcon sx={{ fontSize: 15 }} />
          </button>
        </div>

        {/* ADD QUESTION */}

        <button
          type="button"
          onClick={() => {
            const firstSection = sections[0];

            if (firstSection) {
              addQuestion(firstSection.id);
            }
          }}
          className="
            w-full
            h-8
            rounded-xl
            bg-gradient-to-r from-[#0d9488] to-[#14b8a6]
            hover:from-[#0f766e] hover:to-[#0d9488]
            text-white
            text-[10px]
            font-semibold
            flex
            items-center
            justify-center
            gap-1.5
            mb-3
            shadow-xs
          "
        >
          <AddOutlinedIcon sx={{ fontSize: 15 }} />
          Add Question
        </button>

        {/* QUESTION LIST */}

        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
          {filteredSections.map((section) => {
            const collapsed = collapsedSections[section.id];

            return (
              <div key={section.id}>
                {/* SECTION TITLE */}

                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between py-1.5 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    {collapsed ? (
                      <KeyboardArrowDownOutlinedIcon
                        sx={{
                          fontSize: 14,
                          color: "#9ca3af",
                        }}
                      />
                    ) : (
                      <KeyboardArrowUpOutlinedIcon
                        sx={{
                          fontSize: 14,
                          color: "#9ca3af",
                        }}
                      />
                    )}

                    <span className="text-[9px] font-semibold text-gray-500">
                      {section.title}
                    </span>
                  </div>

                  <span className="text-[9px] text-gray-400">
                    {section.questions.length}
                  </span>
                </button>

                {/* QUESTIONS */}

                {!collapsed &&
                  section.questions.map((question, index) => {
                    const active = question.id === selectedQuestion;

                    const number = getQuestionNumber(section.id, index);

                    return (
                      <div
                        key={question.id}
                        onClick={() => setSelectedQuestion(question.id)}
                        className={`
                            group
                            cursor-pointer
                            min-h-[34px]
                            rounded-lg
                            border
                            px-2
                            flex
                            items-center
                            gap-2
                            transition
                            ${
                              active
                                ? "border-[#0d9488] bg-[#e6f7f5]/40"
                                : "border-transparent bg-white hover:border-gray-200"
                            }
                          `}
                      >
                        <span
                          className={`
                              text-[9px]
                              font-semibold
                              w-4
                              ${active ? "text-[#0d9488]" : "text-[#8A8A8A]"}
                            `}
                        >
                          {number}.
                        </span>

                        <p
                          className={`
                              flex-1
                              text-[9px]
                              truncate
                              ${
                                active
                                  ? "text-gray-700 font-medium"
                                  : "text-gray-500"
                              }
                            `}
                        >
                          {question.question || "Enter question..."}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(question.id);
                          }}
                          className="
                              opacity-0
                              group-hover:opacity-100
                              text-gray-300
                              hover:text-red-500
                              transition
                            "
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}

        <div className="py-2 text-[9px] text-gray-400 border-t border-gray-100 mt-2">
          Showing{" "}
          {filteredSections.reduce(
            (total, section) => total + section.questions.length,
            0,
          )}{" "}
          questions
        </div>
      </div>
    </aside>
  );
};

export default QuestionSidebar;
