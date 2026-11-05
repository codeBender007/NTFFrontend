import React from 'react'

export default function StatCard({ value, label, bgColor }) {
  return (
    <div
      className={`${bgColor} text-white rounded-lg p-3 sm:p-4 text-center shadow-xs flex flex-col items-center justify-center min-h-[92px] transition-transform hover:-translate-y-0.5 select-none`}
    >
      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
        {value}
      </span>
      <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-1.5 opacity-95">
        {label}
      </span>
    </div>
  )
}
