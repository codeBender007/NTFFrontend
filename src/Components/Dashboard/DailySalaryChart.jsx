import React, { useState } from 'react'
import { Banknote } from 'lucide-react'

export default function DailySalaryChart({ height = 200 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Data matching the screenshot metrics
  const data = [
    { date: '01 May', value: 121.5, label: '₹121.5k' },
    { date: '02 May', value: 134.2, label: '₹134.2k' },
    { date: '03 May', value: 118.6, label: '₹118.6k' },
    { date: '04 May', value: 142.8, label: '₹142.8k' },
    { date: '05 May', value: 129.4, label: '₹129.4k' },
    { date: '06 May', value: 96.3, label: '₹96.3k' },
    { date: '07 May', value: 155.1, label: '₹155.1k' },
    { date: '08 May', value: 127.7, label: '₹127.7k' },
    { date: '09 May', value: 138.5, label: '₹138.5k' },
    { date: '10 May', value: 122.9, label: '₹122.9k' },
  ]

  // Chart dimensions & scaling
  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 28, right: 18, bottom: 32, left: 38 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  const maxY = 200 // ₹200k max
  const yTicks = [
    { val: 200, label: '₹200k' },
    { val: 150, label: '₹150k' },
    { val: 100, label: '₹100k' },
    { val: 50, label: '₹50k' },
    { val: 0, label: '₹0k' },
  ]

  const getX = (idx) => {
    return padding.left + (idx / (data.length - 1)) * chartWidth
  }

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxY) * chartHeight
  }

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    val: d.label,
    date: d.date,
    amount: d.value,
  }))

  const linePath = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  )

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    padding.top + chartHeight
  } L ${points[0].x} ${padding.top + chartHeight} Z`

  // Exact color theme from "Defects Trend - MSIL" (#38bdf8)
  const lineColor = '#38bdf8'

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Header matching screenshot content */}
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-tight">
              Daily Salary Distribution
            </h2>
            <p className="text-[11px] text-slate-500 font-normal">
              Daily wage expenses and overtime payout tracking
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
            <defs>
              <linearGradient id="salaryLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines and Y-axis tick labels */}
            {yTicks.map((tick) => {
              const y = getY(tick.val)
              return (
                <g key={`ytick-${tick.val}`}>
                  {tick.val > 0 && (
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
                    y={y + 3}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontWeight="500"
                  >
                    {tick.label}
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
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {/* Soft area gradient under line */}
            <path d={areaPath} fill="url(#salaryLineGrad)" />

            {/* Line Graph Path */}
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points & Numbers above nodes */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i
              return (
                <g key={`salary-pt-${i}`} className="pointer-events-none">
                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    fill={lineColor}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1.5}
                    className="transition-all"
                  />

                  {/* Value label directly above point */}
                  <text
                    x={pt.x}
                    y={pt.y - 7}
                    textAnchor="middle"
                    fill={isHovered ? '#0284c7' : '#334155'}
                    fontSize="7.5"
                    fontWeight={isHovered ? '700' : '600'}
                    className="select-none"
                  >
                    {pt.val}
                  </text>
                </g>
              )
            })}

            {/* Hover Guide Line and Active Node */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <g className="pointer-events-none">
                <line
                  x1={points[hoveredIndex].x}
                  y1={padding.top}
                  x2={points[hoveredIndex].x}
                  y2={padding.top + chartHeight}
                  stroke={lineColor}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <circle
                  cx={points[hoveredIndex].x}
                  cy={points[hoveredIndex].y}
                  r="6.5"
                  fill={lineColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* X-axis Dates */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i
              return (
                <text
                  key={`x-date-${i}`}
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill={isHovered ? '#0284c7' : '#64748b'}
                  fontSize="8"
                  fontWeight={isHovered ? '700' : '500'}
                  className="pointer-events-none"
                >
                  {pt.date}
                </text>
              )
            })}

            {/* FULL SLICE HOVER HIT TARGETS - Guaranteed 100% pointer capture */}
            {points.map((pt, i) => {
              const prevX = i === 0 ? padding.left : (points[i - 1].x + pt.x) / 2
              const nextX =
                i === points.length - 1
                  ? svgWidth - padding.right
                  : (pt.x + points[i + 1].x) / 2
              const hitWidth = Math.max(nextX - prevX, 10)

              return (
                <rect
                  key={`salary-hit-${i}`}
                  x={prevX}
                  y={0}
                  width={hitWidth}
                  height={svgHeight}
                  fill="#ffffff"
                  fillOpacity="0"
                  style={{ pointerEvents: 'all' }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseMove={() => setHoveredIndex(i)}
                />
              )
            })}
          </svg>

          {/* High-visibility Information Tooltip Card */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div
              className="absolute pointer-events-none z-30 bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-75"
              style={{
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: '8px',
                transform: `translateX(${
                  hoveredIndex <= 1
                    ? '0%'
                    : hoveredIndex >= data.length - 2
                    ? '-100%'
                    : '-50%'
                })`,
                minWidth: '140px',
              }}
            >
              <div className="font-bold text-sky-300 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
                <span>{data[hoveredIndex].date}</span>
                <span className="text-[10px] text-slate-400 font-normal">Daily Wage</span>
              </div>
              <div className="flex items-center justify-between space-x-3 text-[11px] py-0.5">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: lineColor }}
                  />
                  <span>Wage Payout:</span>
                </span>
                <span className="font-bold text-white">
                  {data[hoveredIndex].label}
                </span>
              </div>
            </div>
          )}
        </div>

      {/* Legend matching screenshot content */}
      <div className="flex items-center justify-center space-x-2 pt-2 border-t border-slate-100/80">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ backgroundColor: lineColor }}
        />
        <span className="text-[11px] font-medium text-slate-600">
          Daily Salary Distribution
        </span>
      </div>
    </div>
  )
}
