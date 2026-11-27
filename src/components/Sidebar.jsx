import React, { useContext } from 'react'
import { LogOut, ChevronsLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import dashboardMenu from '@/features/dashboard/data/dashboardMenu.js'
import { InLMSLayoutContext } from '@/layouts/LMSLayoutContext.js'
import { clearSession } from '@/features/auth/utils/authStorage.js'
import { useSidebar } from '@/contexts/SidebarContext.jsx'
import ntfLogo from '@/assets/images/NTF_logo_black.png'

export default function Sidebar({
  menu = dashboardMenu,
  activeTab,
  onTabChange,
  onLogout,
  isOpen,
  onClose,
  homePath = '/home',
}) {
  const isInsideLayout = useContext(InLMSLayoutContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { isCollapsed, toggleCollapsed } = useSidebar()

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
    if (item.path && item.path !== '#') {
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200/80 flex flex-col justify-between py-3.5 z-40 overflow-y-auto select-none shadow-[2px_0_12px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20 px-2' : 'w-60 px-3'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Top Header: NTF Logo & Collapse Toggle */}
          <div className="flex items-center justify-between min-h-[58px] mb-4 px-1 border-b border-slate-100/90 pb-2.5">
            {!isCollapsed ? (
              <>
                <Link
                  to={homePath}
                  className="flex items-center"
                  title="Home"
                >
                  <img
                    src={ntfLogo}
                    alt="NTF Group Holding"
                    className="h-12 sm:h-14 w-auto max-w-[155px] object-contain mix-blend-multiply"
                  />
                </Link>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer ml-auto"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center py-1 w-full">
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="flex items-center justify-center cursor-pointer focus:outline-hidden hover:opacity-80 transition-opacity"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <img
                    src={ntfLogo}
                    alt="NTF"
                    className="h-8 sm:h-9 w-auto max-w-[56px] object-contain mix-blend-multiply"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Menu Items */}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isCurrentRoute =
                item.path === '/' || item.path === '/home'
                  ? location.pathname === '/' || location.pathname === '/home'
                  : item.path &&
                    item.path !== '#' &&
                    (location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`) ||
                      (Array.isArray(item.nestedPaths) &&
                        item.nestedPaths.some(
                          (p) =>
                            location.pathname === p ||
                            location.pathname.startsWith(`${p}/`)
                        )))
              const isActive = activeTab
                ? activeTab === item.id ||
                  activeTab === item.label ||
                  activeTab === item.name
                : isCurrentRoute

              const itemContent = (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#0284c7] stroke-[2.2]'
                        : 'text-slate-500 stroke-[1.8]'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="tracking-tight text-sm font-medium">
                        {item.label || item.name}
                      </span>
                      {item.hasChevron && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400 stroke-[2]" />
                      )}
                    </>
                  )}
                </>
              )

              const commonClasses = `w-full flex items-center transition-all cursor-pointer no-underline rounded-xl ${
                isCollapsed
                  ? 'justify-center py-2.5 px-0'
                  : 'space-x-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-[#e6f0fd] text-[#0284c7] font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 active:scale-[0.99]'
              }`

              if (item.path && item.path !== '#') {
                return (
                  <Link
                    key={item.id || item.name}
                    to={item.path}
                    onClick={() => handleNavigate(item)}
                    className={commonClasses}
                    title={isCollapsed ? item.label || item.name : undefined}
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
                  title={isCollapsed ? item.label || item.name : undefined}
                >
                  {itemContent}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-2 border-t border-slate-200/70 mt-auto">
          <button
            onClick={handleLogout}
            type="button"
            className={`w-full flex items-center transition-all cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl group ${
              isCollapsed
                ? 'justify-center py-2.5 px-0'
                : 'space-x-3 px-3 py-2.5 text-sm font-semibold'
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5 text-rose-500 stroke-[2.2]" />
            {!isCollapsed && <span className="tracking-tight">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
