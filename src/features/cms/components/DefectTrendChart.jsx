import React, { useState } from 'react'
import { Plus } from 'lucide-react'

export default function DefectTrendChart({
  title,
  subtitle = 'Monthly Target & Actual tracking',
  icon,
  chartId = 'chart',
  months = [],
  data = [], // [{ month: 'Apr-25', target: 0, actual: null }, ...]
  onAddDataClick,
  defaultMaxY = 6.0,
  stepY = 0.5,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Chart dimensions in SVG coordinate space
  const svgWidth = 800
  const svgHeight = 270

  // Padding: left 54 for clear Y-axis labels, right 20, top: 35 for badges, bottom: 15
  const padding = { left: 54, right: 20, top: 35, bottom: 15 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  // Calculate max Y
  const maxDataVal = Math.max(
    ...data.flatMap((d) => [
      d.target !== null && d.target !== undefined ? Number(d.target) : 0,
      d.actual !== null && d.actual !== undefined ? Number(d.actual) : 0,
    ]),
    0
  )
  const maxY = Math.max(maxDataVal, defaultMaxY)

  // Y-axis grid values (step by stepY)
  const yTicks = []
  for (let val = 0; val <= maxY + 0.001; val = Number((val + stepY).toFixed(2))) {
    yTicks.push(val)
  }

  const getYCoord = (val) => {
    if (val === null || val === undefined) return padding.top + chartHeight
    return padding.top + chartHeight - (val / maxY) * chartHeight
  }

  // Column width & center positions for each month
  const totalMonths = months.length || 11
  const colWidth = chartWidth / totalMonths
  const barWidth = Math.min(26, colWidth * 0.48)

  const getColCenterX = (index) => {
    return padding.left + (index + 0.5) * colWidth
  }

  // Smooth spline curve generator for the Target line
  const createSmoothPath = (points) => {
    if (points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2] || p2

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6

      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return path
  }

  // Build target points
  const targetPoints = data.map((d, i) => ({
    x: getColCenterX(i),
    y: getYCoord(d.target ?? 0),
    val: d.target ?? 0,
    month: d.month,
  }))

  const targetPath = createSmoothPath(targetPoints)

  // Soft gradient area under target line
  const targetAreaPath =
    targetPoints.length > 0
      ? `${targetPath} L ${targetPoints[targetPoints.length - 1].x} ${
          padding.top + chartHeight
        } L ${targetPoints[0].x} ${padding.top + chartHeight} Z`
      : ''

  // Layout percentage calculations to synchronize SVG and HTML table
  const leftPercent = (padding.left / svgWidth) * 100
  const rightPercent = (padding.right / svgWidth) * 100
  const contentPercent = 100 - leftPercent - rightPercent
  const colPercent = contentPercent / totalMonths

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Header matching Dashboard Charts */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0047AB] flex items-center justify-center shrink-0 border border-blue-100">
            {icon}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddDataClick}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0047AB] hover:bg-[#003882] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Add Month Data</span>
        </button>
      </div>

      {/* Legend with round indicators matching Dashboard */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-2.5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 bg-[#10b981] shadow-2xs" />
          <span>ACTUAL (Safe ≤ Target)</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 bg-[#ef4444] shadow-2xs" />
          <span>ACTUAL (Above Target &gt; Target)</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 bg-[#0047AB] shadow-2xs" />
          <span>TARGET</span>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative w-full select-none mt-1 overflow-x-auto">
        <div className="min-w-[620px]">
          {/* SVG Chart */}
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible cursor-pointer"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                {/* Target Soft Area Gradient */}
                <linearGradient id={`targetArea-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0047AB" stopOpacity="0.01" />
                </linearGradient>

                {/* Safe Green Bar Gradient */}
                <linearGradient id={`barSafe-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Danger Red Bar Gradient */}
                <linearGradient id={`barDanger-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-axis labels matching Dashboard */}
              {yTicks.map((val) => {
                const yPos = getYCoord(val)
                return (
                  <g key={`ytick-${val}`}>
                    {val > 0 && (
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={svgWidth - padding.right}
                        y2={yPos}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    )}
                    <text
                      x={padding.left - 8}
                      y={yPos + 3.5}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {val === 0 ? '0' : val.toFixed(1)}
                    </text>
                  </g>
                )
              })}

              {/* Chart Base Line */}
              <line
                x1={padding.left}
                y1={padding.top + chartHeight}
                x2={svgWidth - padding.right}
                y2={padding.top + chartHeight}
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />

              {/* Soft Area fill under target line */}
              {targetAreaPath && (
                <path d={targetAreaPath} fill={`url(#targetArea-${chartId})`} />
              )}

              {/* Actual Defect Bars */}
              {data.map((item, idx) => {
                if (item.actual === null || item.actual === undefined || item.actual === '') {
                  return null
                }

                const actualVal = Number(item.actual)
                const targetVal = Number(item.target ?? 0)
                const isOverTarget = actualVal > targetVal
                const barFill = isOverTarget ? `url(#barDanger-${chartId})` : `url(#barSafe-${chartId})`
                const badgeColor = isOverTarget ? '#dc2626' : '#059669'

                const x = getColCenterX(idx) - barWidth / 2
                const y = getYCoord(actualVal)
                const height = Math.max(0, padding.top + chartHeight - y)

                return (
                  <g
                    key={`bar-${item.month}`}
                    className="cursor-pointer transition-opacity duration-150"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  >
                    {/* The Bar with rounded top */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      fill={barFill}
                      rx="4"
                      ry="4"
                      className="hover:opacity-90 transition-opacity"
                    />

                    {/* Value Badge above the bar */}
                    {actualVal > 0 && (
                      <g>
                        <rect
                          x={getColCenterX(idx) - 10}
                          y={y - 19}
                          width={20}
                          height={15}
                          rx="4"
                          fill={badgeColor}
                        />
                        <text
                          x={getColCenterX(idx)}
                          y={y - 8}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9.5"
                          fontWeight="bold"
                        >
                          {actualVal}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* Main Target Trend Line in Dashboard Blue (#0047AB) */}
              <path
                d={targetPath}
                fill="none"
                stroke="#0047AB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Target Circular Nodes */}
              {targetPoints.map((pt, idx) => (
                <g
                  key={`dot-${pt.month}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 5.5 : 4}
                    fill="#0047AB"
                    stroke="#ffffff"
                    strokeWidth={hoveredIndex === idx ? 2.5 : 2}
                    className="transition-all"
                  />
                </g>
              ))}

              {/* Tooltip on hover matching Dashboard style */}
              {hoveredIndex !== null && data[hoveredIndex] && (
                <g transform={`translate(${getColCenterX(hoveredIndex)}, ${getYCoord(data[hoveredIndex].actual || data[hoveredIndex].target || 0) - 35})`}>
                  <rect
                    x="-45"
                    y="-28"
                    width="90"
                    height="28"
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.94"
                  />
                  <text
                    x="0"
                    y="-15"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="700"
                  >
                    {data[hoveredIndex].month}
                  </text>
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="8.5"
                    fontWeight="600"
                  >
                    Tgt: {data[hoveredIndex].target ?? 0} | Act: {data[hoveredIndex].actual ?? '-'}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Attached Data Table Styled Consistent with Website Theme */}
          <div className="w-full border border-slate-200/90 rounded-lg overflow-hidden mt-2 select-text bg-white shadow-2xs">
            {/* Table Header: Month Names */}
            <div className="flex items-center border-b border-slate-200/80 bg-slate-50/80 text-slate-600 font-bold text-[11px]">
              <div
                style={{ width: `${leftPercent}%` }}
                className="py-1.5 px-2 text-center shrink-0 border-r border-slate-200/80 text-slate-400 font-semibold"
              >
                0
              </div>
              {months.map((m) => (
                <div
                  key={`hdr-${m}`}
                  style={{ width: `${colPercent}%` }}
                  className="py-1.5 px-0.5 text-center shrink-0 border-r border-slate-200/80 last:border-r-0 truncate font-semibold"
                >
                  {m}
                </div>
              ))}
              <div style={{ width: `${rightPercent}%` }} className="shrink-0" />
            </div>

            {/* Row 1: ACTUAL */}
            <div className="flex items-center border-b border-slate-100 text-[11px] font-medium text-slate-800 hover:bg-slate-50/50 transition-colors">
              <div
                style={{ width: `${leftPercent}%` }}
                className="py-2 px-2 shrink-0 border-r border-slate-200/80 flex items-center space-x-1.5 bg-slate-50/40"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0 shadow-2xs" />
                <span className="text-[10px] font-bold text-slate-700">ACTUAL</span>
              </div>
              {data.map((d) => {
                const hasVal = d.actual !== null && d.actual !== undefined && d.actual !== ''
                const isOver = hasVal && Number(d.actual) > Number(d.target ?? 0)

                return (
                  <div
                    key={`act-${d.month}`}
                    style={{ width: `${colPercent}%` }}
                    className="py-2 px-0.5 text-center shrink-0 border-r border-slate-100 last:border-r-0 font-bold"
                  >
                    {hasVal ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          isOver
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {d.actual}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">-</span>
                    )}
                  </div>
                )
              })}
              <div style={{ width: `${rightPercent}%` }} className="shrink-0" />
            </div>

            {/* Row 2: TARGET */}
            <div className="flex items-center text-[11px] font-medium text-slate-800 hover:bg-slate-50/50 transition-colors">
              <div
                style={{ width: `${leftPercent}%` }}
                className="py-2 px-2 shrink-0 border-r border-slate-200/80 flex items-center space-x-1.5 bg-slate-50/40"
              >
                <span className="w-2.5 h-0.5 bg-[#0047AB] inline-block shrink-0" />
                <span className="text-[10px] font-bold text-slate-700">TARGET</span>
              </div>
              {data.map((d) => (
                <div
                  key={`tgt-${d.month}`}
                  style={{ width: `${colPercent}%` }}
                  className="py-2 px-0.5 text-center shrink-0 border-r border-slate-100 last:border-r-0 text-slate-700 font-semibold"
                >
                  {d.target !== null && d.target !== undefined ? d.target : 0}
                </div>
              ))}
              <div style={{ width: `${rightPercent}%` }} className="shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
