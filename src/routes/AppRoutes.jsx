import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, isEmployee, isSupervisor } from '@/features/auth/utils/authStorage.js'

// Auth Pages (Eagerly loaded for instant login performance)
import Login from '@/features/auth/pages/Login.jsx'

// Route-level loading spinner for on-demand lazy chunks
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500 tracking-tight">Loading page...</span>
    </div>
  </div>
)

// Code-split all post-login pages so the initial login bundle loads instantly
// Home Portal
const HomePage = lazy(() => import('@/pages/HomePage/index.jsx'))

// Supervisor Layout & Feature Pages
const SupervisorLayout = lazy(() => import('@/layouts/SupervisorLayout.jsx'))
const SupervisorPage = lazy(() => import('@/features/supervisor/pages/SupervisorPage.jsx'))

// Employee Layout & Feature Pages
const EmployeeLayout = lazy(() => import('@/layouts/EmployeeLayout.jsx'))
const PastQuestionPapers = lazy(() => import('@/features/employee/pages/PastQuestionPapers.jsx'))
const UpcomingQuestionPapers = lazy(() => import('@/features/employee/pages/UpcomingQuestionPapers.jsx'))

// Section 1: Dashboard Feature Pages
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard.jsx'))
const Attendance = lazy(() => import('@/features/dashboard/pages/Attendance.jsx'))
const Requirement = lazy(() => import('@/features/dashboard/pages/Requirement.jsx'))

// Section 2: LMS Layout & Feature Pages
const LMSLayout = lazy(() => import('@/layouts/LMSLayout.jsx'))
const LMSDashboard = lazy(() => import('@/features/lms/pages/LMSDashboard.jsx'))
const LMS = lazy(() => import('@/features/lms/pages/LMS.jsx'))
const PlantPage = lazy(() => import('@/features/lms/pages/PlantPage.jsx'))
const DepartmentPage = lazy(() => import('@/features/lms/pages/Department.jsx'))
const SectionPage = lazy(() => import('@/features/lms/pages/SectionPage.jsx'))
const LinesPage = lazy(() => import('@/features/lms/pages/LinesPage.jsx'))
const MachinePage = lazy(() => import('@/features/lms/pages/MachinePage.jsx'))
const UsersPage = lazy(() => import('@/features/lms/pages/UsersPage.jsx'))
const UserProfile = lazy(() => import('@/features/lms/pages/UserProfile.jsx'))
const Roles = lazy(() => import('@/features/lms/pages/Roles.jsx'))
const OperatorsPage = lazy(() => import('@/features/lms/pages/OperatorsPage.jsx'))
const OperatorProfile = lazy(() => import('@/features/lms/pages/OperatorProfile.jsx'))
const OperatorObservancePage = lazy(() => import('@/features/lms/pages/OperatorObservancePage.jsx'))
const TrainingEffectivenessPage = lazy(() => import('@/features/lms/pages/TrainingEffectivenessPage.jsx'))
const L0 = lazy(() => import('@/features/lms/pages/L0.jsx'))
const L0Editor = lazy(() => import('@/features/lms/pages/L0Editor.jsx'))
const L0Preview = lazy(() => import('@/features/lms/pages/L0Preview.jsx'))
const L1 = lazy(() => import('@/features/lms/pages/L1.jsx'))
const L1Editor = lazy(() => import('@/features/lms/pages/L1Editor.jsx'))
const L1Preview = lazy(() => import('@/features/lms/pages/L1Preview.jsx'))
const SavedPaperPreview = lazy(() => import('@/features/lms/pages/SavedPaperPreview.jsx'))
const EditQuestionPaper = lazy(() => import('@/features/lms/pages/EditQuestionPaper.jsx'))

// Section 3: CMS Layout & Feature Pages
const CMSLayout = lazy(() => import('@/layouts/CMSLayout.jsx'))
const ManRelatedDefects = lazy(() => import('@/features/cms/pages/ManRelatedDefects.jsx'))
const TotalDefects = lazy(() => import('@/features/cms/pages/TotalDefects.jsx'))

// Admin Route Guard: redirects unauthenticated users to /login, employees to /employee, supervisors to /supervisor
function AdminProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (isSupervisor()) {
    return <Navigate to="/supervisor" replace />
  }
  if (isEmployee()) {
    return <Navigate to="/employee" replace />
  }
  return <Outlet />
}

// Employee Route Guard: redirects unauthenticated users to /login, supervisors to /supervisor, non-employees to /home
function EmployeeProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (isSupervisor()) {
    return <Navigate to="/supervisor" replace />
  }
  if (!isEmployee()) {
    return <Navigate to="/home" replace />
  }
  return <Outlet />
}

// Supervisor Route Guard: redirects unauthenticated users to /login, employees to /employee, admins to /home
function SupervisorProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!isSupervisor()) {
    if (isEmployee()) {
      return <Navigate to="/employee" replace />
    }
    return <Navigate to="/home" replace />
  }
  return <Outlet />
}

