import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { BASE_URL } from './config.js'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  return (
    <BrowserRouter basename={BASE_URL || undefined}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
