// import { useState } from "react";
// import ntfLogo from "../../../assets/images/NTF_logo_black.png";

// const OperatorObservanceForm = () => {
//   const [formData, setFormData] = useState({
//     operatorCategory: "",
//     operatorName: "",
//     observerName: "",
//     processName: "",
//     trainerName: "",
//     joiningDate: "",
//     date: "",
//     judgement: "",
//     reEducation: "",
//     observations: {},
//   });

//   // =========================================================
//   // DAYS
//   // =========================================================

//   const days = [
//     "Day 1",
//     "Day 2",
//     "Day 3",
//     "Day 4",
//     "Day 5",
//     "Day 6",
//     "Day 7",
//   ];

//   // =========================================================
//   // CYCLES
//   // =========================================================

//   const cycles = [
//     1,
//     2,
//     3,
//     4,
//     5,
//     6,
//     7,
//     8,
//     9,
//     10,
//   ];

//   // =========================================================
//   // OBSERVATION POINTS
//   // =========================================================

//   const observationPoints = [
//     {
//       sno: 1,
//       description:
//         "Is process started after Job-set up approval?",
//       cycle: "1",
//       method: "Working procedure",
//     },

//     {
//       sno: 2,
//       description:
//         "Machine cleaning, filling start up check sheet and set the process parameter.",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 3,
//       description:
//         "Filling of hourly production report",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 4,
//       description:
//         "Working as per defined Work instruction of the individual process and impart trainings.",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 5,
//       description:
//         "Inspection as per WI / Check quality of Input material",
//       cycle: "8",
//       method: "",
//     },

//     {
//       sno: 6,
//       description:
//         "Part Handling labeling part storing to defined location for next process as per W.I",
//       cycle: "8",
//       method: "",
//     },

//     {
//       sno: 7,
//       description:
//         "Awareness (Purpose of work/Impact to the Customer)",
//       cycle: "1",
//       method: "CSR",
//     },

//     {
//       sno: 8,
//       description:
//         "Ensure training given to other operator.",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 9,
//       description:
//         "Follow the material storage as per WI",
//       cycle: "1",
//       method: "Safety & 5S",
//     },

//     {
//       sno: 10,
//       description:
//         "Use of PPEs as per PPE Matrix / Safety",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 11,
//       description:
//         "Discipline (ID card, Uniform, Shoes)",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 12,
//       description:
//         "Maintain 5S in his defined area.",
//       cycle: "1",
//       method: "",
//     },

//     {
//       sno: 13,
//       description:
//         "Defects 100% checking visually",
//       cycle: "8",
//       method: "Quality checks procedure",
//     },

//     {
//       sno: 14,
//       description:
//         "Packaging as per standard",
//       cycle: "8",
//       method: "",
//     },

//     {
//       sno: 15,
//       description:
//         "Qty. actual / plan",
//       cycle: "8",
//       method: "",
//     },

//     {
//       sno: 16,
//       description:
//         "Rej. Qty.",
//       cycle: "8",
//       method: "Check 1 Hr Production",
//     },

//     {
//       sno: 17,
//       description:
//         "Rej. %",
//       cycle: "",
//       method: "",
//     },

//     {
//       sno: 18,
//       description:
//         "Total time",
//       cycle: "",
//       method: "Check 10 part",
//     },

//     {
//       sno: 19,
//       description:
//         "Takt time",
//       cycle: "",
//       method: "",
//     },
//   ];

//   // =========================================================
//   // THEORETICAL QUESTIONS
//   // =========================================================

//   const theoreticalQuestions = [
//     "Is SOP available?",
//     "Do you understand SOP?",
//     "Are you adhering SOP?",
//     "Do you know operation cycle time?",
//     "Do you know the abnormal conditions",
//   ];

//   // =========================================================
//   // HANDLE INPUT
//   // =========================================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // =========================================================
//   // HANDLE OBSERVATION
//   // =========================================================

//   const handleObservationChange = (
//     day,
//     cycle,
//     row,
//     value
//   ) => {
//     const key = `${day}-${cycle}-${row}`;

//     setFormData((prev) => ({
//       ...prev,
//       observations: {
//         ...prev.observations,
//         [key]: value,
//       },
//     }));
//   };

//   // =========================================================
//   // SAVE
//   // =========================================================

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("Operator Observance Form:", formData);
//   };

//   return (
//     <div
//       className="min-h-screen w-full bg-white p-2"
//       style={{
//         fontFamily: "Arial, Helvetica, sans-serif",
//       }}
//     >
//       {/* ===================================================== */}
//       {/* PRINT BUTTON */}
//       {/* ===================================================== */}
//       <div className="mb-4 flex justify-end print:hidden">
//         <button
//           type="button"
//           onClick={() => window.print()}
//           className="rounded bg-[#6F4AE7] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#5A38D6]"
//         >
//           Print
//         </button>
//       </div>

//       {/* ===================================================== */}
//       {/* HORIZONTAL SCROLL */}
//       {/* ===================================================== */}

