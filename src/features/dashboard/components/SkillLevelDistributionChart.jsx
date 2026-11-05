import React, { useState } from 'react'
import { BarChart2 } from 'lucide-react'

export default function SkillLevelDistributionChart({ height = 220 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Data matching screenshot: L0, L1, L2, L3 with Actual and Present metrics
  const data = [
    { level: 'L 0', actual: 80, present: 65 },
    { level: 'L 1', actual: 65, present: 50 },
    { level: 'L 2', actual: 90, present: 72 },
    { level: 'L 3', actual: 70, present: 58 },
  ]

  // Color theme strictly matching existing dashboard palette
  const series = [
    { key: 'actual', label: 'Actual', color: '#1d4ed8' },
    { key: 'present', label: 'Present', color: '#38bdf8' },
  ]

  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 32, right: 25, bottom: 36, left: 34 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  const maxY = 100
  const yTicks = [100, 80, 60, 40, 20, 0]

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxY) * chartHeight
  }

  const getBarHeight = (val) => {
    return (val / maxY) * chartHeight
  }

  const groupWidth = chartWidth / data.length
  const barWidth = 20
  const barGap = 5

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0047AB] flex items-center justify-center shrink-0 border border-blue-100">
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              Skill Level Distribution
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Required vs allocation vs actual present by skill level
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

          {/* Groups and Bars for L0, L1, L2, L3 */}
          {data.map((item, groupIdx) => {
            const groupCenterX =
              padding.left + groupIdx * groupWidth + groupWidth / 2
            const totalBarsWidth =
              series.length * barWidth + (series.length - 1) * barGap
            const startX = groupCenterX - totalBarsWidth / 2
            const isHovered = hoveredIndex === groupIdx

            return (
              <g key={`skill-grp-${groupIdx}`}>
                {/* Column highlight on hover */}
                {isHovered && (
                  <rect
                    x={padding.left + groupIdx * groupWidth + 4}
                    y={padding.top}
                    width={groupWidth - 8}
                    height={chartHeight}
                    fill="rgba(56, 189, 248, 0.08)"
                    rx="6"
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
                      {/* Value label directly above bar - large and clear */}
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 4}
                        textAnchor="middle"
                        fill={isHovered ? '#0f172a' : '#1e293b'}
                        fontSize="11"
                        fontWeight="700"
                        className="select-none"
                      >
                        {val}
                      </text>

                      {/* Bar with rounded top */}
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={Math.max(bHeight, 0)}
                        fill={s.color}
                        rx="2"
                        opacity={hoveredIndex === null || isHovered ? 1 : 0.85}
                        className="transition-opacity"
                      />
                    </g>
                  )
                })}

                {/* X Axis Skill Level label */}
                <text
                  x={groupCenterX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill={isHovered ? '#0284c7' : '#334155'}
                  fontSize="12.5"
                  fontWeight={isHovered ? '800' : '700'}
                  className="pointer-events-none"
                >
                  {item.level}
                </text>
              </g>
            )
          })}

          {/* FULL COLUMN HOVER OVERLAYS */}
          {data.map((item, groupIdx) => (
            <rect
              key={`skill-hit-${groupIdx}`}
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
              left: `${
                ((padding.left +
                  hoveredIndex * groupWidth +
                  groupWidth / 2) /
                  svgWidth) *
                100
              }%`,
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
              <span>{data[hoveredIndex].level}</span>
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

      {/* Legend */}
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
