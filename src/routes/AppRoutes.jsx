import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, isEmployee } from '@/features/auth/utils/authStorage.js'

// Auth Pages
import Login from '@/features/auth/pages/Login.jsx'

// Home Portal
import HomePage from '@/pages/HomePage/index.jsx'

// Employee Feature Pages
import EmployeePage from '@/features/employee/pages/EmployeePage.jsx'
import PastQuestionPapers from '@/features/employee/pages/PastQuestionPapers.jsx'
import UpcomingQuestionPapers from '@/features/employee/pages/UpcomingQuestionPapers.jsx'

// Section 1: Dashboard Feature Pages
import Dashboard from '@/features/dashboard/pages/Dashboard.jsx'
import Attendance from '@/features/dashboard/pages/Attendance.jsx'
import Requirement from '@/features/dashboard/pages/Requirement.jsx'

// Section 2: LMS Layout & Feature Pages
import LMSLayout from '@/layouts/LMSLayout.jsx'
import LMSDashboard from '@/features/lms/pages/LMSDashboard.jsx'
import LMS from '@/features/lms/pages/LMS.jsx'
import PlantPage from '@/features/lms/pages/PlantPage.jsx'
import DepartmentPage from '@/features/lms/pages/Department.jsx'
import SectionPage from '@/features/lms/pages/SectionPage.jsx'
import LinesPage from '@/features/lms/pages/LinesPage.jsx'
import MachinePage from '@/features/lms/pages/MachinePage.jsx'
import UsersPage from '@/features/lms/pages/UsersPage.jsx'
import UserProfile from '@/features/lms/pages/UserProfile.jsx'
import Roles from '@/features/lms/pages/Roles.jsx'
import OperatorsPage from '@/features/lms/pages/OperatorsPage.jsx'
import OperatorProfile from '@/features/lms/pages/OperatorProfile.jsx'
import OperatorObservancePage from '@/features/lms/pages/OperatorObservancePage.jsx'
import TrainingEffectivenessPage from '@/features/lms/pages/TrainingEffectivenessPage.jsx'
import L0 from '@/features/lms/pages/L0.jsx'
import L0Editor from '@/features/lms/pages/L0Editor.jsx'
import L0Preview from '@/features/lms/pages/L0Preview.jsx'
import L1 from '@/features/lms/pages/L1.jsx'
import L1Editor from '@/features/lms/pages/L1Editor.jsx'
import L1Preview from '@/features/lms/pages/L1Preview.jsx'
import SavedPaperPreview from '@/features/lms/pages/SavedPaperPreview.jsx'

// Section 3: CMS Layout & Feature Pages
import CMSLayout from '@/layouts/CMSLayout.jsx'
import ManRelatedDefects from '@/features/cms/pages/ManRelatedDefects.jsx'
import TotalDefects from '@/features/cms/pages/TotalDefects.jsx'

// Admin Route Guard: redirects unauthenticated users to /login, and employees to /employee
function AdminProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (isEmployee()) {
    return <Navigate to="/employee" replace />
  }
  return <Outlet />
}

// Employee Route Guard: redirects unauthenticated users to /login, and non-employees to /home
function EmployeeProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!isEmployee()) {
    return <Navigate to="/home" replace />
  }
  return <Outlet />
}

// Public-only route: redirects authenticated users to their corresponding page
function PublicRoute({ children }) {
  if (isAuthenticated()) {
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
  if (isEmployee()) {
    return <Navigate to="/employee" replace />
  }
  return <HomePage />
}

export default function AppRoutes() {
  return (
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

      {/* Employee Protected Routes */}
      <Route element={<EmployeeProtectedRoute />}>
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/employee/past-papers" element={<PastQuestionPapers />} />
        <Route path="/employee/upcoming-papers" element={<UpcomingQuestionPapers />} />
        <Route path="/employee/*" element={<Navigate to="/employee" replace />} />
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
          <Route path="l0" element={<L0 />} />
          <Route path="l0/editor" element={<L0Editor />} />
          <Route path="l0/preview" element={<L0Preview />} />
          <Route path="l1" element={<L1 />} />
          <Route path="l1/editor" element={<L1Editor />} />
          <Route path="l1/preview" element={<L1Preview />} />
          <Route path="paper/preview/:id" element={<SavedPaperPreview />} />

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
  )
}