//       <div className="w-full overflow-x-auto">
//         <div className="min-w-[2850px] bg-white">

//           {/* ================================================= */}
//           {/* COMPLETE FORM */}
//           {/* ================================================= */}

//           <div className="border border-black">

//             {/* ================================================= */}
//             {/* TITLE */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed",
//               }}
//             >
//               <tbody>

//                 <tr className="h-[36px]">

//                   <td className="relative border border-black">

//                     <img
//                       src={ntfLogo}
//                       alt="NTF"
//                       className="absolute left-[5px] top-[3px] h-[27px] w-auto object-contain"
//                     />

//                     <div className="flex h-full items-center justify-center text-[16px] font-bold">
//                       10 Cycle Operator Observance Cum Evaluation Check Sheet for L4
//                     </div>

//                   </td>

//                 </tr>

//               </tbody>
//             </table>

//             {/* ================================================= */}
//             {/* TOP INFORMATION */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed",
//               }}
//             >

//               <colgroup>

//                 <col style={{ width: "230px" }} />

//                 <col style={{ width: "45px" }} />

//                 <col style={{ width: "205px" }} />

//                 <col style={{ width: "250px" }} />

//                 <col style={{ width: "145px" }} />

//                 <col style={{ width: "80px" }} />

//                 <col style={{ width: "55px" }} />

//                 <col style={{ width: "120px" }} />

//                 <col style={{ width: "120px" }} />

//               </colgroup>

//               <tbody>

//                 {/* ============================================= */}
//                 {/* OPERATOR CATEGORY */}
//                 {/* ============================================= */}

//                 <tr>

//                   <td
//                     rowSpan="4"
//                     className="border border-black p-0 align-top"
//                   >

//                     <div className="border-b border-black py-[4px] text-center text-[10px]">
//                       Operator Category&nbsp; (Pls tick √)
//                     </div>

//                     {/* NEW OPERATOR */}

//                     <label className="flex h-[23px] items-center border-b border-black text-[10px]">

//                       <span className="flex w-[45px] justify-center">

//                         <input
//                           type="checkbox"
//                           className="h-[19px] w-[27px] appearance-none border-2 border-black"
//                         />

//                       </span>

//                       <span>
//                         New Operator
//                       </span>

//                     </label>

//                     {/* REJOIN */}

//                     <label className="flex h-[23px] items-center border-b border-black text-[10px]">

//                       <span className="flex w-[45px] justify-center">

//                         <input
//                           type="checkbox"
//                           className="h-[19px] w-[27px] appearance-none border-2 border-black"
//                         />

//                       </span>

//                       <span>
//                         Rejoin After Some Time
//                       </span>

//                     </label>

//                     {/* TRANSFER */}

//                     <label className="flex h-[23px] items-center border-b border-black text-[10px]">

//                       <span className="flex w-[45px] justify-center">

//                         <input
//                           type="checkbox"
//                           className="h-[19px] w-[27px] appearance-none border-2 border-black"
//                         />

//                       </span>

//                       <span>
//                         Transfer from other station
//                       </span>

//                     </label>

//                     {/* EXISTING */}

//                     <label className="flex h-[23px] items-center text-[10px]">

//                       <span className="flex w-[45px] justify-center">

//                         <input
//                           type="checkbox"
//                           className="h-[19px] w-[27px] appearance-none border-2 border-black"
//                         />

//                       </span>

//                       <span>
//                         Existing Operator
//                       </span>

//                     </label>

//                   </td>

//                   {/* =========================================== */}
//                   {/* OPERATOR NAME */}
//                   {/* =========================================== */}

//                   <td
//                     colSpan="2"
//                     className="border border-black px-[5px] text-[10px]"
//                   >
//                     Name of Operator:
//                   </td>

//                   <td className="border border-black">

//                     <input
//                       type="text"
//                       name="operatorName"
//                       value={formData.operatorName}
//                       onChange={handleChange}
//                       className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
//                     />

//                   </td>

//                   {/* DATE OF JOINING */}

//                   <td className="border border-black px-[5px] text-[10px]">
//                     Date of Joining :
//                   </td>

//                   <td
//                     colSpan="2"
//                     className="border border-black"
//                   >

//                     <input
//                       type="text"
//                       name="joiningDate"
//                       value={formData.joiningDate}
//                       onChange={handleChange}
//                       className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
//                     />

//                   </td>

//                   {/* =========================================== */}
//                   {/* JUDGEMENT */}
//                   {/* =========================================== */}

//                   <td
//                     className="border border-black text-center text-[10px]"
//                   >

//                     <div className="border-b border-black py-[4px]">
//                       Judgement (Pls tick √)
//                     </div>

//                     <div className="flex h-[23px] items-center justify-center">
//                       OK
//                     </div>

//                   </td>

//                   <td className="border border-black text-center text-[10px]">
//                     OR
//                   </td>

//                   <td className="border border-black text-center text-[10px]">
//                     Not OK
//                   </td>

//                 </tr>

//                 {/* ============================================= */}
//                 {/* OBSERVER */}
//                 {/* ============================================= */}

