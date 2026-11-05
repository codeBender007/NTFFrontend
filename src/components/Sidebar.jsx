import React, { useContext } from 'react'
import { LogOut } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import dashboardMenu from '@/features/dashboard/data/dashboardMenu.js'
import { InLMSLayoutContext } from '@/layouts/LMSLayoutContext.js'
import { clearSession } from '@/features/auth/utils/authStorage.js'

export default function Sidebar({
  menu = dashboardMenu,
  activeTab,
  onTabChange,
  onLogout,
  isOpen,
  onClose,
}) {
  const isInsideLayout = useContext(InLMSLayoutContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Prevent duplicate sidebar rendering when inside LMSLayout outlet
  if (isInsideLayout) {
    return null
  }

  const items = menu

  const handleNavigate = (item) => {
    if (onTabChange) {
      onTabChange(item.id || item.name)
    }
    if (onClose) {
      onClose()
    }
    // If no Link was rendered or item has path and onTabChange didn't navigate, ensure navigation
    if (item.path && !item.renderAsButton) {
      // React Router Link will perform navigation, but handleNavigate guarantees close
    } else if (item.path) {
      navigate(item.path)
    }
  }

  const handleLogout = () => {
    if (onClose) {
      onClose()
    }
    if (onLogout) {
      onLogout()
    } else {
      clearSession()
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      {/* Mobile / Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-[53px] bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-[53px] bottom-0 w-56 lg:w-48 bg-white border-r border-slate-200/90 flex flex-col justify-between py-4 px-2.5 z-50 lg:z-40 overflow-y-auto select-none shadow-[4px_0_16px_rgba(0,0,0,0.08)] lg:shadow-[1px_0_3px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Top Menu Items */}
        <nav className="space-y-1.5 flex-1">
          {items.map((item) => {
            const Icon = item.icon
            const isCurrentRoute =
              item.path === '/' || item.path === '/home'
                ? location.pathname === '/' || location.pathname === '/home'
                : location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`) ||
                (Array.isArray(item.nestedPaths) &&
                  item.nestedPaths.some((p) =>
                    location.pathname === p || location.pathname.startsWith(`${p}/`)
                  ))
            const isActive = activeTab
              ? activeTab === item.id ||
              activeTab === item.label ||
              activeTab === item.name
              : isCurrentRoute

            const itemContent = (
              <>
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#0284c7] stroke-[2.2]' : 'text-slate-500'
                    }`}
                />
                <span className="tracking-tight">{item.label || item.name}</span>
              </>
            )

            const commonClasses = `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer no-underline ${isActive
              ? 'bg-[#e0f2fe] text-[#0284c7] font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]'
              }`

            if (item.path) {
              return (
                <Link
                  key={item.id || item.name}
                  to={item.path}
                  onClick={() => handleNavigate(item)}
                  className={commonClasses}
                >
                  {itemContent}
                </Link>
              )
            }

            return (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => handleNavigate(item)}
                className={commonClasses}
              >
                {itemContent}
              </button>
            )
          })}

        </nav>

        {/* Logout button at the very bottom of the sidebar */}
        <div className="pt-3 border-t border-slate-200/80 mt-auto">
          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] group"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5 text-rose-500 stroke-[2.2]" />
            <span className="tracking-tight font-semibold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
