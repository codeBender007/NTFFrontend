import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

const DATA = {
  name: "",
  qualification: "",
  unitName: "",
  totalMarks: 25,
  passPercentage: 80,
  time: 60,
};

const QuestionInstructions = ({
  instructions = DATA,
  meta = {},
  totalQuestionsCount = 0,
}) => {
  const testTitle = meta.testTitle || "SKILL EVALUATION TEST PAPER";
  const department = meta.departments || "Production";
  const totalMarks = instructions.totalMarks || 25;
  const duration = instructions.time || meta.duration || 60;

  return (
    <div className="space-y-5">
      {/* 2-Column Metadata Underline Box */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 text-xs text-gray-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-24 font-bold text-gray-700 shrink-0">Test Title</span>
              <span className="font-semibold text-gray-500 mr-1">:</span>
              <div className="flex-1 border-b border-gray-300 font-medium pb-0.5 text-gray-900 truncate">
                {testTitle}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 font-bold text-gray-700 shrink-0">Department</span>
              <span className="font-semibold text-gray-500 mr-1">:</span>
              <div className="flex-1 border-b border-gray-300 font-medium pb-0.5 text-gray-900 truncate">
                {department}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 font-bold text-gray-700 shrink-0">Total Marks</span>
              <span className="font-semibold text-gray-500 mr-1">:</span>
              <div className="flex-1 border-b border-gray-300 font-medium pb-0.5 text-gray-900 truncate">
                {totalMarks} Marks
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-24 font-bold text-gray-700 shrink-0">Duration</span>
              <span className="font-semibold text-gray-500 mr-1">:</span>
              <div className="flex-1 border-b border-gray-300 font-medium pb-0.5 text-gray-900 truncate">
                {duration} Minutes
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 font-bold text-gray-700 shrink-0">Date</span>
              <span className="font-semibold text-gray-500 mr-1">:</span>
              <div className="flex-1 border-b border-gray-300 font-medium pb-0.5 text-gray-900 truncate">
                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 font-bold text-gray-700 shrink-0">Instructions</span>
              <span className="font-semibold text-gray-500 mr-1">:</span>
              <div className="flex-1 border-b border-gray-300 font-medium pb-0.5 text-gray-900 truncate">
                As mentioned below
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Box */}
      <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-5 text-xs text-gray-800 space-y-2.5 print:bg-white print:border-gray-300">
        <div className="font-bold text-[#0f172a] flex items-center gap-2 uppercase tracking-wide print:text-gray-900">
          <div className="h-6 w-6 rounded-lg bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] flex items-center justify-center shrink-0 print:hidden">
            <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
          <span>INSTRUCTIONS</span>
        </div>

        <ul className="list-disc list-inside space-y-1.5 text-gray-700 leading-relaxed font-normal pl-1 print:text-black">
          <li>Read all the questions carefully before answering.</li>
          <li>Choose the correct / most appropriate option.</li>
          <li>Each question carries equal marks unless mentioned.</li>
          <li>There is no negative marking.</li>
          <li>Use of calculator or mobile phones is not allowed.</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionInstructions;
export { DATA };