//                 <tr>

//                   <td
//                     colSpan="2"
//                     className="border border-black px-[5px] text-[10px]"
//                   >
//                     Name of Observer:
//                   </td>

//                   <td className="border border-black">

//                     <input
//                       type="text"
//                       name="observerName"
//                       value={formData.observerName}
//                       onChange={handleChange}
//                       className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
//                     />

//                   </td>

//                   <td className="border border-black px-[5px] text-[10px]">
//                     Date of Joining :
//                   </td>

//                   <td
//                     colSpan="2"
//                     className="border border-black"
//                   />

//                   <td className="border border-black p-0">

//                     <div className="flex h-[23px] items-center justify-center">

//                       <input
//                         type="checkbox"
//                         className="h-[19px] w-[37px] appearance-none border-2 border-black"
//                       />

//                     </div>

//                   </td>

//                   <td className="border border-black text-center text-[10px]">
//                     OR
//                   </td>

//                   <td className="border border-black p-0">

//                     <div className="flex h-[23px] items-center justify-center">

//                       <input
//                         type="checkbox"
//                         className="h-[19px] w-[37px] appearance-none border-2 border-black"
//                       />

//                     </div>

//                   </td>

//                 </tr>

//                 {/* ============================================= */}
//                 {/* PROCESS */}
//                 {/* ============================================= */}

//                 <tr>

//                   <td
//                     colSpan="2"
//                     className="border border-black px-[5px] text-[10px]"
//                   >
//                     Process Name:
//                   </td>

//                   <td className="border border-black">

//                     <input
//                       type="text"
//                       name="processName"
//                       value={formData.processName}
//                       onChange={handleChange}
//                       className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
//                     />

//                   </td>

//                   <td className="border border-black px-[5px] text-[10px]">
//                     Date of Joining :
//                   </td>

//                   <td
//                     colSpan="2"
//                     className="border border-black"
//                   />

//                   <td className="border border-black text-center text-[9px]">
//                     Required
//                   </td>

//                   <td className="border border-black text-center text-[10px]">
//                     OR
//                   </td>

//                   <td className="border border-black text-center text-[9px]">
//                     Not Required
//                   </td>

//                 </tr>

//                 {/* ============================================= */}
//                 {/* TRAINER */}
//                 {/* ============================================= */}

//                 <tr>

//                   <td
//                     colSpan="2"
//                     className="border border-black px-[5px] text-[10px]"
//                   >
//                     Name of Trainer:
//                   </td>

//                   <td className="border border-black">

//                     <input
//                       type="text"
//                       name="trainerName"
//                       value={formData.trainerName}
//                       onChange={handleChange}
//                       className="h-full w-full bg-transparent px-1 text-[10px] outline-none"
//                     />

//                   </td>

//                   <td
//                     colSpan="2"
//                     className="border border-black px-[5px] text-[10px]"
//                   >
//                     Date:
//                   </td>

//                   <td className="border border-black" />

//                   <td className="border border-black" />

//                   <td className="border border-black" />

//                   <td className="border border-black" />

//                 </tr>

//               </tbody>

//             </table>

//             {/* ================================================= */}
//             {/* DAY 1 - DAY 7 HEADER */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed",
//               }}
//             >

//               <colgroup>

//                 <col style={{ width: "35px" }} />

//                 <col style={{ width: "420px" }} />

//                 <col style={{ width: "40px" }} />

//                 <col style={{ width: "75px" }} />

//                 {Array.from({
//                   length: 70,
//                 }).map((_, index) => (
//                   <col
//                     key={index}
//                     style={{
//                       width: "32px",
//                     }}
//                   />
//                 ))}

//               </colgroup>

//               <thead>

//                 {/* DAY ROW */}

//                 <tr className="h-[24px]">

//                   <th
//                     rowSpan="2"
//                     className="border border-black text-[8px]"
//                   >
//                     S.No
//                   </th>

//                   <th
//                     rowSpan="2"
//                     className="border border-black text-[8px]"
//                   >
//                     Description
//                   </th>

//                   <th
//                     rowSpan="2"
//                     className="border border-black text-[8px]"
//                   >
//                     Cycle
//                   </th>

//                   <th
//                     rowSpan="2"
//                     className="border border-black text-[8px]"
//                   >
//                     Method
//                   </th>

//                   {days.map((day) => (
//                     <th
//                       key={day}
//                       colSpan="10"
//                       className="border border-black text-[8px] font-normal"
//                     >
//                       {day} - Date-
//                     </th>
//                   ))}

//                 </tr>

//                 {/* CYCLE ROW */}

//                 <tr className="h-[18px]">

//                   {days.map((day) =>
//                     cycles.map((cycle) => (
//                       <th
//                         key={`${day}-${cycle}`}
//                         className="border border-black text-[7px] font-normal"
//                       >
//                         {cycle}
//                       </th>
//                     ))
//                   )}

//                 </tr>

//               </thead>

//               {/* ================================================= */}
//               {/* OBSERVATION ROWS */}
//               {/* ================================================= */}

