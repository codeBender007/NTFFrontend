import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Filters from '@/components/Filters.jsx'
import DailyManpowerChart from '../components/DailyManpowerChart.jsx'
import AttritionRateChart from '../components/AttritionRateChart.jsx'
import AbsenteeismRateChart from '../components/AbsenteeismRateChart.jsx'
import DailySalaryChart from '../components/DailySalaryChart.jsx'
import DojoManpowerChart from '../components/DojoManpowerChart.jsx'
import SkillLevelDistributionChart from '../components/SkillLevelDistributionChart.jsx'
import GenderDistributionChart from '../components/GenderDistributionChart.jsx'
import OperatorsRequiredVsAvailable from '../components/OperatorsRequiredVsAvailable.jsx'
import ActionsPlannedForManpower from '../components/ActionsPlannedForManpower.jsx'
import { clearSession } from '@/features/auth/utils/authStorage.js'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // Filters State
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
  }

  // 1. Daily Manpower Data (01 May - 10 May)
  const dailyManpowerData = [
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
  ]

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar: Pinned to top */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar: Collapsible on mobile/tablet, fixed on desktop */}
        <Sidebar
          activeTab="Dashboard"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Right Main Content Area: Responsive margins (ml-0 on mobile/tablet, ml-48 on desktop) */}
        <main className="flex-1 ml-0 lg:ml-48 p-3 sm:p-4 md:p-5 min-h-[calc(100vh-53px)] overflow-x-hidden">
          {/* DOJO 2.0 Monitoring Dashboard- CTQ Stations Banner */}
          <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5">
            <h2 className="text-sm sm:text-base md:text-xl font-bold font-serif tracking-tight text-white select-none">
              DOJO 2.0 Monitoring Dashboard- CTQ Stations
            </h2>
          </div>

          {/* Responsive Filter Bar (Plant, Department, Sub-dept, Line, Machine, Shift, Date) */}
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* Main Content Grid: Graphs on Left, Operators & Actions on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-8">
            {/* Left/Center Section: Graphs */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col space-y-4">
              {/* Top Row: Daily Manpower Bar Chart & Attrition Rate Trend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DailyManpowerChart
                  title="Daily Manpower"
                  data={dailyManpowerData}
                />

                <AttritionRateChart />
              </div>

              {/* Middle Row: Daily Salary Line Chart & Absentism Rate Trend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DailySalaryChart />

                <AbsenteeismRateChart />
              </div>

              {/* Row 3: Dojo Manpower Trend & Skill Level Distribution (Side by Side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DojoManpowerChart />

                <SkillLevelDistributionChart />
              </div>

              {/* Bottom Row: Gender Distribution */}
              <div className="w-full">
                <GenderDistributionChart />
              </div>
            </div>

            {/* Right Side: Operators Required vs Available & Actions Planned for Manpower Shortage */}
            <div className="lg:col-span-4 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 self-start">
              <OperatorsRequiredVsAvailable />
              <ActionsPlannedForManpower />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
