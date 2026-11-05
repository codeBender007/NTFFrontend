import React, { useState } from "react";

const defaultTabs = [
  "Test Papers",
  "Day 1",
  "Day 2",
  "Training Schedule",
  "Practical Evaluation Sheet",
  "Training Feedback",
];

const LMSTabs = ({ tabs = defaultTabs, activeTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    tabs[0] || defaultTabs[0]
  );

  const selectedTab = activeTab ?? internalActiveTab;

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  return (
    <div className="w-full overflow-x-auto border-b border-slate-200/90 bg-white select-none">
      <div className="flex min-w-max items-center gap-1 px-3 sm:px-4">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`
                relative flex h-11 items-center px-4 text-xs font-medium transition-colors duration-150
                ${
                  isActive
                    ? "font-bold text-[#0284c7]"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              {tab}

              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-t-full bg-[#0284c7]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LMSTabs;
