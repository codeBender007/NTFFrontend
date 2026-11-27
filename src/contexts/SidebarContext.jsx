import React, { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggleCollapsed: () => {},
})

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', String(isCollapsed))
    } catch {
      // Ignore storage errors
    }
  }, [isCollapsed])

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleCollapsed: () => {},
    }
  }
  return context
}

export default SidebarContext
