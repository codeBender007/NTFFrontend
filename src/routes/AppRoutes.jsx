import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '@/features/auth/utils/authStorage.js'

// Auth Pages
import Login from '@/features/auth/pages/Login.jsx'

// Home Portal
import HomePage from '@/pages/HomePage/index.jsx'

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

// Guard component: redirects unauthenticated users to /login
function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// Public-only route: redirects authenticated users to /home
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />
  }
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route: Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes (Requires valid authentication) */}
      <Route element={<ProtectedRoute />}>
        {/* Home Portal */}
        <Route path="/" element={<HomePage />} />
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

        {/* CMS Routes (Placeholder redirect) */}
        <Route path="/cms/*" element={<Navigate to="/home" replace />} />
      </Route>

      {/* Global Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
