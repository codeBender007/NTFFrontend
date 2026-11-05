import { LayoutGrid, LayoutDashboard, UserCheck, ClipboardList } from 'lucide-react'

export const dashboardMenu = [
  { id: 'Home', label: 'Home Portal', icon: LayoutGrid, path: '/' },
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'Attendance', label: 'Attendance', icon: UserCheck, path: '/attendance' },
  { id: 'Requirement', label: 'Requirement', icon: ClipboardList, path: '/requirement' },
]

export default dashboardMenu

