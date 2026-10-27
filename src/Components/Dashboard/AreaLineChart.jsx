import React, { useState } from 'react'

export default function AreaLineChart({
  title,
  data = [],
  series = [],
  height = 200,
  fillArea = true,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Chart Dimensions
  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 30, right: 25, bottom: 35, left: 25 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  // Calculate max value for Y scale
  const allValues = data.flatMap((d) =>
    series.map((s) => (d[s.key] !== undefined ? d[s.key] : 0))
  )
  const maxValue = Math.max(...allValues, 10) * 1.15 || 10
  const minValue = 0

  const getX = (index) => {
    if (data.length <= 1) return padding.left + chartWidth / 2
    return padding.left + (index / (data.length - 1)) * chartWidth
  }

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxValue) * chartHeight
  }

  // Generate paths for series
  const seriesPaths = series.map((s) => {
    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(d[s.key] || 0),
      val: d[s.key] || 0,
      label: d.month,
    }))

    const linePath = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ''
    )

    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${
            padding.top + chartHeight
          } Z`
        : ''

    return { ...s, points, linePath, areaPath }
  })

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
            <defs>
              {series.map((s, idx) => (
                <linearGradient
                  key={s.key}
                  id={`area-grad-${s.key}-${title.replace(/\s+/g, '')}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={s.fillOpacity || 0.45} />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.05" />
                </linearGradient>
              ))}
            </defs>

            {/* Gridlines */}
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

            {/* Area Fill */}
            {fillArea &&
              seriesPaths.map(
                (s) =>
                  s.area && (
                    <path
                      key={`area-${s.key}`}
                      d={s.areaPath}
                      fill={`url(#area-grad-${s.key}-${title.replace(/\s+/g, '')})`}
                    />
                  )
              )}

            {/* Lines */}
            {seriesPaths.map((s) => (
              <path
                key={`line-${s.key}`}
                d={s.linePath}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Data Points & Numbers */}
            {seriesPaths.map((s) =>
              s.points.map((pt, i) => {
                const isHovered = hoveredIndex === i
                return (
                  <g key={`${s.key}-pt-${i}`} className="pointer-events-none">
                    {/* Circle marker */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 4.5 : 3}
                      fill={s.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all"
                    />

                    {/* Numeric Value Label above node */}
                    <text
                      x={pt.x}
                      y={pt.y - 7}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize="9"
                      fontWeight="600"
                      className="select-none"
                    >
                      {pt.val}
                    </text>
                  </g>
                )
              })
            )}

            {/* Hover Guide Line */}
            {hoveredIndex !== null && data[hoveredIndex] && (
              <g className="pointer-events-none">
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={padding.top + chartHeight}
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              </g>
            )}

            {/* X Axis Labels */}
            {data.map((d, i) => (
              <text
                key={`x-${i}`}
                x={getX(i)}
                y={svgHeight - 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9.5"
                fontWeight="500"
                className="pointer-events-none"
              >
                {d.month}
              </text>
            ))}

            {/* Continuous Full Slice Hover Targets - Guaranteed 100% pointer capture */}
            {data.map((d, i) => {
              const x = getX(i)
              const prevX = i === 0 ? padding.left : (getX(i - 1) + x) / 2
              const nextX =
                i === data.length - 1 ? svgWidth - padding.right : (x + getX(i + 1)) / 2
              const hitWidth = Math.max(nextX - prevX, 10)

              return (
                <rect
                  key={`arealine-hit-${i}`}
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
                left: `${(getX(hoveredIndex) / svgWidth) * 100}%`,
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
                <div key={s.key} className="flex items-center justify-between space-x-3 text-[11px] py-0.5">
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.label}:</span>
                  </span>
                  <span className="font-bold text-white">{data[hoveredIndex][s.key]}</span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
