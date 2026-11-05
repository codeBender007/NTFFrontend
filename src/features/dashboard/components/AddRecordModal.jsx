import React, { useState } from 'react'
import { X, PlusCircle } from 'lucide-react'

export default function AddRecordModal({ isOpen, onClose, onAddRecord }) {
  const [category, setCategory] = useState('project')
  const [title, setTitle] = useState('')
  const [metricValue, setMetricValue] = useState('')
  const [month, setMonth] = useState('Sep-26')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !metricValue) return
    onAddRecord({ category, title, metricValue: Number(metricValue), month })
    setTitle('')
    setMetricValue('')
    onClose()
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0b295c] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Add New Dashboard Record</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="project">Project Metric</option>
              <option value="defect">Defect Record</option>
              <option value="training">Training Record</option>
              <option value="user">User Registration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Record Name / Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MSIL Internal Audit Q3"
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Value / Count
              </label>
              <input
                type="number"
                required
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder="e.g. 15"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Month Period
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="Jan-26">Jan-26</option>
                <option value="Feb-26">Feb-26</option>
                <option value="Mar-26">Mar-26</option>
                <option value="Apr-26">Apr-26</option>
                <option value="May-26">May-26</option>
                <option value="Jun-26">Jun-26</option>
                <option value="Jul-26">Jul-26</option>
                <option value="Aug-26">Aug-26</option>
                <option value="Sep-26">Sep-26</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