//               <tbody>

//                 {observationPoints.map((item) => (
//                   <tr
//                     key={item.sno}
//                     className="h-[27px]"
//                   >

//                     <td className="border border-black text-center text-[8px]">
//                       {item.sno}
//                     </td>

//                     <td className="border border-black px-1 text-[8px] leading-[9px]">
//                       {item.description}
//                     </td>

//                     <td className="border border-black text-center text-[8px]">
//                       {item.cycle}
//                     </td>

//                     <td className="border border-black px-1 text-center text-[7px] leading-[8px]">
//                       {item.method}
//                     </td>

//                     {/* 70 OBSERVATION CELLS */}

//                     {days.map((day, dayIndex) =>
//                       cycles.map((cycle) => {

//                         const key =
//                           `${dayIndex + 1}-${cycle}-${item.sno}`;

//                         return (
//                           <td
//                             key={key}
//                             className="border border-black p-0 text-center"
//                           >

//                             <select
//                               value={
//                                 formData.observations[
//                                   key
//                                 ] || ""
//                               }
//                               onChange={(e) =>
//                                 handleObservationChange(
//                                   dayIndex + 1,
//                                   cycle,
//                                   item.sno,
//                                   e.target.value
//                                 )
//                               }
//                               className="h-[26px] w-full cursor-pointer appearance-none bg-transparent p-0 text-center text-[8px] outline-none"
//                             >

//                               <option value="">
//                                 {" "}
//                               </option>

//                               <option value="○">
//                                 ○
//                               </option>

//                               <option value="Δ">
//                                 Δ
//                               </option>

//                               <option value="X">
//                                 X
//                               </option>

//                             </select>

//                           </td>
//                         );
//                       })
//                     )}

//                   </tr>
//                 ))}

//               </tbody>

//             </table>

//             {/* ================================================= */}
//             {/* THEORETICAL QUESTIONS */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed",
//               }}
//             >

//               <colgroup>

//                 <col style={{ width: "125px" }} />

//                 <col style={{ width: "35px" }} />

//                 <col style={{ width: "250px" }} />

//                 <col style={{ width: "30px" }} />

//                 <col style={{ width: "30px" }} />

//                 <col style={{ width: "30px" }} />

//                 <col style={{ width: "150px" }} />

//                 <col style={{ width: "150px" }} />

//                 <col style={{ width: "70px" }} />

//                 <col style={{ width: "140px" }} />

//               </colgroup>

//               <tbody>

//                 {theoreticalQuestions.map(
//                   (question, index) => (
//                     <tr
//                       key={index}
//                       className="h-[24px]"
//                     >

//                       {/* THEORETICAL QUESTIONS */}

//                       {index === 0 && (
//                         <td
//                           rowSpan="5"
//                           className="border border-black text-center text-[10px]"
//                         >
//                           Theoretical
//                           <br />
//                           Questions
//                         </td>
//                       )}

//                       {/* QUESTION NUMBER */}

//                       <td className="border border-black text-center text-[9px]">
//                         Q{index + 1}
//                       </td>

//                       {/* QUESTION */}

//                       <td className="border border-black px-2 text-[9px]">
//                         {question}
//                       </td>

//                       {/* YES */}

//                       <td className="border border-black text-center text-[9px]">
//                         Y
//                       </td>

//                       {/* NO */}

//                       <td className="border border-black text-center text-[9px]">
//                         N
//                       </td>

//                       {/* NA */}

//                       <td className="border border-black text-center text-[9px]">
//                         NA
//                       </td>

//                       {/* SCORE */}

//                       {index === 0 && (
//                         <td
//                           rowSpan="5"
//                           className="border border-black p-0 text-center text-[9px]"
//                         >
//                           Score for theoretical
//                           <br />
//                           Exam %
//                         </td>
//                       )}

//                       {/* TOTAL MARKS */}

//                       {index === 0 && (
//                         <td
//                           rowSpan="5"
//                           className="border border-black p-0 text-[9px]"
//                         >

//                           <div className="border-b border-black px-2 py-2">
//                             Total Marks Obtained
//                             <span className="float-right">
//                               *
//                             </span>
//                           </div>

//                           <div className="px-2 py-2">
//                             Total Questions
//                           </div>

//                         </td>
//                       )}

//                       {/* 100 */}

//                       {index === 0 && (
//                         <td
//                           rowSpan="5"
//                           className="border border-black text-center text-[9px]"
//                         >
//                           100
//                         </td>
//                       )}

//                       {/* PASSING */}

//                       {index === 0 && (
//                         <td
//                           rowSpan="5"
//                           className="border border-black p-0 text-center text-[9px]"
//                         >

//                           <div className="border-b border-black py-2">
//                             Passing Criteria
//                           </div>

//                           <div className="py-2">
//                             Minimum 80%
//                           </div>

//                         </td>
//                       )}

//                     </tr>
//                   )
//                 )}

//               </tbody>

//             </table>

