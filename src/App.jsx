import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { BASE_URL } from './config.js'
import AppRoutes from './routes/AppRoutes.jsx'
import { SidebarProvider } from './contexts/SidebarContext.jsx'

function App() {
  return (
    <BrowserRouter basename={BASE_URL || undefined}>
      <SidebarProvider>
        <AppRoutes />
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
