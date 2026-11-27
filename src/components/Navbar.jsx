import React, { useContext } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { InLMSLayoutContext } from '@/layouts/LMSLayoutContext.js'
import { useSidebar } from '@/contexts/SidebarContext.jsx'
import { getUser, clearSession } from '@/features/auth/utils/authStorage.js'
import { lmsMenus } from '@/features/lms/data/LMSMenu.jsx'

export default function Navbar({ onToggleSidebar, isSidebarOpen, title, children }) {
  const isInsideLayout = useContext(InLMSLayoutContext)
  const { isCollapsed } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  // Prevent duplicate rendering inside nested LMS layouts
  if (isInsideLayout) {
    return null
  }

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  // Derive page title if not explicitly provided
  const getPageTitle = () => {
    if (title) return title
    const path = location.pathname

    // 1. LMS: Display the exact menu name matching the currently active LMS page
    if (path.startsWith('/lms')) {
      const matched = lmsMenus.find((item) => {
        if (!item.path || item.path === '#' || item.path === '/home') return false
        if (path === item.path || path.startsWith(`${item.path}/`)) return true
        if (Array.isArray(item.nestedPaths)) {
          return item.nestedPaths.some(
            (p) => path === p || path.startsWith(`${p}/`)
          )
        }
        return false
      })

      if (matched) {
        return matched.label || matched.name
      }

      // Hierarchy fallbacks if path doesn't directly prefix
      if (path.includes('/lms/dojo-hiring') || path.includes('/lms/l0') || path.includes('/lms/l1') || path.includes('/lms/paper')) {
        return 'DOJO Hiring'
      }
      if (
        path.includes('/lms/plant') ||
        path.includes('/lms/department') ||
        path.includes('/lms/subdepartment') ||
        path.includes('/lms/line') ||
        path.includes('/lms/machine')
      ) {
        return 'Plant'
      }
      if (
        path.includes('/lms/operator-observance') ||
        path.includes('/lms/operators') ||
        path.includes('/lms/operator')
      ) {
        return '10 Cycle Operator'
      }
      if (path.includes('/lms/users') || path.includes('/lms/user')) {
        return 'Users'
      }
      if (path.includes('/lms/roles')) {
        return 'Roles & Permissions'
      }
      if (path.includes('/lms/training')) {
        return 'Training Effectiveness'
      }
      if (path.includes('/lms/dashboard')) {
        return 'Overview'
      }
      return 'Overview'
    }

    // 2. DOJO 2.0 Dashboard Feature pages
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/attendance')) return 'Attendance'
    if (path.includes('/requirement')) return 'Requirement'

    // 3. CMS Feature pages
    if (path.includes('/cms/man-related-defects')) return 'Man Related Defects'
    if (path.includes('/cms/total-defects')) return 'Total Defects'
    if (path.includes('/cms')) return 'CMS'

    return 'Dashboard'
  }

  const displayName =
    user?.username || user?.payCode || user?.name || user?.empName || 'ADMIN-001'
  const displayRole = user?.role || 'Administrator'

  return (
    <header
      className={`bg-white border-b border-slate-200/80 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
        isCollapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-60'
      }`}
    >
      {/* Left side: Mobile menu toggle & Page title */}
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}

        <h1 className="text-lg sm:text-xl font-bold text-[#0f1f38] tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: User Profile info & Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {children}

        {/* User Profile Block */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
            <User className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs sm:text-sm font-bold text-[#0f1f38] leading-tight">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-500 font-normal leading-tight">
              {displayRole}
            </div>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2] text-slate-700" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
