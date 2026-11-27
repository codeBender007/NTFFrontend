import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, GraduationCap, Clock, ArrowRight, LogOut } from 'lucide-react'
import { clearSession, getUser } from '@/features/auth/utils/authStorage.js'
import ntfLogo from '@/assets/images/NTF_logo_black.png'
import loginBg from '@/assets/images/login-bg.png'

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
      description: 'View insights, performance and key metrics.',
      icon: LayoutGrid,
      isLive: true,
      actionText: 'Open Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      id: 'lms',
      title: 'LMS',
      description: 'Manage training, learning paths and users.',
      icon: GraduationCap,
      isLive: true,
      actionText: 'Open LMS',
      onClick: () => navigate('/lms/dashboard'),
    },
    {
      id: 'cms',
      title: 'CMS',
      description: 'Manage content, media and digital modules.',
      icon: null, // Custom folder-play SVG
      isLive: true,
      actionText: 'Open CMS',
      onClick: () => navigate('/cms'),
    },
  ]

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-6 select-none relative font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Top right subtle profile/logout */}
      <div className="absolute top-4 sm:top-5 right-4 sm:right-6 z-20 flex items-center gap-2.5 sm:gap-3">
        {user && (user.username || user.email || user.name || user.empName) && (
          <span className="text-xs text-slate-600 hidden sm:inline-block font-medium bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/60 shadow-2xs">
            {user.username || user.email || user.name || user.empName}
          </span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/80 bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center justify-center my-auto">
        {/* NTF Brand Logo */}
        <div className="mb-2.5 sm:mb-3 flex justify-center">
          <img
            src={ntfLogo}
            alt="NTF Group Holding"
            className="h-20 sm:h-24 md:h-26 w-auto max-w-[260px] object-contain mix-blend-multiply"
          />
        </div>

        {/* DOJO 2.0 Title & Center Accent Bar */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f1f38] tracking-tight">
            DOJO 2.0
          </h1>
          <div className="relative flex items-center justify-center w-40 sm:w-48 mx-auto mt-2.5">
            <div className="w-full h-px bg-slate-300/80" />
            <div className="absolute w-10 sm:w-12 h-1 bg-[#0052cc] rounded-full" />
          </div>
        </div>

        {/* 3 Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {modules.map((m) => {
            const IconComponent = m.icon
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div>
                  {/* Top row: Icon & Status Badge */}
                  <div className="flex items-center justify-between mb-5">
                    {/* Icon container */}
                    <div className="w-11 h-11 rounded-xl bg-[#edf3fb] flex items-center justify-center text-[#1e40af] shrink-0">
                      {IconComponent ? (
                        <IconComponent className="w-5 h-5 stroke-[2] text-[#2563eb]" />
                      ) : (
                        /* Folder with play triangle SVG for CMS */
                        <svg
                          className="w-5 h-5 text-[#2563eb]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                          <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
                        </svg>
                      )}
                    </div>

                    {/* Badge */}
                    {m.isLive ? (
                      <span className="inline-flex items-center text-xs font-semibold text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#137333] mr-1.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-[#edf2f7] px-2.5 py-0.5 rounded-full gap-1">
                        <Clock className="w-3 h-3 stroke-[2] text-slate-500" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-bold text-[#0f1f38] mb-1.5">
                    {m.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {m.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 relative z-10">
                  {m.isLive ? (
                    <button
                      type="button"
                      onClick={m.onClick}
                      className="w-full py-3 px-4 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>{m.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 bg-[#edf2f7] text-slate-500 font-medium text-xs rounded-xl text-center">
                      {m.actionText}
                    </div>
                  )}
                </div>

                {/* Subtle curved blue wave accent in bottom-right corner */}
                <svg
                  className="absolute -bottom-1 -right-1 w-28 h-20 pointer-events-none opacity-60 z-0"
                  viewBox="0 0 120 80"
                  fill="none"
                >
                  <path
                    d="M10 80 C 45 80, 85 55, 120 15 L 120 80 Z"
                    fill="#bfdbfe"
                    fillOpacity="0.45"
                  />
                  <path
                    d="M40 80 C 75 80, 95 65, 120 35 L 120 80 Z"
                    fill="#93c5fd"
                    fillOpacity="0.65"
                  />
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
