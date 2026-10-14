import { useState } from "react";

const defaultTabs = [
  "Test Papers",
  "Day 1",
  "Day 2",
  "Training Schedule",
  "Practice Evaluation Sheet",
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
    <div className="w-full overflow-x-auto border-b border-[#e2edf2] bg-white/85 backdrop-blur-md">
      <div className="flex min-w-max items-center gap-0 px-5">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`
                relative flex h-12 items-center px-5
                text-[12px] font-medium
                transition-colors duration-200
                ${isActive
                  ? "font-semibold text-[#0d9488]"
                  : "text-[#64748b] hover:text-[#0d9488]"
                }
              `}
            >
              {tab}

              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-[2.5px] w-[72px] -translate-x-1/2 rounded-t-full bg-[#0d9488]" />
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
};

export default LMSTabs;