import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, FolderKanban, ArrowRight, LogOut } from 'lucide-react'
import Navbar from '@/components/Navbar.jsx'
import { clearSession, getUser } from '@/features/auth/utils/authStorage.js'

export default function HomePage() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const modules = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      iconBg: 'bg-sky-50 text-sky-700 border-sky-100',
      actionText: 'Open Dashboard',
      isLive: true,
      onClick: () => navigate('/dashboard'),
    },
    {
      id: 'lms',
      title: 'LMS',
      icon: GraduationCap,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      actionText: 'Open LMS',
      isLive: true,
      onClick: () => navigate('/lms/dashboard'),
    },
    {
      id: 'cms',
      title: 'CMS',
      icon: FolderKanban,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      actionText: 'Coming Soon',
      isLive: false,
      onClick: () => { },
    },
  ]

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-slate-800">
      {/* Top Navigation */}
      <Navbar>
        <div className="flex items-center space-x-3">
          {user && (user.username || user.email || user.name || user.empName) && (
            <span className="text-xs text-sky-200 hidden sm:inline-block font-medium">
              {user.username || user.email || user.name || user.empName}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 border border-rose-400/30 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </Navbar>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center">
        {/* Simple & Clean Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            DOJO 2.0
          </h1>
        </div>

        {/* 3 Simple, Professional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.id}
                onClick={m.isLive ? m.onClick : undefined}
                className={`bg-white rounded-xl border border-slate-200/90 p-6 flex flex-col justify-between transition-all duration-200 ${m.isLive
                  ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer group'
                  : 'opacity-90 cursor-default'
                  }`}
              >
                <div>
                  {/* Icon & Live/Status Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${m.iconBg}`}
                    >
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    {m.isLive ? (
                      <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-slate-900 mb-6 group-hover:text-sky-700 transition-colors">
                    {m.title}
                  </h2>
                </div>

                {/* Bottom Action Button / Status */}
                <div>
                  {m.isLive ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        m.onClick()
                      }}
                      className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#0b295c] hover:bg-[#103a7d] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{m.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                      Module in Preparation
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