//             {/* ================================================= */}
//             {/* JUDGEMENT / ACTION TAKEN */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed",
//               }}
//             >

//               <colgroup>

//                 <col style={{ width: "45px" }} />

//                 <col style={{ width: "100px" }} />

//                 <col style={{ width: "420px" }} />

//                 <col />

//               </colgroup>

//               <thead>

//                 <tr>

//                   <th
//                     colSpan="4"
//                     className="border border-black px-1 py-1 text-left text-[9px] font-bold"
//                   >
//                     Judgement
//                   </th>

//                 </tr>

//                 <tr className="h-[20px]">

//                   <th className="border border-black text-[8px]">
//                     Sr.No
//                   </th>

//                   <th className="border border-black text-[8px]">
//                     Date
//                   </th>

//                   <th className="border border-black text-[8px]">
//                     Observation Point
//                   </th>

//                   <th className="border border-black text-[8px]">
//                     Action Taken
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {Array.from({
//                   length: 6,
//                 }).map((_, index) => (
//                   <tr
//                     key={index}
//                     className="h-[25px]"
//                   >

//                     <td className="border border-black text-center text-[8px]">
//                       {index + 1}
//                     </td>

//                     <td className="border border-black">

//                       <input
//                         type="text"
//                         className="h-full w-full bg-transparent px-1 text-[8px] outline-none"
//                       />

//                     </td>

//                     <td className="border border-black">

//                       <input
//                         type="text"
//                         className="h-full w-full bg-transparent px-1 text-[8px] outline-none"
//                       />

//                     </td>

//                     <td className="border border-black">

//                       <input
//                         type="text"
//                         className="h-full w-full bg-transparent px-1 text-[8px] outline-none"
//                       />

//                     </td>

//                   </tr>
//                 ))}

//               </tbody>

//             </table>

//             {/* ================================================= */}
//             {/* BOTTOM SECTION */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed",
//               }}
//             >

//               <colgroup>

//                 <col style={{ width: "400px" }} />

//                 <col style={{ width: "650px" }} />

//                 <col />

//               </colgroup>

//               <tbody>

//                 <tr>

//                   {/* =========================================== */}
//                   {/* REMARKS */}
//                   {/* =========================================== */}

//                   <td
//                     className="border border-black p-1 align-top"
//                   >

//                     <p className="m-0 text-[7px] leading-[9px]">
//                       <b>Remarks:</b> Mention details
//                       of WI adherence wherever any NG
//                       point is observed.
//                     </p>

//                     <p className="m-0 text-[7px] leading-[9px]">
//                       7 Days observation-For New Operator,
//                       Rejoin After Some Time & Transfer
//                       from other station.
//                     </p>

//                     <p className="m-0 text-[7px] leading-[9px]">
//                       1 Day observation-For Existing
//                       Operator
//                     </p>

//                   </td>

//                   {/* =========================================== */}
//                   {/* LEVEL */}
//                   {/* =========================================== */}

//                   <td className="border border-black">

//                     <div className="border-b border-black px-1 py-1 text-center text-[8px] font-bold">
//                       If Passed in theoretical and
//                       Practical test upgraded to Next Level
//                     </div>

//                     <div className="grid grid-cols-2">

//                       <div className="border-b border-r border-black p-1 text-[7px] leading-[8px]">
//                         4. Know the Process & can do
//                         the process & can teach others
//                         (if know, I can do, I can set,
//                         I can teach)
//                       </div>

//                       <div className="border-b border-black p-1 text-[7px] leading-[8px]">
//                         1. Know the process
//                         (if know)
//                       </div>

//                       <div className="border-r border-black p-1 text-[7px] leading-[8px]">
//                         3. Know the Process & can do
//                         the process
//                         (if know, I can do, I can set)
//                       </div>

//                       <div className="p-1 text-[7px] leading-[8px]">
//                         2. Know the Process & can do
//                         the process
//                         (if know, I can do)
//                       </div>

//                     </div>

//                   </td>

//                   {/* =========================================== */}
//                   {/* JUDGEMENT LEGEND */}
//                   {/* =========================================== */}

//                   <td className="border border-black p-0">

//                     <table className="w-full border-collapse">

//                       <thead>

//                         <tr>

//                           <th className="border border-black p-1 text-[7px]">
//                             Judgement
//                           </th>

//                           <th className="border border-black p-1 text-[7px]">
//                             Sym.
//                           </th>

//                           <th className="border border-black p-1 text-[7px]">
//                             Min Req. for 1 day
//                             observation
//                           </th>

//                           <th className="border border-black p-1 text-[7px]">
//                             Min Req. for 7 days
//                             observation
//                           </th>

//                         </tr>

//                       </thead>

//                       <tbody>

//                         <tr>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             Ok condition
//                           </td>

//                           <td className="border border-black p-1 text-center text-[8px]">
//                             ○
//                           </td>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             AR = all 0
//                           </td>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             AR = all 0
//                           </td>

//                         </tr>

//                         <tr>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             Needs improvement
//                           </td>

//                           <td className="border border-black p-1 text-center text-[8px]">
//                             Δ
//                           </td>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             &lt; AR = 0
//                           </td>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             &lt; AR = 4
//                           </td>

//                         </tr>

//                         <tr>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             Not ok
//                           </td>

//                           <td className="border border-black p-1 text-center text-[8px]">
//                             X
//                           </td>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             0
//                           </td>

//                           <td className="border border-black p-1 text-center text-[7px]">
//                             0
//                           </td>

//                         </tr>

//                       </tbody>

//                     </table>

//                   </td>

//                 </tr>

//               </tbody>

//             </table>

//             {/* ================================================= */}
//             {/* SIGNATURE SECTION */}
//             {/* ================================================= */}

//             <table
//               className="w-full border-collapse"
//               style={{
//                 tableLayout: "fixed"
//                 ,
//               }}
//             >

//               <tbody>

//                 <tr className="h-[55px]">

//                   <td className="w-1/3 border border-black align-bottom px-2 pb-1 text-[8px]">
//                     Prepared by:
//                   </td>

//                   <td className="w-1/3 border border-black align-bottom px-2 pb-1 text-[8px]">
//                     Checked by:
//                   </td>

//                   <td className="w-1/3 border border-black align-bottom px-2 pb-1 text-[8px]">
//                     Approved by:
//                   </td>

//                 </tr>

//               </tbody>

//             </table>

//             {/* ================================================= */}
//             {/* FOOTER */}
//             {/* ================================================= */}

//             <div className="flex h-[22px] items-center justify-between border-t border-black px-2 text-[7px]">

//               <span>
//                 FORMAT: F11(AMD-02)
//               </span>

//               <span>
//                 Rev.02
//               </span>

//             </div>

//           </div>

//           {/* ================================================= */}
//           {/* SAVE BUTTON */}
//           {/* ================================================= */}

//           <div className="mt-4 flex justify-end print:hidden">

//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="rounded bg-[#6F4AE7] px-5 py-2 text-sm font-medium text-white"
//             >
//               Save Form
//             </button>

//           </div>

//         </div>
//       </div>

//       {/* ===================================================== */}
//       {/* PRINT CSS */}
//       {/* ===================================================== */}
//       <style>
//         {`
//           @media print {
//             html,
//             body {
//               margin: 0;
//               padding: 0;
//               background: white !important;
//             }

//             @page {
//               size: A4 landscape;
//               margin: 0;
//             }

//             input,
//             select {
//               color: black !important;
//               background: transparent !important;
//             }

//             .print\\:hidden {
//               display: none !important;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default OperatorObservanceForm;



import  { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "../../../OperatorCheckSheet.css";
const OCS_DAYS = 7;
const OCS_CYCLES = 10;
const OCS_OBS_COLS = OCS_DAYS * OCS_CYCLES;

const OCS_COLUMNS = {
  sno: 61,
  description: 392,
  cycle: 52,
  method: 60,
};

const OCS_LEFT_WIDTH =
  OCS_COLUMNS.sno +
  OCS_COLUMNS.description +
  OCS_COLUMNS.cycle +
  OCS_COLUMNS.method;

const OCS_SHEET_WIDTH = 1866;
const OCS_OBS_WIDTH = OCS_SHEET_WIDTH - OCS_LEFT_WIDTH;
const OCS_CELL_WIDTH = OCS_OBS_WIDTH / OCS_OBS_COLS;

const OCS_ROW_HEIGHTS = [
  28, 25, 25, 25, 25,
  25, 25, 28, 28, 28,
  28, 28, 28, 28, 28,
];

const OCS_SHEETS = ["L-4", "L-3", "L-2"];

const OCS_DEFAULT_ROWS = [
  {
    sno: "1",
    description: "Machine cleaning",
    cycle: "",
    method: "Working procedure",
  },
  {
    sno: "2",
    description:
      "Working as per defined Work instruction of the individual process",
    cycle: "",
    method: "",
  },
  {
    sno: "3",
    description: "Part handling process as per WI",
    cycle: "→ 10",
    method: "",
  },
  {
    sno: "4",
    description:
      "Part labeling part storing to define location for next process.",
    cycle: "→ 10",
    method: "",
  },
  {
    sno: "5",
    description:
      "Everything should be available at defined place.",
    cycle: "",
    method: "Safety & 5S rule",
  },
  {
    sno: "6",
    description: "Use of PPEs as per PPE Matrix.",
    cycle: "",
    method: "",
  },
  {
    sno: "7",
    description: "Maintain 5S in his defined area.",
    cycle: "",
    method: "",
  },
  {
    sno: "8",
    description:
      "Defects 100% checking visually as per W.I.",
    cycle: "10",
    method: "Quality checks procedure",
  },
  {
    sno: "9",
    description: "Packaging as per standard",
    cycle: "10",
    method: "",
  },
  {
    sno: "10",
    description: "Qty. actual/plan",
    cycle: "10",
    method: "Check 1 Hr Production",
  },
  {
    sno: "11",
    description: "Rej. Qty.",
    cycle: "",
    method: "Check 1 Hr Production",
  },
  {
    sno: "12",
    description: "Rej. %",
    cycle: "",
    method: "",
  },
  {
    sno: "13",
    description: "Total time",
    cycle: "",
    method: "Check 10 part",
  },
  {
    sno: "14",
    description: "Takt time",
    cycle: "",
    method: "Check 10 part",
  },
  {
    sno: "15",
    description: "Judgement",
    cycle: "",
    method: "",
  },
];

function ocsCell(ws, row, col) {
  if (!ws) return null;

  const address = XLSX.utils.encode_cell({
    r: row - 1,
    c: col - 1,
  });

  return ws[address] || null;
}

function ocsText(ws, row, col) {
  const value = ocsCell(ws, row, col)?.v;

  return value == null ? "" : String(value);
}

function ocsGetRows(ws) {
  return OCS_DEFAULT_ROWS.map((item, index) => {
    const excelRow = index + 9;

    return {
      excelRow,
      sno: ocsText(ws, excelRow, 1) || item.sno,
      description:
        ocsText(ws, excelRow, 2) || item.description,
      cycle:
        ocsText(ws, excelRow, 6) || item.cycle,
      method:
        ocsText(ws, excelRow, 7) || item.method,
    };
  });
}

function OCSHeader({ ws }) {
  const title =
    ocsText(ws, 1, 1) ||
    "10 Cycle Operator Observance Cum Evaluation Check Sheet for L4";

  const questions = [
    "Is SOP available?",
    "Do you understand SOP?",
    "Are you adhering SOP?",
    "Do you know operation cycle time?",
    "Do you know the abnormal conditions",
  ];

  return (
    <section className="operator-checksheet-top">

      <div className="operator-checksheet-logo">
        NTF
      </div>

      <div className="operator-checksheet-title">
        {title}
      </div>

      <div className="operator-checksheet-category">

        <div className="operator-checksheet-category-title">
          Operator Category&nbsp; (Pls tick √)
        </div>

        {[
          "New Operator",
          "Rejoin After Some Time",
          "Transfer from other station",
          "Existing Operator",
        ].map((item) => (
          <div
            className="operator-checksheet-category-row"
            key={item}
          >
            <span className="operator-checksheet-checkbox" />
            <span>{item}</span>
          </div>
        ))}

      </div>

      <div className="operator-checksheet-details">

        {[
          "Name of Operator:",
          "Name of Observer:",
          "Process Name:",
          "Name of Trainer:",
          "Date:",
        ].map((item) => (
          <div
            className="operator-checksheet-detail-row"
            key={item}
          >
            <span>{item}</span>
            <span className="operator-checksheet-detail-line" />
          </div>
        ))}

      </div>

      <div className="operator-checksheet-judgement">

        <div className="operator-checksheet-judgement-title">
          Judgement (Pls tick√)
        </div>

        <div className="operator-checksheet-judgement-row">
          <span>OK</span>
          <span className="operator-checksheet-small-box" />
          <span>OR</span>
          <span>Not OK</span>
          <span className="operator-checksheet-small-box" />
        </div>

        <div className="operator-checksheet-judgement-row">
          <span>Re-education (Pls tick√)</span>
          <span className="operator-checksheet-small-box" />
          <span>OR</span>
          <span>Not Required</span>
          <span className="operator-checksheet-small-box" />
        </div>

      </div>

      <div className="operator-checksheet-theory-label">
        Theoretical
        <br />
        Questions
      </div>

      <div className="operator-checksheet-questions">

        {questions.map((question, index) => (
          <div
            className="operator-checksheet-question"
            key={question}
          >

            <div className="operator-checksheet-qno">
              Q{index + 1}
            </div>

            <div className="operator-checksheet-qtext">
              {question}
            </div>

            <div className="operator-checksheet-qoptions">
              Y&nbsp;&nbsp; N&nbsp;&nbsp; NA
            </div>

          </div>
        ))}

      </div>

      <div className="operator-checksheet-score">

        <div className="operator-checksheet-score-field">
          <span>Total Marks Obtained</span>
          <span>*&nbsp;&nbsp;100</span>
        </div>

        <div className="operator-checksheet-score-field">
          Total Questions
        </div>

        <div className="operator-checksheet-score-label">
          Score for theoretical
          <br />
          Exam %
        </div>

        <div className="operator-checksheet-passing">
          <span>Passing Criteria</span>
          <span>Minimum 80%</span>
        </div>

      </div>

    </section>
  );
}

function OCSTableHeader() {
  return (
    <div className="operator-checksheet-grid-header">

      <div className="operator-checksheet-left-header">

        <div className="operator-checksheet-header-sno">
          S.No
        </div>

        <div className="operator-checksheet-header-description">
          Description
        </div>

        <div className="operator-checksheet-header-cycle">
          Cycle
        </div>

        <div className="operator-checksheet-header-method">
          Method
        </div>

      </div>

      <div className="operator-checksheet-day-header">

        {Array.from({
          length: OCS_DAYS,
        }).map((_, dayIndex) => (

          <div
            className="operator-checksheet-day"
            key={dayIndex}
          >

            <div className="operator-checksheet-day-title">
              Day {dayIndex + 1}- Date-
            </div>

            <div className="operator-checksheet-cycle-header">

              {Array.from({
                length: OCS_CYCLES,
              }).map((_, cycleIndex) => (

                <div
                  className="operator-checksheet-cycle-number"
                  key={cycleIndex}
                >
                  {cycleIndex + 1}
                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

function OCSTableBody({ ws }) {
  const rows = useMemo(
    () => ocsGetRows(ws),
    [ws]
  );

  const [marks, setMarks] = useState({});

  function toggleMark(row, column) {
    const key = `${row}:${column}`;

    setMarks((previous) => ({
      ...previous,
      [key]:
        previous[key] === "✓"
          ? ""
          : "✓",
    }));
  }

  return (
    <div className="operator-checksheet-body">

      <div className="operator-checksheet-left-body">

        {rows.map((row, index) => (

          <div
            className="operator-checksheet-left-row"
            style={{
              height: OCS_ROW_HEIGHTS[index],
            }}
            key={row.excelRow}
          >

            <div className="operator-checksheet-sno-cell">
              {row.sno}
            </div>

            <div className="operator-checksheet-description-cell">
              {row.description}
            </div>

            <div className="operator-checksheet-cycle-cell">
              {row.cycle}
            </div>

            <div className="operator-checksheet-method-cell">
              {row.method && (
                <span>{row.method}</span>
              )}
            </div>

          </div>

        ))}

      </div>

      <div className="operator-checksheet-observation">

        {rows.map((row, rowIndex) => (

          <div
            className="operator-checksheet-observation-row"
            style={{
              height: OCS_ROW_HEIGHTS[rowIndex],
            }}
            key={row.excelRow}
          >

            {Array.from({
              length: OCS_OBS_COLS,
            }).map((_, columnIndex) => {

              const key =
                `${row.excelRow}:${columnIndex}`;

              const isDayEnd =
                (columnIndex + 1) % OCS_CYCLES === 0;

              return (
                <button
                  type="button"
                  key={columnIndex}
                  className={
                    isDayEnd
                      ? "operator-checksheet-observation-cell operator-checksheet-day-end"
                      : "operator-checksheet-observation-cell"
                  }
                  onClick={() =>
                    toggleMark(
                      row.excelRow,
                      columnIndex
                    )
                  }
                  aria-label={`Day ${
                    Math.floor(
                      columnIndex / OCS_CYCLES
                    ) + 1
                  }, Cycle ${
                    (columnIndex %
                      OCS_CYCLES) + 1
                  }`}
                >
                  {marks[key] || ""}
                </button>
              );
            })}

          </div>

        ))}

      </div>

    </div>
  );
}

function OCSBottomTable() {
  return (
    <div className="operator-checksheet-bottom">

      <div className="operator-checksheet-bottom-head">
        <div>Sr.no.</div>
        <div>Date</div>
        <div>Observation Point</div>
        <div>Action Taken</div>
      </div>

      {Array.from({
        length: 5,
      }).map((_, index) => (

        <div
          className="operator-checksheet-bottom-row"
          key={index}
        >
          <div>{index + 1}</div>
          <div />
          <div />
          <div />
        </div>

      ))}

    </div>
  );
}

export default function OperatorObservanceForm() {
  const [workbook, setWorkbook] =
    useState(null);

  const [activeSheet, setActiveSheet] =
    useState("L-4");

  useEffect(() => {

    fetch("/checksheet.xlsx")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Unable to load checksheet.xlsx"
          );
        }

        return response.arrayBuffer();
      })
      .then((buffer) => {
        const loadedWorkbook = XLSX.read(
          buffer,
          {
            type: "array",
          }
        );

        setWorkbook(loadedWorkbook);
      })
      .catch((error) => {
        console.error(error);
      });

  }, []);

  if (!workbook) {
    return (
      <div className="operator-checksheet-loading">
        Loading...
      </div>
    );
  }

  const currentSheet =
    workbook.Sheets[activeSheet];

  return (
    <div className="operator-checksheet-page">

      <div className="operator-checksheet-tabs">

        {OCS_SHEETS.map((sheet) => (

          <button
            type="button"
            key={sheet}
            className={
              activeSheet === sheet
                ? "operator-checksheet-tab operator-checksheet-tab-active"
                : "operator-checksheet-tab"
            }
            onClick={() =>
              setActiveSheet(sheet)
            }
          >
            {sheet}
          </button>

        ))}

      </div>

      <div className="operator-checksheet-scroll">

        <div
          className="operator-checksheet-sheet"
          style={{
            width: OCS_SHEET_WIDTH,
          }}
        >

          <OCSHeader ws={currentSheet} />

          <OCSTableHeader />

          <OCSTableBody ws={currentSheet} />

          <OCSBottomTable />

        </div>

      </div>

    </div>
  );
}