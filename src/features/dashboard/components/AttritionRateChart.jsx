import React, { useState } from 'react'
import { Users } from 'lucide-react'

export default function AttritionRateChart({ height = 220 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // 8 months data matching the screenshot
  const data = [
    { month: 'Jan', value: 75 },
    { month: 'Feb', value: 97 },
    { month: 'Mar', value: 76 },
    { month: 'Apr', value: 108 },
    { month: 'May', value: 91 },
    { month: 'Jun', value: 72 },
    { month: 'Jul', value: 112 },
    { month: 'Aug', value: 84 },
  ]

  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 32, right: 22, bottom: 36, left: 36 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  // Y-axis max 140 matching screenshot
  const maxY = 140
  const yTicks = [140, 120, 100, 80, 60, 40, 20, 0]

  const getX = (idx) => {
    return padding.left + (idx / (data.length - 1)) * chartWidth
  }

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxY) * chartHeight
  }

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    val: d.value,
    month: d.month,
  }))

  const linePath = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  )

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    padding.top + chartHeight
  } L ${points[0].x} ${padding.top + chartHeight} Z`

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0047AB] flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              Monthly Attrition
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Deployed headcount with month-over-month movement
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
            <linearGradient id="attritionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.15" />
            </linearGradient>
          </defs>

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
                  x={padding.left - 7}
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

          {/* Area Fill */}
          <path d={areaPath} fill="url(#attritionGrad)" />

          {/* Main Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Base line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={svgWidth - padding.right}
            y2={padding.top + chartHeight}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Points & Numeric Labels */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i
            return (
              <g key={`pt-${i}`} className="pointer-events-none">
                {/* Circular Node Marker */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 4}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all"
                />

                {/* Numeric Value Label above node - comfortably sized and bold */}
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#0284c7' : '#0f172a'}
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '700'}
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
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="6.5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X-axis Month Labels */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i
            return (
              <text
                key={`xtick-${i}`}
                x={pt.x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill={isHovered ? '#0284c7' : '#475569'}
                fontSize="11.5"
                fontWeight={isHovered ? '800' : '600'}
                className="pointer-events-none"
              >
                {pt.month}
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
                key={`hit-${i}`}
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
            className="absolute pointer-events-none z-30 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-75"
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
              minWidth: '150px',
            }}
          >
            <div className="font-bold text-sky-300 border-b border-slate-700/80 pb-1.5 mb-1.5 flex items-center justify-between text-xs sm:text-sm">
              <span>{data[hoveredIndex].month}</span>
              <span className="text-[11px] text-slate-400 font-medium">Monthly Movement</span>
            </div>
            <div className="flex items-center justify-between space-x-3 text-xs py-0.5">
              <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#0284c7] shrink-0 shadow-2xs" />
                <span>Employees Left:</span>
              </span>
              <span className="font-bold text-white text-xs">
                {data[hoveredIndex].value}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-2 pt-2.5 border-t border-slate-100/90">
        <span className="w-3 h-3 rounded-full inline-block bg-[#0284c7] shrink-0 shadow-2xs" />
        <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
          Employees Left
        </span>
      </div>
    </div>
  )
}
