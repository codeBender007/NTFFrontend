import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Dashboard.jsx'
import Attendance from './Pages/Attendance.jsx'
import Requirement from './Pages/Requirement.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/requirement" element={<Requirement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App