import React from 'react'

const colorStyles = {
  blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  orange: 'bg-amber-50 text-amber-700 border-amber-200/80',
  red: 'bg-rose-50 text-rose-700 border-rose-200/80',
  purple: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  teal: 'bg-teal-50 text-teal-700 border-teal-200/80',
}

export default function KPICards({ data = [], gridClass }) {
  return (
    <div
      className={`mb-6 grid gap-4 select-none ${
        gridClass || 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
      }`}
    >
      {data.map((item, index) => {
        const iconStyle = colorStyles[item.color] || colorStyles.blue

        return (
          <div
            key={item.title || index}
            className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
          >
            {/* Main Content */}
            <div className="relative z-10 flex items-center">
              {/* Icon */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105 shadow-xs ${iconStyle}`}
              >
                {item.icon}
              </div>

              {/* Text Content */}
              <div className="ml-4 flex min-w-0 flex-col justify-center">
                {/* Title */}
                <p className="truncate text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.title}
                </p>

                {/* Value */}
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                  {item.value}
                </h2>

                {/* Trend (optional) */}
                {item.trend && (
                  <div className="mt-2 flex items-center whitespace-nowrap text-xs font-semibold text-emerald-600">
                    <span className="mr-1">↑</span>
                    <span>{item.trend}</span>
                    <span className="ml-1 font-normal text-slate-400">
                      vs last 7 days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

