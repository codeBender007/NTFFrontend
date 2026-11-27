import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, FileText, ArrowRight, LogOut } from 'lucide-react'
import { clearSession, getUser } from '@/features/auth/utils/authStorage.js'
import ntfLogo from '@/assets/images/NTF_logo_black.png'
import loginBg from '@/assets/images/login-bg.png'

export default function EmployeePage() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const modules = [
    {
      id: 'past-papers',
      title: 'Past Question Papers',
      description: 'View and review previous question papers that you have already completed and submitted.',
      icon: CheckCircle2,
      isLive: true,
      badgeText: 'Completed',
      actionText: 'Open Past Papers',
      onClick: () => navigate('/employee/past-papers'),
    },
    {
      id: 'upcoming-papers',
      title: 'Current & Upcoming Question Papers',
      description: 'Access active question papers to attempt and view upcoming training assessments.',
      icon: FileText,
      isLive: true,
      badgeText: 'Active',
      actionText: 'Open Question Papers',
      onClick: () => navigate('/employee/upcoming-papers'),
    },
  ]

  const displayName = user?.empName || user?.name || user?.username || user?.email || 'Employee'

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-6 select-none relative font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Top right subtle profile/logout */}
      <div className="absolute top-4 sm:top-5 right-4 sm:right-6 z-20 flex items-center gap-2.5 sm:gap-3">
        {user && (
          <span className="text-xs text-slate-600 hidden sm:inline-block font-medium bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/60 shadow-2xs">
            {displayName} {user?.payCode ? `(${user.payCode})` : ''}
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

      <div className="w-full max-w-4xl flex flex-col items-center justify-center my-auto">
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

        {/* 2 Employee Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
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
                      <IconComponent className="w-5 h-5 stroke-[2] text-[#2563eb]" />
                    </div>

                    {/* Badge */}
                    <span className="inline-flex items-center text-xs font-semibold text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#137333] mr-1.5" />
                      {m.badgeText}
                    </span>
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
                  <button
                    type="button"
                    onClick={m.onClick}
                    className="w-full py-3 px-4 bg-[#0d254c] hover:bg-[#153466] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>{m.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
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
