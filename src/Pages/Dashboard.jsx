import React, { useState } from 'react'
import { CalendarCheck, ClipboardList } from 'lucide-react'
import Navbar from '../Components/Dashboard/Navbar.jsx'
import Sidebar from '../Components/Dashboard/Sidebar.jsx'
import DashboardFilterBar from '../Components/Dashboard/DashboardFilterBar.jsx'
import DailyManpowerChart from '../Components/Dashboard/DailyManpowerChart.jsx'
import AttritionRateChart from '../Components/Dashboard/AttritionRateChart.jsx'
import AbsenteeismRateChart from '../Components/Dashboard/AbsenteeismRateChart.jsx'
import DailySalaryChart from '../Components/Dashboard/DailySalaryChart.jsx'
import DojoManpowerChart from '../Components/Dashboard/DojoManpowerChart.jsx'
import SkillLevelDistributionChart from '../Components/Dashboard/SkillLevelDistributionChart.jsx'
import GenderDistributionChart from '../Components/Dashboard/GenderDistributionChart.jsx'
import OperatorsRequiredVsAvailable from '../Components/Dashboard/OperatorsRequiredVsAvailable.jsx'
import ActionsPlannedForManpower from '../Components/Dashboard/ActionsPlannedForManpower.jsx'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filters State
  const initialFilters = {
    plant: '',
    department: '',
    subDepartment: '',
    line: '',
    machine: '',
    shift: '',
    date: new Date().toISOString().split('T')[0],
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
    alert('Logged out successfully.')
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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Right Main Content Area: Responsive margins (ml-0 on mobile/tablet, ml-48 on desktop) */}
        <main className="flex-1 ml-0 lg:ml-48 p-3 sm:p-4 md:p-5 min-h-[calc(100vh-53px)] overflow-x-hidden">
          {activeTab === 'Dashboard' && (
            <>
              {/* DOJO 2.0 Monitoring Dashboard- CTQ Stations Banner */}
              <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5">
                <h2 className="text-sm sm:text-base md:text-xl font-bold font-serif tracking-tight text-white select-none">
                  DOJO 2.0 Monitoring Dashboard- CTQ Stations
                </h2>
              </div>

              {/* Responsive Filter Bar (Plant, Department, Sub-dept, Line, Machine, Shift, Date) */}
              <DashboardFilterBar
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
            </>
          )}

          {activeTab === 'Attendance' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-8 text-center max-w-xl mx-auto my-12">
              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Attendance Overview</h3>
              <p className="text-sm text-slate-500 mb-6">
                Track employee and worker shifts, attendance logs, and biometric records across plants.
              </p>
              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Present Today</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">94.2%</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">On Leave</div>
                  <div className="text-xl font-bold text-amber-600 mt-1">14</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Late Arrivals</div>
                  <div className="text-xl font-bold text-rose-600 mt-1">5</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Requirement' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-8 text-center max-w-xl mx-auto my-12">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Resource & Plant Requirements</h3>
              <p className="text-sm text-slate-500 mb-6">
                Manage upcoming plant capacity requirements, spare parts requisitions, and machine allocations.
              </p>
              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Open Requests</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">28</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Approved</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">42</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Pending Review</div>
                  <div className="text-xl font-bold text-sky-600 mt-1">11</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
