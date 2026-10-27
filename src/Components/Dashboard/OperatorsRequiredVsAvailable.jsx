import React from 'react'
import { Filter, Maximize2, MoreHorizontal } from 'lucide-react'

export default function OperatorsRequiredVsAvailable() {
  const levels = [
    { level: 'L1', required: 8, available: 8 },
    { level: 'L2', required: 25, available: 24 },
    { level: 'L3', required: 25, available: 25 },
    { level: 'L4', required: 25, available: 25 },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm select-none">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <h2 className="text-xs sm:text-sm font-bold text-[#0b295c] tracking-tight">
          Operators Required Vs Available
        </h2>
        <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
      </div>

      {/* 2-Column Grid for Required vs Available */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Left Column: Required (L1 to L4) */}
        <div className="flex flex-col space-y-2.5">
          {levels.map((item) => (
            <div
              key={`${item.level}-req`}
              className="bg-[#f1f5f9] border border-slate-200/80 rounded-md py-2.5 px-2 text-center shadow-2xs transition-transform hover:-translate-y-0.5"
            >
              <div className="text-2xl font-bold text-slate-800 leading-tight">
                {item.required}
              </div>
              <div className="text-[11px] font-bold text-slate-600 tracking-tight mt-0.5">
                {item.level} Required
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Available (L1 to L4) */}
        <div className="flex flex-col space-y-2.5">
          {levels.map((item) => (
            <div
              key={`${item.level}-avail`}
              className="bg-[#faf1e8] border border-[#f3d9c4] rounded-md py-2.5 px-2 text-center shadow-2xs transition-transform hover:-translate-y-0.5"
            >
              <div className="text-2xl font-bold text-slate-800 leading-tight">
                {item.available}
              </div>
              <div className="text-[11px] font-bold text-slate-600 tracking-tight mt-0.5">
                {item.level} Available
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom utility icons matching screenshot */}
      <div className="flex items-center justify-end space-x-2 pt-3 mt-1 border-t border-slate-100 text-slate-400">
        <button
          type="button"
          title="Filter"
          className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Expand"
          className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Options"
          className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
