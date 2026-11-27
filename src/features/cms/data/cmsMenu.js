import { LayoutGrid, UserX, AlertTriangle } from 'lucide-react'

export const cmsMenus = [
  {
    id: 'Home',
    name: 'Home Portal',
    label: 'Home Portal',
    icon: LayoutGrid,
    path: '/home',
    nestedPaths: ['/home'],
  },
  {
    id: 'man-related-defects',
    name: 'Man Related Defects',
    label: 'Man Related Defects',
    icon: UserX,
    path: '/cms/man-related-defects',
    nestedPaths: ['/cms/man-related-defects'],
  },
  {
    id: 'total-defects',
    name: 'Total Defects',
    label: 'Total Defects',
    icon: AlertTriangle,
    path: '/cms/total-defects',
    nestedPaths: ['/cms/total-defects'],
  },
]

export default cmsMenus
