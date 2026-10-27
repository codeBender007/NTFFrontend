import React from 'react'
import { Filter, RotateCcw } from 'lucide-react'

export default function DashboardFilterBar({ filters, onFilterChange, onResetFilters }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs p-3 sm:p-3.5 mb-4 select-none">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-700">
          <Filter className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filters
          </span>
        </div>
        <button
          onClick={onResetFilters}
          type="button"
          className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-sky-600 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 items-end">
        {/* 1. Plant */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Plant
          </label>
          <select
            value={filters.plant || ''}
            onChange={(e) => onFilterChange('plant', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value=""></option>
          </select>
        </div>

        {/* 2. Department */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Department
          </label>
          <select
            value={filters.department || ''}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value=""></option>
          </select>
        </div>

        {/* 3. Sub-department */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Sub-department
          </label>
          <select
            value={filters.subDepartment || ''}
            onChange={(e) => onFilterChange('subDepartment', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value=""></option>
          </select>
        </div>

        {/* 4. Line */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Line
          </label>
          <select
            value={filters.line || ''}
            onChange={(e) => onFilterChange('line', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value=""></option>
          </select>
        </div>

        {/* 5. Machine */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Machine
          </label>
          <select
            value={filters.machine || ''}
            onChange={(e) => onFilterChange('machine', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value=""></option>
          </select>
        </div>

        {/* 6. Shift */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Shift
          </label>
          <select
            value={filters.shift || ''}
            onChange={(e) => onFilterChange('shift', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value=""></option>
          </select>
        </div>

        {/* 7. Date */}
        <div className="col-span-2 sm:col-span-1 min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Date
          </label>
          <input
            type="date"
            value={filters.date || ''}
            onChange={(e) => onFilterChange('date', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          />
        </div>
      </div>
    </div>
  )
}
