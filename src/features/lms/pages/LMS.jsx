import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionPaperTable from "../components/QuestionPaperTable";
import TrainingSchedule from "../components/TrainingSchedule";
import Day1QuestionPaper from "../components/Day1QuestionPaper";
import Day2QuestionPaper from "../components/Day2QuestionPaper";
import PracticeEvaluationSheet from "../components/PracticeEvaluationSheet";
import TrainingFeedback from "../components/TrainingFeedback";
import LMSTabs from "../components/LMSTabs";

export default function LMS() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Test Papers");

  const handleCreatePaper = () => {
    navigate("/lms/l0/editor");
  };

  const handleViewPaper = (paper) => {
    console.log("View paper:", paper);
  };

  const handleRefresh = () => {
    console.log("Refresh");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      {/* DOJO Hiring Banner - Exact pattern from main Dashboard */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            DOJO Hiring
          </h2>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <LMSTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "Test Papers" && (
          <QuestionPaperTable
            onCreate={handleCreatePaper}
            onView={handleViewPaper}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === "Training Schedule" && <TrainingSchedule />}
        {activeTab === "Day 1" && <Day1QuestionPaper />}
        {activeTab === "Day 2" && <Day2QuestionPaper />}
        {activeTab === "Practical Evaluation Sheet" && (
          <PracticeEvaluationSheet />
        )}
        {activeTab === "Training Feedback" && <TrainingFeedback />}
      </div>
    </div>
  );
}