// Public-only route: redirects authenticated users to their corresponding page
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    if (isSupervisor()) {
      return <Navigate to="/supervisor" replace />
    }
    if (isEmployee()) {
      return <Navigate to="/employee" replace />
    }
    return <Navigate to="/home" replace />
  }
  return children
}

// Root Route handler: routes authenticated users based on role
function RootRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (isSupervisor()) {
    return <Navigate to="/supervisor" replace />
  }
  if (isEmployee()) {
    return <Navigate to="/employee" replace />
  }
  return <HomePage />
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root Route */}
        <Route path="/" element={<RootRoute />} />

        {/* Public Route: Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Supervisor Protected Routes with persistent Sidebar + Navbar */}
        <Route element={<SupervisorProtectedRoute />}>
          <Route path="/supervisor" element={<SupervisorLayout />}>
            <Route index element={<Navigate to="/supervisor/create" replace />} />
            <Route path="create" element={<SupervisorPage mode="create" />} />
            <Route path="edit/:id" element={<SupervisorPage mode="edit" />} />
            <Route path="saved-papers" element={<SupervisorPage mode="list" />} />
            <Route path="preview/:id" element={<SupervisorPage mode="preview" />} />
            <Route path="assign-operators" element={<SupervisorPage mode="assign" />} />
            <Route path="submitted-papers" element={<SupervisorPage mode="submitted" />} />
            <Route path="*" element={<Navigate to="/supervisor/create" replace />} />
          </Route>
        </Route>

        {/* Employee Protected Routes with persistent Sidebar + Navbar */}
        <Route element={<EmployeeProtectedRoute />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="/employee/upcoming-papers" replace />} />
            <Route path="upcoming-papers" element={<UpcomingQuestionPapers />} />
            <Route path="past-papers" element={<PastQuestionPapers />} />
            <Route path="*" element={<Navigate to="/employee/upcoming-papers" replace />} />
          </Route>
        </Route>

        {/* Protected Routes (Admin - Requires valid authentication) */}
        <Route element={<AdminProtectedRoute />}>
          {/* Home Portal */}
          <Route path="/home" element={<HomePage />} />

          {/* DOJO 2.0 Dashboard Feature Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/requirement" element={<Requirement />} />

          {/* LMS Module Parent Route with LMSLayout */}
          <Route path="/lms" element={<LMSLayout />}>
            <Route index element={<Navigate to="/lms/dashboard" replace />} />
            <Route path="dashboard" element={<LMSDashboard />} />
            <Route path="dojo-hiring" element={<LMS />} />
            <Route path="plant" element={<PlantPage />} />
            <Route path="plant/:plantId/department" element={<DepartmentPage />} />
            <Route path="plant/:plantId/department/:deptId/subdepartment" element={<SectionPage />} />
            <Route path="plant/:plantId/department/:deptId/subdepartment/:subDeptId/line" element={<LinesPage />} />
            <Route path="plant/:plantId/department/:deptId/subdepartment/:subDeptId/line/:lineId/machine" element={<MachinePage />} />

            {/* Legacy Plant-less Hierarchy Routes */}
            <Route path="department" element={<DepartmentPage />} />
            <Route path="subdepartment/:deptId" element={<SectionPage />} />
            <Route path="line/:deptId/:subDeptId" element={<LinesPage />} />
            <Route path="machine/:deptId/:subDeptId/:lineId" element={<MachinePage />} />

            {/* Operator and Observance Routes */}
            <Route path="operators" element={<OperatorsPage />} />
            <Route path="operator/:id" element={<OperatorProfile />} />
            <Route path="operator-observance" element={<OperatorObservancePage />} />

            {/* User Management and Profiles */}
            <Route path="users" element={<UsersPage />} />
            <Route path="user/:id" element={<UserProfile />} />

            {/* Roles & Permissions */}
            <Route path="roles" element={<Roles />} />

            {/* Training Effectiveness */}
            <Route path="training" element={<TrainingEffectivenessPage />} />

            {/* Examination & Question Paper Routes */}
            <Route path="day-1" element={<L0 />} />
            <Route path="day-2" element={<L1 />} />
            <Route path="l0" element={<L0 />} />
            <Route path="l0/editor" element={<L0Editor />} />
            <Route path="l0/preview" element={<L0Preview />} />
            <Route path="l1" element={<L1 />} />
            <Route path="l1/editor" element={<L1Editor />} />
            <Route path="l1/preview" element={<L1Preview />} />
            <Route path="paper/preview/:id" element={<SavedPaperPreview />} />
            <Route path="paper/edit/:id" element={<EditQuestionPaper />} />

            {/* Catch-all for unmapped /lms/* paths */}
            <Route path="*" element={<Navigate to="/lms/dashboard" replace />} />
          </Route>

          {/* CMS Module Parent Route with CMSLayout */}
          <Route path="/cms" element={<CMSLayout />}>
            <Route index element={<Navigate to="/cms/man-related-defects" replace />} />
            <Route path="man-related-defects" element={<ManRelatedDefects />} />
            <Route path="total-defects" element={<TotalDefects />} />
            <Route path="*" element={<Navigate to="/cms/man-related-defects" replace />} />
          </Route>
        </Route>

        {/* Global Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
