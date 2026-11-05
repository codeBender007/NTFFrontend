import React, { useState } from 'react'
import { Users, Layers, GraduationCap, Award } from 'lucide-react'
import KPICards from '@/components/KPICards.jsx'
import Filters from '@/components/Filters.jsx'

const kpiData = [
  {
    title: 'Total Operators',
    value: 10,
    color: 'blue',
    icon: <Users className="w-5 h-5 text-sky-700" />,
  },
  {
    title: 'Total Sections',
    value: 318,
    color: 'green',
    icon: <Layers className="w-5 h-5 text-emerald-700" />,
  },
  {
    title: 'Total Courses',
    value: 670,
    color: 'orange',
    icon: <GraduationCap className="w-5 h-5 text-amber-700" />,
  },
  {
    title: 'Dojo Hiring',
    value: '85.2%',
    color: 'purple',
    icon: <Award className="w-5 h-5 text-indigo-700" />,
  },
]

export default function LMSDashboard() {
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

  return (
    <div className="space-y-4">
      {/* LMS Overview Banner - Exact pattern from main Dashboard */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            LMS Overview
          </h2>
        </div>
      </div>

      {/* Existing KPI Cards */}
      <KPICards data={kpiData} />

      {/* Existing Filters Bar */}
      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
    </div>
  )
}
