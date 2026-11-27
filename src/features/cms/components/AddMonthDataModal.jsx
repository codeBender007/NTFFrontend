import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

export default function AddMonthDataModal({
  isOpen,
  onClose,
  chartTitle,
  months = [],
  currentData = [],
  onSave,
}) {
  const [selectedMonth, setSelectedMonth] = useState(months[0] || 'Apr-25')
  const [targetVal, setTargetVal] = useState('0')
  const [actualVal, setActualVal] = useState('')

  useEffect(() => {
    if (isOpen && currentData.length > 0) {
      const existing = currentData.find((d) => d.month === selectedMonth)
      if (existing) {
        setTargetVal(existing.target !== null && existing.target !== undefined ? String(existing.target) : '0')
        setActualVal(existing.actual !== null && existing.actual !== undefined ? String(existing.actual) : '')
      }
    }
  }, [isOpen, selectedMonth, currentData])

  if (!isOpen) return null

  const handleMonthChange = (m) => {
    setSelectedMonth(m)
    const existing = currentData.find((d) => d.month === m)
    if (existing) {
      setTargetVal(existing.target !== null && existing.target !== undefined ? String(existing.target) : '0')
      setActualVal(existing.actual !== null && existing.actual !== undefined ? String(existing.actual) : '')
    } else {
      setTargetVal('0')
      setActualVal('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      month: selectedMonth,
      target: targetVal !== '' ? Number(targetVal) : 0,
      actual: actualVal !== '' ? Number(actualVal) : null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0b295c]">
              Add / Update Month Data
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{chartTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={targetVal}
                onChange={(e) => setTargetVal(e.target.value)}
                placeholder="0"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Actual Value
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={actualVal}
                onChange={(e) => setActualVal(e.target.value)}
                placeholder="Leave blank if 0 / null"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0b295c] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
