import React, { useState } from 'react'

export default function GroupedBarChart({
  title,
  data = [],
  series = [
    { key: 'plan', label: 'Plan', color: '#38bdf8' },
    { key: 'actual', label: 'Actual', color: '#1d4ed8' },
  ],
  height = 200,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Chart Dimensions
  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 30, right: 15, bottom: 35, left: 15 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  // Calculate max value for Y scale
  const allValues = data.flatMap((d) => series.map((s) => d[s.key] || 0))
  const maxValue = Math.max(...allValues, 10) * 1.18 || 10

  const groupWidth = chartWidth / data.length
  const barWidth = Math.min(13, (groupWidth * 0.65) / series.length)
  const barGap = 2

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxValue) * chartHeight
  }

  const getBarHeight = (val) => {
    return (val / maxValue) * chartHeight
  }

  // Horizontal guide lines
  const gridLinesCount = 3
  const gridYValues = Array.from({ length: gridLinesCount }, (_, i) => {
    return padding.top + (chartHeight / (gridLinesCount - 1)) * i
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
          {title}
        </h2>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-5 py-2">
        {series.map((s) => (
          <div key={s.key} className="flex items-center space-x-1.5 text-[11px] text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative w-full select-none my-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible cursor-pointer"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid lines */}
            {gridYValues.map((y, idx) => (
              <line
                key={idx}
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}

            {/* Base line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={svgWidth - padding.right}
              y2={padding.top + chartHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Groups and Bars */}
            {data.map((item, groupIdx) => {
              const groupCenterX =
                padding.left + groupIdx * groupWidth + groupWidth / 2
              const totalBarsWidth =
                series.length * barWidth + (series.length - 1) * barGap
              const startX = groupCenterX - totalBarsWidth / 2
              const isHovered = hoveredIndex === groupIdx

              return (
                <g key={`group-${groupIdx}`}>
                  {/* Column highlight on hover */}
                  {isHovered && (
                    <rect
                      x={padding.left + groupIdx * groupWidth + 2}
                      y={padding.top}
                      width={groupWidth - 4}
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
                        {/* Value label above bar */}
                        <text
                          x={barX + barWidth / 2}
                          y={barY - 4}
                          textAnchor="middle"
                          fill={isHovered ? '#0f172a' : '#334155'}
                          fontSize="8.5"
                          fontWeight="600"
                          className="select-none"
                        >
                          {val}
                        </text>

                        {/* Bar Rect */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={Math.max(bHeight, 0)}
                          fill={s.color}
                          rx="1.5"
                          opacity={hoveredIndex === null || isHovered ? 1 : 0.8}
                          className="transition-opacity"
                        />
                      </g>
                    )
                  })}

                  {/* X Axis label */}
                  <text
                    x={groupCenterX}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fill={isHovered ? '#0284c7' : '#64748b'}
                    fontSize="9.5"
                    fontWeight={isHovered ? '700' : '500'}
                    className="pointer-events-none"
                  >
                    {item.month}
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
              className="absolute pointer-events-none z-30 bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-75"
              style={{
                left: `${
                  ((padding.left + hoveredIndex * groupWidth + groupWidth / 2) /
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
                minWidth: '140px',
              }}
            >
              <div className="font-bold text-sky-300 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
                <span>{data[hoveredIndex].month}</span>
                <span className="text-[10px] text-slate-400 font-normal">Monthly</span>
              </div>
              {series.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between space-x-3 text-[11px] py-0.5"
                >
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.label}:</span>
                  </span>
                  <span className="font-bold text-white">
                    {data[hoveredIndex][s.key]}
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
