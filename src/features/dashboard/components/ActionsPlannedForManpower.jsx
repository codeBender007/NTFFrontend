import React from 'react'
import { ChevronUp } from 'lucide-react'

export default function ActionsPlannedForManpower() {
  const actions = [
    { id: 1, text: 'Buffer manpower planning', bg: 'bg-[#93c5fd] hover:bg-[#7dd3fc]' },
    { id: 2, text: 'Salary revision', bg: 'bg-[#60a5fa] hover:bg-[#38bdf8]' },
    { id: 3, text: 'Special perks', bg: 'bg-[#38bdf8] hover:bg-[#0ea5e9]' },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col transition-all hover:shadow-sm select-none">
      {/* Dark Header bar */}
      <div className="bg-[#0f172a] text-white px-4 py-2.5 flex items-center space-x-2">
        <ChevronUp className="w-4 h-4 text-white stroke-[2.5]" />
        <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white">
          Actions Planned for Manpower Shortage
        </h3>
      </div>

      {/* Action Banner Items */}
      <div className="p-3 space-y-2">
        {actions.map((act) => (
          <div
            key={act.id}
            className={`${act.bg} text-slate-900 font-bold text-xs sm:text-sm px-4 py-3 rounded-lg shadow-2xs transition-all cursor-pointer`}
          >
            {act.text}
          </div>
        ))}
      </div>
    </div>
  )
}
