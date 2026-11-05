// import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
// import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
// import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
// import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
// import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

// const QuestionFooterStats = ({
//   totalSections = 3,
//   totalQuestions = 18,
//   totalMarks = 25,
//   duration = "60 min",
//   lastUpdated = "2 mins ago",
// }) => {
//   const stats = [
//     {
//       id: 1,
//       label: "Total Sections",
//       value: totalSections,
//       icon: <ViewListOutlinedIcon sx={{ fontSize: 20, color: "#6F4AE7" }} />,
//       bg: "bg-primary/10",
//     },
//     {
//       id: 2,
//       label: "Total Questions",
//       value: totalQuestions,
//       icon: <QuizOutlinedIcon sx={{ fontSize: 20, color: "#6F4AE7" }} />,
//       bg: "bg-primary/10",
//     },
//     {
//       id: 3,
//       label: "Total Marks",
//       value: totalMarks,
//       icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 20, color: "#F59E0B" }} />,
//       bg: "bg-amber-100/70",
//     },
//     {
//       id: 4,
//       label: "Total Duration",
//       value: duration,
//       icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: "#06B6D4" }} />,
//       bg: "bg-cyan-100/70",
//     },
//     {
//       id: 5,
//       label: "Last Updated",
//       value: lastUpdated,
//       icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 20, color: "#8B5CF6" }} />,
//       bg: "bg-purple-100/70",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-5">
//       {stats.map((item) => (
//         <div
//           key={item.id}
//           className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all"
//         >
//           <div
//             className={`h-11 w-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
//           >
//             {item.icon}
//           </div>

//           <div className="min-w-0">
//             <span className="block text-[11px] font-medium text-gray-500 truncate">
//               {item.label}
//             </span>
//             <span className="text-base sm:text-lg font-bold text-gray-900 leading-tight block truncate">
//               {item.value}
//             </span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default QuestionFooterStats;
