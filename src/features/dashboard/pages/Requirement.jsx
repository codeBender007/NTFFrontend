import React, { useState, useMemo, useRef } from 'react'
import {
  ClipboardList,
  Search,
  Upload,
  FileSpreadsheet,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Filters from '@/components/Filters.jsx'

export default function Requirement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Top Filters state
  const initialFilters = {
    plant: '',
    department: '',
    subDepartment: '',
    line: '',
    machine: '',
    shift: '',
    date: '',
    startDate: '',
    endDate: '',
  }
  const [filters, setFilters] = useState(initialFilters)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const fileInputRef = useRef(null)

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
    setSearchQuery('')
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFileName(file.name)
      alert(`Requirement file "${file.name}" uploaded successfully!`)
    }
  }

  // 12 Months configuration
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ]

  // Sample data payload matching user specifications
  const requirementData = useMemo(() => [
    {
      id: 1,
      code: 'D01-1',
      sectionName: 'D&D',
      lineDescription: 'Engineering',
      approval: 'System Approved',
      jan: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      feb: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      mar: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      apr: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      may: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      jun: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      jul: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      aug: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      sep: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      oct: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      nov: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
      dec: { pp: 5, sp: 0, fn01: 0, fn02: 0 },
    },
    {
      id: 2,
      code: 'D01-2',
      sectionName: 'D&D',
      lineDescription: 'Drafting',
      approval: 'Pending',
      jan: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      feb: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      mar: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      apr: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      may: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      jun: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      jul: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      aug: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      sep: { pp: 2, sp: 3, fn01: 1, fn02: 0 },
      oct: { pp: 1, sp: 3, fn01: 1, fn02: 1 },
      nov: { pp: 1, sp: 2, fn01: 2, fn02: 1 },
      dec: { pp: 1, sp: 2, fn01: 2, fn02: 2 },
    },
    {
      id: 3,
      code: 'D01-3',
      sectionName: 'TOOLING',
      lineDescription: 'Mould Maintenance',
      approval: 'Rejected',
      jan: { pp: 3, sp: 1, fn01: 0, fn02: 0 },
      feb: { pp: 3, sp: 1, fn01: 0, fn02: 0 },
      mar: { pp: 4, sp: 1, fn01: 1, fn02: 0 },
      apr: { pp: 4, sp: 1, fn01: 1, fn02: 0 },
      may: { pp: 4, sp: 1, fn01: 0, fn02: 0 },
      jun: { pp: 3, sp: 2, fn01: 0, fn02: 1 },
      jul: { pp: 3, sp: 2, fn01: 0, fn02: 1 },
      aug: { pp: 3, sp: 1, fn01: 0, fn02: 0 },
      sep: { pp: 3, sp: 1, fn01: 0, fn02: 0 },
      oct: { pp: 4, sp: 1, fn01: 1, fn02: 0 },
      nov: { pp: 4, sp: 1, fn01: 1, fn02: 0 },
      dec: { pp: 4, sp: 1, fn01: 1, fn02: 0 },
    },
    {
      id: 4,
      code: 'D02-1',
      sectionName: 'PRODUCTION',
      lineDescription: 'Main Assembly Line 01',
      approval: 'System Approved',
      jan: { pp: 8, sp: 4, fn01: 2, fn02: 1 },
      feb: { pp: 8, sp: 4, fn01: 2, fn02: 1 },
      mar: { pp: 10, sp: 4, fn01: 2, fn02: 1 },
      apr: { pp: 10, sp: 4, fn01: 2, fn02: 1 },
      may: { pp: 10, sp: 4, fn01: 2, fn02: 1 },
      jun: { pp: 9, sp: 4, fn01: 2, fn02: 1 },
      jul: { pp: 9, sp: 4, fn01: 2, fn02: 1 },
      aug: { pp: 9, sp: 4, fn01: 2, fn02: 1 },
      sep: { pp: 9, sp: 4, fn01: 2, fn02: 1 },
      oct: { pp: 10, sp: 5, fn01: 2, fn02: 2 },
      nov: { pp: 10, sp: 5, fn01: 2, fn02: 2 },
      dec: { pp: 10, sp: 5, fn01: 2, fn02: 2 },
    },
  ], [])

  // Filtered rows based on search
  const filteredRows = useMemo(() => {
    return requirementData.filter((r) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return (
        r.code.toLowerCase().includes(q) ||
        r.sectionName.toLowerCase().includes(q) ||
        r.lineDescription.toLowerCase().includes(q) ||
        r.approval.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, requirementData])

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar: Active tab is Requirement */}
        <Sidebar
          activeTab="Requirement"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 ml-0 lg:ml-48 p-3 sm:p-4 md:p-5 min-h-[calc(100vh-53px)] overflow-x-hidden">
          {/* Header Banner */}
          <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
            <div>
              <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
                DOJO 2.0 Manpower & Line Requirement - CTQ Stations
              </h2>
            </div>
          </div>

          {/* Top Filter Bar (exact same filter bar as Dashboard) */}
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* Main Requirement Table Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col space-y-3.5">
            {/* Table Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <ClipboardList className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Line Requirement Matrix
                  </h3>
                </div>
              </div>

              {/* Controls: Search, Approval Filter, and Upload Excel */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search code, section, line..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 rounded-md pl-8 pr-2.5 py-1.5 h-[32px] transition-all"
                  />
                </div>

                {/* Hidden File Input for Excel */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                {/* Upload Excel Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-[#0284c7] hover:bg-[#0369a1] active:scale-95 text-white px-3.5 py-1.5 rounded-md shadow-xs transition-all cursor-pointer h-[32px]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Excel</span>
                </button>

                {uploadedFileName && (
                  <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[140px] font-medium">{uploadedFileName}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Requirement Table Container with Sticky Headers */}
            <div className="overflow-x-auto max-h-[580px] overflow-y-auto border border-slate-200 rounded-lg shadow-2xs select-none">
              <table className="w-full text-left text-xs border-collapse">
                {/* 2-Tier Sticky Header */}
                <thead className="sticky top-0 z-30 shadow-xs">
                  {/* Tier 1 Header */}
                  <tr className="bg-[#0b295c] text-white">
                    {/* Fixed Info Columns */}
                    <th
                      rowSpan={2}
                      className="sticky left-0 z-40 bg-[#0b295c] py-2 px-3 font-semibold border-r border-[#153e7e] min-w-[75px]"
                    >
                      Code
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky left-[75px] z-40 bg-[#0b295c] py-2 px-3 font-semibold border-r-2 border-[#153e7e] min-w-[90px] shadow-sm"
                    >
                      Section Name
                    </th>
                    <th
                      rowSpan={2}
                      className="py-2 px-3 font-semibold border-r-2 border-[#1d4ed8] min-w-[150px]"
                    >
                      Line Description
                    </th>

                    {/* 12 Months: Each spans 4 sub-columns (PP, SP, FN01, FN02) */}
                    {months.map((m) => (
                      <th
                        key={m}
                        colSpan={4}
                        className="py-1 px-1 font-bold text-center border-r border-[#153e7e] bg-[#0d3472] text-sky-200 tracking-wider text-[11px]"
                      >
                        {m}
                      </th>
                    ))}
                  </tr>

                  {/* Tier 2 Header: PP, SP, FN01, FN02 for each month */}
                  <tr className="bg-[#103b7b] text-sky-100 text-[10px]">
                    {months.map((m) => (
                      <React.Fragment key={`sub-${m}`}>
                        <th
                          title="Planned Persons"
                          className="py-1 px-1.5 text-center font-semibold border-r border-[#1a4a94] min-w-[32px] bg-[#0f3875]"
                        >
                          PP
                        </th>
                        <th
                          title="Standard Persons"
                          className="py-1 px-1.5 text-center font-semibold border-r border-[#1a4a94] min-w-[32px] bg-[#0c3167]"
                        >
                          SP
                        </th>
                        <th
                          title="Functional Need 01"
                          className="py-1 px-1.5 text-center font-semibold border-r border-[#1a4a94] min-w-[34px] bg-[#0f3875]"
                        >
                          FN01
                        </th>
                        <th
                          title="Functional Need 02"
                          className="py-1 px-1.5 text-center font-semibold border-r border-[#1a4a94] min-w-[34px] bg-[#0c3167]"
                        >
                          FN02
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3 + months.length * 4}
                        className="py-12 text-center text-slate-400 font-medium"
                      >
                        No matching line requirement records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-sky-50/60 transition-colors group"
                        >
                          {/* 1. Code (Sticky Left) */}
                          <td className="sticky left-0 z-20 bg-white group-hover:bg-sky-50/80 py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-200">
                            {row.code}
                          </td>

                          {/* 2. Section Name (Sticky Left with shadow) */}
                          <td className="sticky left-[75px] z-20 bg-white group-hover:bg-sky-50/80 py-2.5 px-3 font-medium text-slate-700 border-r-2 border-slate-200 shadow-xs">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              {row.sectionName}
                            </span>
                          </td>

                          {/* 3. Line Description */}
                          <td className="py-2.5 px-3 font-medium text-slate-800 border-r-2 border-slate-200">
                            {row.lineDescription}
                          </td>

                          {/* 5. 12 Monthly Breakdown: PP, SP, FN01, FN02 */}
                          {months.map((m) => {
                            const monthKey = m.toLowerCase()
                            const mData = row[monthKey] || {
                              pp: 0,
                              sp: 0,
                              fn01: 0,
                              fn02: 0,
                            }

                            return (
                              <React.Fragment key={`cell-${row.id}-${m}`}>
                                {/* PP (Planned Persons) */}
                                <td className="py-2 px-1 text-center border-r border-slate-100 font-bold text-slate-800 bg-sky-50/20">
                                  {mData.pp}
                                </td>

                                {/* SP (Standard Persons) */}
                                <td className="py-2 px-1 text-center border-r border-slate-100 font-medium text-slate-600 bg-slate-50/30">
                                  {mData.sp}
                                </td>

                                {/* FN01 */}
                                <td className="py-2 px-1 text-center border-r border-slate-100 text-slate-500 text-[11px]">
                                  {mData.fn01}
                                </td>

                                {/* FN02 */}
                                <td className="py-2 px-1 text-center border-r border-slate-200 text-slate-500 text-[11px] bg-slate-50/40">
                                  {mData.fn02}
                                </td>
                              </React.Fragment>
                            )
                          })}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Record Count */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end text-xs text-slate-600">
              <div className="text-[11px] text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-700">
                  {filteredRows.length}
                </span>{' '}
                of {requirementData.length} records
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
