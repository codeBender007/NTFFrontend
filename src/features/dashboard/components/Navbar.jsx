import React from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  return (
    <header className="bg-[#0b295c] text-white px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md border-b border-[#082046] sticky top-0 z-50 h-[53px]">
      {/* Left: Mobile hamburger menu & Brand logo */}
      <div className="flex items-center space-x-2.5">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 -ml-1 text-sky-200 hover:text-white hover:bg-white/10 active:scale-95 rounded-lg transition-all cursor-pointer focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}

        {/* NTF Serif Logo */}
        <Link
          to="/"
          className="flex items-center justify-center border-y-2 border-white/90 px-2 py-0.5 tracking-[0.2em] transition-opacity hover:opacity-90 active:scale-95 text-white no-underline"
          title="Return to Home Portal"
        >
          <span className="font-serif-logo text-xl font-bold tracking-widest text-white select-none">
            NTF
          </span>
        </Link>
      </div>
    </header>
  )
}
