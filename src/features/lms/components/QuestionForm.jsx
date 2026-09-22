// import { useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FormatBoldOutlinedIcon from "@mui/icons-material/FormatBoldOutlined";
import FormatItalicOutlinedIcon from "@mui/icons-material/FormatItalicOutlined";
import FormatUnderlinedOutlinedIcon from "@mui/icons-material/FormatUnderlinedOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
// import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";

const QuestionForm = ({
  activeSection,
  question,
  questionIndex = 0,
  totalQuestionsCount = 1,
  onChange,
  onPrevQuestion,
  onNextQuestion,
}) => {
  if (!question) return null;

  const {
    options = [],
    correctOption,
    marks = 1,
    negativeMarks = 0,
    difficulty = "Medium",
    required = true,
    questionType = "Multiple Choice (MCQ)",
  } = question;

  const currentQNum = questionIndex + 1;

  const nextOptionId = () =>
    options.reduce((max, o) => Math.max(max, o.id), 0) + 1;

  const addOption = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.length >= 6) return;

    onChange({
      options: [
        ...options,
        { id: nextOptionId(), label: alphabet[options.length], value: "" },
      ],
    });
  };

  const updateOption = (id, value) => {
    onChange({
      options: options.map((o) => (o.id === id ? { ...o, value } : o)),
    });
  };

  const removeOption = (id) => {
    if (options.length <= 2) return;
    const remaining = options.filter((o) => o.id !== id);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const relabeled = remaining.map((o, idx) => ({
      ...o,
      label: alphabet[idx],
    }));

    onChange({
      options: relabeled,
      correctOption: correctOption === id ? null : correctOption,
    });
  };

  const handleMarksChange = (delta) => {
    const newMarks = Math.max(1, (marks || 1) + delta);
    onChange({ marks: newMarks });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-5 sm:p-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-gray-100 pb-4">
          <h2 className="text-base font-bold text-gray-900">Edit Question</h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Question Type</span>
            <div className="relative">
              <select
                value={questionType}
                onChange={(e) => onChange({ questionType: e.target.value })}
                className="h-9 rounded-xl border border-gray-200 bg-gray-50/50 pl-3 pr-8 text-xs font-semibold text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 transition appearance-none cursor-pointer"
              >
                <option value="Multiple Choice (MCQ)">Multiple Choice (MCQ)</option>
                <option value="Short Answer">Short Answer</option>
                <option value="Long Answer">Long Answer</option>
                <option value="True / False">True / False</option>
              </select>
              <KeyboardArrowDownOutlinedIcon
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                sx={{ fontSize: 16 }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            Question Text <span className="text-red-500">*</span>
          </label>

          <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition">
            {/* Formatting Toolbar */}
            <div className="bg-gray-50/80 border-b border-gray-200 px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Bold"
                >
                  <FormatBoldOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Italic"
                >
                  <FormatItalicOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Underline"
                >
                  <FormatUnderlinedOutlinedIcon sx={{ fontSize: 18 }} />
                </button>

                <div className="h-4 w-[1px] bg-gray-300 mx-1" />

                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Bulleted List"
                >
                  <FormatListBulletedOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Numbered List"
                >
                  <FormatListNumberedOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Insert Link"
                >
                  <InsertLinkOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Undo"
                >
                  <UndoOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200/60 transition"
                  title="Redo"
                >
                  <RedoOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            {/* Textarea Field */}
            <textarea
              rows={3}
              value={question.question}
              onChange={(e) => onChange({ question: e.target.value })}
              placeholder="यहाँ एक प्रश्न लिखा जाएगा ?"
              className="w-full p-3.5 text-sm outline-none resize-none bg-white text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Options Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
              Options <span className="text-gray-400 font-normal">({options.length})</span>
            </h3>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400">Max options: 6</span>

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1 h-7 px-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition"
                >
                  <AddOutlinedIcon sx={{ fontSize: 15 }} />
                  Add Option
                </button>
              )}
            </div>
          </div>

          {/* Option Rows */}
          <div className="space-y-2.5">
            {options.map((option) => {
              const isCorrect = correctOption === option.id;

              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 border rounded-xl px-3 py-2 transition-all ${
                    isCorrect
                      ? "border-primary/40 bg-primary/[0.03] shadow-2xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {/* Custom Styled Radio Button */}
                  <button
                    type="button"
                    onClick={() => onChange({ correctOption: option.id })}
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isCorrect
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white hover:border-primary/50"
                    }`}
                    title="Mark as correct answer"
                  >
                    {isCorrect && <div className="h-2 w-2 rounded-full bg-white" />}
                  </button>

                  {/* Letter Badge */}
                  <span className="text-xs font-bold text-gray-700 w-4 shrink-0">
                    {option.label}
                  </span>

                  {/* Text Input Box */}
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${option.label}`}
                    className="flex-1 h-9 border border-gray-200 rounded-xl px-3 text-xs outline-none bg-gray-50/50 text-gray-900 focus:bg-white focus:border-primary transition"
                  />

                  {/* Red Delete Trash Icon */}
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0 transition"
                      title="Remove option"
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-400 italic">
            Select the correct answer for this question.
          </p>
        </div>

        {/* Question Parameters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Marks <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-2 h-9 bg-gray-50/50">
              <input
                type="number"
                min="1"
                value={marks}
                onChange={(e) => onChange({ marks: Number(e.target.value) || 1 })}
                className="w-full text-xs font-bold bg-transparent outline-none text-gray-900"
              />
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleMarksChange(1)}
                  className="text-gray-400 hover:text-gray-700 leading-none text-[10px]"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMarksChange(-1)}
                  className="text-gray-400 hover:text-gray-700 leading-none text-[10px]"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Negative Marks
            </label>
            <input
              type="number"
              min="0"
              value={negativeMarks}
              onChange={(e) => onChange({ negativeMarks: Number(e.target.value) || 0 })}
              className="w-full h-9 border border-gray-200 rounded-xl px-3 text-xs font-semibold bg-gray-50/50 outline-none text-gray-900 focus:bg-white focus:border-primary transition"
            />
          </div>
        </div>
      </div>

      {/* Bottom Question Navigation Buttons Bar */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevQuestion}
          disabled={questionIndex === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />
          Previous Question
        </button>

        <span className="text-xs font-semibold text-gray-500">
          Question {currentQNum} of {totalQuestionsCount}
        </span>

        <button
          type="button"
          onClick={onNextQuestion}
          disabled={questionIndex >= totalQuestionsCount - 1}
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next Question
          <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default QuestionForm;
