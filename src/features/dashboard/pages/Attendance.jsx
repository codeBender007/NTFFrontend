import React, { useState, useMemo, useRef } from 'react'
import {
  Search,
  Upload,
  CalendarCheck,
  FileSpreadsheet,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Filters from '@/components/Filters.jsx'
import { useSidebar } from '@/contexts/SidebarContext.jsx'

export default function Attendance() {
  const { isCollapsed } = useSidebar()
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
      alert(`Excel file "${file.name}" uploaded successfully!`)
    }
  }

  // Pre-columns, Date columns, and Post-columns matching exact specification
  const preColumns = [
    'SNo.',
    'PAYCODE',
    'Card No',
    'Employee Name',
    'Department Name',
    'Subdepartment Name',
    'Designation',
    'Date Of Join',
  ]

  const dateColumns = [
    '01/09',
    '02/09',
    '03/09',
    '04/09',
    '05/09',
    '06/09',
    '07/09',
    '08/09',
    '09/09',
    '10/09',
    '11/09',
    '12/09',
    '13/09',
    '14/09',
  ]

  const postColumns = [
    'DW',
    'HLD',
    'CL',
    'EL',
    'ML',
    'PL',
    'SL',
    'REST',
    'TOTAL',
    'ABS',
    'Paid_Days',
  ]

  // Data structure matching provided sample payload with additional realistic records
  const initialRows = useMemo(() => [
    {
      id: 1,
      sno: 1,
      paycode: '10144',
      cardNo: '00010144',
      employeeName: 'Vishnu',
      departmentName: 'LB',
      subDepartmentName: 'LB',
      designation: 'ASSEMBLER',
      dateOfJoin: '01/11/2018',
      attendance: [
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'HLD', b: 'HLD' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'HLD', b: 'HLD' },
      ],
      dw: 10,
      hld: 2,
      cl: 0.0,
      el: 0.0,
      ml: 0.0,
      pl: 0.0,
      sl: 0.0,
      rest: 2,
      total: 14,
      abs: 0,
      paidDays: 14,
    },
    {
      id: 2,
      sno: 2,
      paycode: '10382',
      cardNo: '00010382',
      employeeName: 'DEEPAK',
      departmentName: 'ACCESSORIES',
      subDepartmentName: 'ACCESSORIES',
      designation: 'HELPER',
      dateOfJoin: '18/06/2020',
      attendance: [
        { a: 'A', b: 'A' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'HLD', b: 'HLD' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'A', b: 'A' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'A', b: 'A' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'HLD', b: 'HLD' },
      ],
      dw: 7,
      hld: 2,
      cl: 0.0,
      el: 0.0,
      ml: 0.0,
      pl: 0.0,
      sl: 0.0,
      rest: 2,
      total: 14,
      abs: 3,
      paidDays: 11,
    },
    {
      id: 3,
      sno: 3,
      paycode: '10503',
      cardNo: '00010503',
      employeeName: 'Virender',
      departmentName: 'STORE',
      subDepartmentName: 'STORE',
      designation: 'HELPER',
      dateOfJoin: '26/05/2021',
      attendance: [
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'HLD', b: 'HLD' },
        { a: 'P', b: 'P' },
        { a: 'POW', b: 'POW' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'POH', b: 'POH' },
      ],
      dw: 10,
      hld: 2,
      cl: 0.0,
      el: 0.0,
      ml: 0.0,
      pl: 0.0,
      sl: 0.0,
      rest: 2,
      total: 14,
      abs: 0,
      paidDays: 14,
    },
    {
      id: 4,
      sno: 4,
      paycode: '10612',
      cardNo: '00010612',
      employeeName: 'Rajesh Kumar',
      departmentName: 'PAINT SHOP',
      subDepartmentName: 'PAINTING',
      designation: 'OPERATOR',
      dateOfJoin: '12/03/2019',
      attendance: [
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'HLD', b: 'HLD' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'HLD', b: 'HLD' },
      ],
      dw: 10,
      hld: 2,
      cl: 0.0,
      el: 0.0,
      ml: 0.0,
      pl: 0.0,
      sl: 0.0,
      rest: 2,
      total: 14,
      abs: 0,
      paidDays: 14,
    },
    {
      id: 5,
      sno: 5,
      paycode: '10745',
      cardNo: '00010745',
      employeeName: 'Anita Devi',
      departmentName: 'QUALITY',
      subDepartmentName: 'CTQ LINE',
      designation: 'INSPECTOR',
      dateOfJoin: '05/08/2022',
      attendance: [
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'A', b: 'A' },
        { a: 'HLD', b: 'HLD' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'HLD', b: 'HLD' },
      ],
      dw: 9,
      hld: 2,
      cl: 0.0,
      el: 0.0,
      ml: 0.0,
      pl: 0.0,
      sl: 0.0,
      rest: 2,
      total: 14,
      abs: 1,
      paidDays: 13,
    },
    {
      id: 6,
      sno: 6,
      paycode: '10890',
      cardNo: '00010890',
      employeeName: 'Sunil Sharma',
      departmentName: 'MAINTENANCE',
      subDepartmentName: 'MECHANICAL',
      designation: 'TECHNICIAN',
      dateOfJoin: '15/01/2020',
      attendance: [
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'HLD', b: 'HLD' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'P', b: 'P' },
        { a: 'WO', b: 'WO' },
        { a: 'HLD', b: 'HLD' },
      ],
      dw: 10,
      hld: 2,
      cl: 0.0,
      el: 0.0,
      ml: 0.0,
      pl: 0.0,
      sl: 0.0,
      rest: 2,
      total: 14,
      abs: 0,
      paidDays: 14,
    },
  ], [])

  // Filtered rows based on search
  const filteredRows = useMemo(() => {
    return initialRows.filter((r) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return (
        r.employeeName.toLowerCase().includes(q) ||
        r.paycode.toLowerCase().includes(q) ||
        r.cardNo.toLowerCase().includes(q) ||
        r.departmentName.toLowerCase().includes(q) ||
        r.subDepartmentName.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, initialRows])

  // Status badge styling helper
  const getStatusBadge = (val) => {
    switch (val) {
      case 'P':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100'
      case 'A':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold hover:bg-rose-100'
      case 'HLD':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold hover:bg-amber-100'
      case 'WO':
        return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
      case 'POW':
        return 'bg-sky-50 text-sky-700 border-sky-300 font-bold hover:bg-sky-100'
      case 'POH':
        return 'bg-teal-50 text-teal-700 border-teal-300 font-bold hover:bg-teal-100'
      case 'CL':
      case 'EL':
      case 'ML':
      case 'PL':
      case 'SL':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-medium hover:bg-purple-100'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col font-sans text-slate-800">
      {/* Navbar: Pinned to top */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Sidebar: Highlight Attendance */}
        <Sidebar
          activeTab="Attendance"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 p-3 sm:p-4 md:p-5 min-h-[calc(100vh-64px)] overflow-x-hidden transition-all duration-300 ${
            isCollapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-60'
          }`}
        >
          {/* Header Banner */}
          <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
            <div>
              <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
                DOJO 2.0 Attendance Monitoring Register - CTQ Stations
              </h2>
            </div>

          </div>

          {/* Top Filter Bar (exact same filter bar as Dashboard) */}
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* Main Attendance Table Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col space-y-3.5">
            {/* Table Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Daily Attendance Sheet
                  </h3>
                </div>
              </div>

              {/* Controls: Search and Upload Excel */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, code, dept..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 rounded-md pl-8 pr-2.5 py-1.5 h-[32px] transition-all"
                  />
                </div>

                {/* Hidden File Input for Excel Upload */}
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

            {/* Scrollable Attendance Table Container */}
            <div className="overflow-x-auto max-h-[580px] overflow-y-auto border border-slate-200 rounded-lg shadow-2xs select-none">
              <table className="w-full text-left text-xs border-collapse">
                {/* 2-Tier Sticky Header */}
                <thead className="sticky top-0 z-30 shadow-xs">
                  {/* Row 1: Pre-columns (rowSpan 2), Date group columns (colSpan 2), Post-columns (rowSpan 2) */}
                  <tr className="bg-[#0b295c] text-white">
                    {/* Pre-Columns */}
                    <th
                      rowSpan={2}
                      className="sticky left-0 z-40 bg-[#0b295c] py-2 px-2.5 font-semibold text-center border-r border-[#153e7e] min-w-[46px]"
                    >
                      SNo.
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky left-[46px] z-40 bg-[#0b295c] py-2 px-2.5 font-semibold border-r border-[#153e7e] min-w-[70px]"
                    >
                      PAYCODE
                    </th>
                    <th
                      rowSpan={2}
                      className="py-2 px-2.5 font-semibold border-r border-[#153e7e] min-w-[85px]"
                    >
                      Card No
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky left-[116px] z-40 bg-[#0b295c] py-2 px-3 font-semibold border-r-2 border-[#153e7e] min-w-[130px] shadow-sm"
                    >
                      Employee Name
                    </th>
                    <th
                      rowSpan={2}
                      className="py-2 px-2.5 font-semibold border-r border-[#153e7e] min-w-[100px]"
                    >
                      Department Name
                    </th>
                    <th
                      rowSpan={2}
                      className="py-2 px-2.5 font-semibold border-r border-[#153e7e] min-w-[110px]"
                    >
                      Subdept. Name
                    </th>
                    <th
                      rowSpan={2}
                      className="py-2 px-2.5 font-semibold border-r border-[#153e7e] min-w-[95px]"
                    >
                      Designation
                    </th>
                    <th
                      rowSpan={2}
                      className="py-2 px-2.5 font-semibold border-r-2 border-[#1d4ed8] min-w-[90px]"
                    >
                      Date Of Join
                    </th>

                    {/* Date Columns: each date header spans dual columns A and B */}
                    {dateColumns.map((date) => (
                      <th
                        key={date}
                        colSpan={2}
                        className="py-1 px-1 font-bold text-center border-r border-[#153e7e] bg-[#0d3472] text-sky-200 tracking-wider text-[11px]"
                      >
                        {date}
                      </th>
                    ))}

                    {/* Post-Columns */}
                    {postColumns.map((col) => (
                      <th
                        key={col}
                        rowSpan={2}
                        className={`py-2 px-2 font-bold text-center border-r border-[#153e7e] text-[11px] ${col === 'Paid_Days'
                          ? 'bg-[#0284c7] text-white min-w-[70px]'
                          : col === 'ABS'
                            ? 'bg-[#881337] text-white min-w-[50px]'
                            : 'min-w-[48px]'
                          }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>

                  {/* Row 2: Sub-headers A and B under each date */}
                  <tr className="bg-[#103b7b] text-sky-100 text-[10px]">
                    {dateColumns.map((date) => (
                      <React.Fragment key={`sub-${date}`}>
                        <th className="py-1 px-1 text-center font-semibold border-r border-[#1a4a94] min-w-[32px] bg-[#0f3875]">
                          A
                        </th>
                        <th className="py-1 px-1 text-center font-semibold border-r border-[#1a4a94] min-w-[32px] bg-[#0c3167]">
                          B
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
                        colSpan={
                          preColumns.length +
                          dateColumns.length * 2 +
                          postColumns.length
                        }
                        className="py-12 text-center text-slate-400 font-medium"
                      >
                        No matching employee attendance records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-sky-50/60 transition-colors group"
                      >
                        {/* 1. SNo. (Sticky Left) */}
                        <td className="sticky left-0 z-20 bg-white group-hover:bg-sky-50/80 py-2 px-2.5 text-center font-medium text-slate-500 border-r border-slate-200">
                          {row.sno}
                        </td>

                        {/* 2. PAYCODE (Sticky Left) */}
                        <td className="sticky left-[46px] z-20 bg-white group-hover:bg-sky-50/80 py-2 px-2.5 font-semibold text-slate-800 border-r border-slate-200">
                          {row.paycode}
                        </td>

                        {/* 3. Card No */}
                        <td className="py-2 px-2.5 text-slate-600 font-mono text-[11px] border-r border-slate-100">
                          {row.cardNo}
                        </td>

                        {/* 4. Employee Name (Sticky Left with subtle shadow) */}
                        <td className="sticky left-[116px] z-20 bg-white group-hover:bg-sky-50/80 py-2 px-3 font-bold text-slate-900 border-r-2 border-slate-200 shadow-xs">
                          {row.employeeName}
                        </td>

                        {/* 5. Department Name */}
                        <td className="py-2 px-2.5 text-slate-700 font-medium border-r border-slate-100">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px]">
                            {row.departmentName}
                          </span>
                        </td>

                        {/* 6. Subdepartment Name */}
                        <td className="py-2 px-2.5 text-slate-600 border-r border-slate-100">
                          {row.subDepartmentName}
                        </td>

                        {/* 7. Designation */}
                        <td className="py-2 px-2.5 text-slate-600 text-[11px] font-medium border-r border-slate-100">
                          {row.designation}
                        </td>

                        {/* 8. Date Of Join */}
                        <td className="py-2 px-2.5 text-slate-500 text-[11px] border-r-2 border-slate-200 font-mono">
                          {row.dateOfJoin}
                        </td>

                        {/* Date Attendance Columns (a & b) */}
                        {row.attendance.map((att, idx) => (
                          <React.Fragment key={`att-${row.id}-${idx}`}>
                            {/* A Value */}
                            <td className="py-1 px-1 text-center border-r border-slate-100 bg-slate-50/30">
                              <span
                                className={`inline-flex items-center justify-center min-w-[24px] h-[20px] px-1 text-[10px] rounded border transition-all ${getStatusBadge(
                                  att.a
                                )}`}
                              >
                                {att.a}
                              </span>
                            </td>

                            {/* B Value */}
                            <td className="py-1 px-1 text-center border-r border-slate-200 bg-slate-50/50">
                              <span
                                className={`inline-flex items-center justify-center min-w-[24px] h-[20px] px-1 text-[10px] rounded border transition-all ${getStatusBadge(
                                  att.b
                                )}`}
                              >
                                {att.b}
                              </span>
                            </td>
                          </React.Fragment>
                        ))}

                        {/* Post-Columns */}
                        <td className="py-2 px-2 text-center font-semibold text-slate-800 border-r border-slate-100">
                          {row.dw}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-100">
                          {row.hld}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-100">
                          {row.cl.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-100">
                          {row.el.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-100">
                          {row.ml.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-100">
                          {row.pl.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-100">
                          {row.sl.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-100">
                          {row.rest}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-800 border-r border-slate-100 bg-slate-50/60">
                          {row.total}
                        </td>

                        {/* ABS (Highlight red if > 0) */}
                        <td className="py-2 px-2 text-center border-r border-slate-100">
                          {row.abs > 0 ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                              {row.abs}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">0</span>
                          )}
                        </td>

                        {/* Paid_Days (Highlight Sky/Blue) */}
                        <td className="py-2 px-2 text-center font-bold text-[#0284c7] bg-sky-50/40 border-r border-slate-100">
                          {row.paidDays}
                        </td>
                      </tr>
                    ))
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
                of {initialRows.length} records
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
