// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

// top-level selector
import SelectionPage from './components/SelectionPage'

// your existing annotation pages
import Dashboard from './pages/Dashboard'       // Annotator’s “home” dashboard
import History from './pages/History'           // Annotator’s history
import Profile from './pages/Profile'           // Annotator’s profile
import Annotation from './pages/Annotation'     // Single-match scrub view

// admin dashboard pages (you should have these under src/components/Admin)
import AdminLayout from './components/Admin/AdminLayout'
import DashboardPage from './components/Admin/DashboardPage'
import MatchesPage from './components/Admin/MatchesPage'
import UsersPage from './components/Admin/UsersPage'
import ReviewExportPage from './components/Admin/ReviewExportPage'

export default function App() {
  return (
    <Routes>

      {/* 1) initial selector */}
      <Route path="/" element={<SelectionPage />} />

      {/* 2) annotation “app” */}
      <Route path="/annotation">
        <Route index element={<Dashboard />} />                   {/* /annotation */}
        <Route path="history" element={<History />} />            {/* /annotation/history */}
        <Route path="profile" element={<Profile />} />            {/* /annotation/profile */}
        <Route path=":id" element={<Annotation />} />             {/* /annotation/23 */}
      </Route>

      {/* 3) admin “app” */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />               {/* /admin */}
        <Route path="matches" element={<MatchesPage />} />        {/* /admin/matches */}
        <Route path="users" element={<UsersPage />} />            {/* /admin/users */}
        <Route path="review" element={<ReviewExportPage />} />    {/* /admin/review */}
      </Route>

      {/* 4) fallback */}
      <Route
        path="*"
        element={
          <p className="p-6">
            Page not found. <a href="/">Go Home</a>
          </p>
        }
      />
    </Routes>
  )
}
