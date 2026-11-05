import React, { useState } from 'react'
import { Lightbulb } from 'lucide-react'

export default function DojoManpowerChart({ height = 220 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // 16 days data matching screenshot
  const data = [
    { date: '01 May', planned: 70, deployed: 55, optimal: 45 },
    { date: '02 May', planned: 75, deployed: 62, optimal: 52 },
    { date: '03 May', planned: 68, deployed: 50, optimal: 40 },
    { date: '04 May', planned: 80, deployed: 66, optimal: 58 },
    { date: '05 May', planned: 74, deployed: 58, optimal: 48 },
    { date: '06 May', planned: 60, deployed: 44, optimal: 36 },
    { date: '07 May', planned: 78, deployed: 60, optimal: 54 },
    { date: '08 May', planned: 70, deployed: 52, optimal: 44 },
    { date: '09 May', planned: 75, deployed: 62, optimal: 52 },
    { date: '10 May', planned: 68, deployed: 50, optimal: 40 },
    { date: '11 May', planned: 80, deployed: 66, optimal: 58 },
    { date: '12 May', planned: 74, deployed: 58, optimal: 48 },
    { date: '13 May', planned: 60, deployed: 44, optimal: 36 },
    { date: '14 May', planned: 78, deployed: 60, optimal: 54 },
    { date: '15 May', planned: 74, deployed: 58, optimal: 48 },
    { date: '16 May', planned: 72, deployed: 55, optimal: 46 },
  ]

  // Color theme matching existing dashboard
  const series = [
    { key: 'planned', label: 'Planned', color: '#38bdf8', fillColor: '#38bdf8', opacity: 0.35 },
    { key: 'deployed', label: 'Deployed', color: '#1d4ed8', fillColor: '#1d4ed8', opacity: 0.25 },
    { key: 'optimal', label: 'Optimal', color: '#0b295c', fillColor: '#0b295c', opacity: 0.2 },
  ]

  const svgWidth = 520
  const svgHeight = height
  const padding = { top: 32, right: 20, bottom: 36, left: 34 }

  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  const maxY = 100
  const yTicks = [100, 80, 60, 40, 20, 0]

  const getX = (idx) => {
    return padding.left + (idx / (data.length - 1)) * chartWidth
  }

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxY) * chartHeight
  }

  // Generate paths for each series
  const paths = series.map((s) => {
    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(d[s.key]),
      val: d[s.key],
      date: d.date,
    }))

    const linePath = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ''
    )

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${
      padding.top + chartHeight
    } L ${points[0].x} ${padding.top + chartHeight} Z`

    return { ...s, points, linePath, areaPath }
  })

  // Selected date ticks to prevent overlapping labels
  const tickIndices = [0, 3, 6, 9, 12, 15]

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0047AB] flex items-center justify-center shrink-0 border border-blue-100">
            <Lightbulb className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              Dojo Manpower Trend
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Planned vs deployed vs optimal manpower movement
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
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`dojo-area-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.fillColor} stopOpacity={s.opacity} />
                <stop offset="100%" stopColor={s.fillColor} stopOpacity="0.03" />
              </linearGradient>
            ))}
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

          {/* Vertical grid lines */}
          {tickIndices.map((idx) => (
            <line
              key={`vert-${idx}`}
              x1={getX(idx)}
              y1={padding.top}
              x2={getX(idx)}
              y2={padding.top + chartHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          ))}

          {/* Base line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={svgWidth - padding.right}
            y2={padding.top + chartHeight}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Filled Areas in order */}
          {paths.map((s) => (
            <path
              key={`area-${s.key}`}
              d={s.areaPath}
              fill={`url(#dojo-area-${s.key})`}
            />
          ))}

          {/* Lines */}
          {paths.map((s) => (
            <path
              key={`line-${s.key}`}
              d={s.linePath}
              fill="none"
              stroke={s.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Nodes and Values for primary series on key peaks */}
          {paths[0].points.map((pt, i) => {
            const isHovered = hoveredIndex === i
            const showVal = i % 2 === 0 || i === 15

            return (
              <g key={`dojo-pt-${i}`} className="pointer-events-none">
                {/* Subtle point on top line */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3.5}
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />

                {showVal && (
                  <text
                    x={pt.x}
                    y={pt.y - 7}
                    textAnchor="middle"
                    fill={isHovered ? '#0284c7' : '#0f172a'}
                    fontSize="10"
                    fontWeight={isHovered ? '800' : '700'}
                    className="select-none"
                  >
                    {pt.val}
                  </text>
                )}
              </g>
            )
          })}

          {/* X Axis Date labels on spaced intervals */}
          {tickIndices.map((idx) => {
            const d = data[idx]
            const isHovered = hoveredIndex === idx
            return (
              <text
                key={`xtick-${idx}`}
                x={getX(idx)}
                y={svgHeight - 12}
                textAnchor="middle"
                fill={isHovered ? '#0284c7' : '#475569'}
                fontSize="11"
                fontWeight={isHovered ? '800' : '600'}
                className="pointer-events-none"
              >
                {d.date}
              </text>
            )
          })}

          {/* FULL SLICE HOVER HIT TARGETS */}
          {data.map((item, i) => {
            const prevX = i === 0 ? padding.left : (getX(i - 1) + getX(i)) / 2
            const nextX =
              i === data.length - 1
                ? svgWidth - padding.right
                : (getX(i) + getX(i + 1)) / 2
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
              left: `${(getX(hoveredIndex) / svgWidth) * 100}%`,
              top: '8px',
              transform: `translateX(${
                hoveredIndex <= 2
                  ? '0%'
                  : hoveredIndex >= data.length - 3
                  ? '-100%'
                  : '-50%'
              })`,
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
