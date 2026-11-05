import React, { useState } from 'react'
import { UserCheck } from 'lucide-react'

export default function DailyManpowerChart({
  title = 'Daily Manpower',
  data = [
    { date: '01 May', actual: 45, present: 25, requirement: 70 },
    { date: '02 May', actual: 60, present: 35, requirement: 95 },
    { date: '03 May', actual: 32, present: 18, requirement: 50 },
    { date: '04 May', actual: 58, present: 40, requirement: 98 },
    { date: '05 May', actual: 48, present: 28, requirement: 76 },
    { date: '06 May', actual: 25, present: 15, requirement: 40 },
    { date: '07 May', actual: 62, present: 30, requirement: 92 },
    { date: '08 May', actual: 40, present: 22, requirement: 62 },
    { date: '09 May', actual: 55, present: 32, requirement: 87 },
    { date: '10 May', actual: 28, present: 20, requirement: 48 },
  ],
  height = 220,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const series = [
    { key: 'actual', label: 'Actual', color: '#38bdf8' },
    { key: 'present', label: 'Present', color: '#1d4ed8' },
    { key: 'requirement', label: 'Requirement', color: '#0b295c' },
  ]

  // Chart Dimensions with increased padding for readable labels
  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 32, right: 18, bottom: 36, left: 34 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  const maxY = 120
  const yTicks = [120, 100, 80, 60, 40, 20, 0]

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxY) * chartHeight
  }

  const getBarHeight = (val) => {
    return (val / maxY) * chartHeight
  }

  const groupWidth = chartWidth / data.length
  const barWidth = 9
  const barGap = 1.5

  // Safe horizontal positioning for tooltip
  const getTooltipX = (idx) => {
    const rawPct = ((padding.left + idx * groupWidth + groupWidth / 2) / svgWidth) * 100
    return Math.max(5, Math.min(95, rawPct))
  }

  const getTooltipTranslate = (idx) => {
    if (idx <= 1) return '0%'
    if (idx >= data.length - 2) return '-100%'
    return '-50%'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm relative">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0047AB] flex items-center justify-center shrink-0 border border-blue-100">
            <UserCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tracking operator requirement, present vs actual deployment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full select-none my-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-pointer"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Horizontal Grid lines and Y-axis tick labels */}
          {yTicks.map((tick) => {
            const y = getY(tick)
            return (
              <g key={`ytick-${tick}`}>
                {tick > 0 && (
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                )}
                <text
                  x={padding.left - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="600"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Base line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={svgWidth - padding.right}
            y2={padding.top + chartHeight}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Groups and Bars for 10 dates */}
          {data.map((item, groupIdx) => {
            const groupCenterX =
              padding.left + groupIdx * groupWidth + groupWidth / 2
            const totalBarsWidth =
              series.length * barWidth + (series.length - 1) * barGap
            const startX = groupCenterX - totalBarsWidth / 2
            const isHovered = hoveredIndex === groupIdx

            return (
              <g key={`group-${groupIdx}`}>
                {/* Subtle column highlight on hover */}
                {isHovered && (
                  <rect
                    x={padding.left + groupIdx * groupWidth + 1}
                    y={padding.top}
                    width={groupWidth - 2}
                    height={chartHeight}
                    fill="rgba(56, 189, 248, 0.08)"
                    rx="4"
                    className="pointer-events-none"
                  />
                )}

                {series.map((s, seriesIdx) => {
                  const val = item[s.key] || 0
                  const barX = startX + seriesIdx * (barWidth + barGap)
                  const bHeight = getBarHeight(val)
                  const barY = getY(val)

                  return (
                    <g key={`${s.key}-${groupIdx}`} className="pointer-events-none">
                      {/* Value label above bar - high contrast and readable */}
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 3.5}
                        textAnchor="middle"
                        fill={isHovered ? '#0f172a' : '#1e293b'}
                        fontSize="9"
                        fontWeight="700"
                      >
                        {val}
                      </text>

                      {/* Bar Rect with rounded top */}
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={Math.max(bHeight, 0)}
                        fill={s.color}
                        rx="1.5"
                        opacity={hoveredIndex === null || isHovered ? 1 : 0.82}
                        className="transition-opacity"
                      />
                    </g>
                  )
                })}

                {/* X Axis Date label - comfortable font size and bold emphasis */}
                <text
                  x={groupCenterX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill={isHovered ? '#0284c7' : '#475569'}
                  fontSize="10.5"
                  fontWeight={isHovered ? '800' : '600'}
                  className="pointer-events-none"
                >
                  {item.date}
                </text>
              </g>
            )
          })}

          {/* FULL COLUMN HOVER OVERLAYS - Guaranteed 100% pointer capture */}
          {data.map((item, groupIdx) => (
            <rect
              key={`hit-${groupIdx}`}
              x={padding.left + groupIdx * groupWidth}
              y={0}
              width={groupWidth}
              height={svgHeight}
              fill="#ffffff"
              fillOpacity="0"
              style={{ pointerEvents: 'all' }}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(groupIdx)}
              onMouseMove={() => setHoveredIndex(groupIdx)}
            />
          ))}
        </svg>

        {/* High-visibility Information Tooltip Card */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute pointer-events-none z-30 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-75"
            style={{
              left: `${getTooltipX(hoveredIndex)}%`,
              top: '8px',
              transform: `translateX(${getTooltipTranslate(hoveredIndex)})`,
              minWidth: '155px',
            }}
          >
            <div className="font-bold text-sky-300 border-b border-slate-700/80 pb-1.5 mb-1.5 flex items-center justify-between text-xs sm:text-sm">
              <span>{data[hoveredIndex].date}</span>
              <span className="text-[11px] text-slate-400 font-medium">Headcount</span>
            </div>
            {series.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between space-x-3 text-xs py-0.5"
              >
                <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.label}:</span>
                </span>
                <span className="font-bold text-white text-xs">
                  {data[hoveredIndex][s.key]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* X-Axis Categories Legend: Actual, Present, Requirement */}
      <div className="flex items-center justify-center space-x-6 pt-2.5 border-t border-slate-100/90">
        {series.map((s) => (
          <div
            key={s.key}
            className="flex items-center space-x-2 text-xs sm:text-[13px] text-slate-700 font-semibold"
          >
            <span
              className="w-3 h-3 rounded-full inline-block shrink-0 shadow-2xs"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
