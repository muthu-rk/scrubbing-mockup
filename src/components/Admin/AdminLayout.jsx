import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '', label: 'Dashboard' },
  { to: 'matches', label: 'Matches' },
  { to: 'users', label: 'Users' },
  { to: 'review', label: 'Review & Export' },
]

export default function AdminLayout() {
  const nav = useNavigate()
  return (
    <div className="h-screen flex">
      <aside className="w-60 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-xl mb-6">Admin</h2>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded mb-1 ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
        <button
          className="mt-auto px-3 py-2 bg-red-600 rounded hover:bg-red-700"
          onClick={() => nav('/')}
        >
          Logout
        </button>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <div className="font-bold text-lg">Admin Dashboard</div>
          <div className="flex items-center space-x-4">
            <button>🔔</button>
            <div className="cursor-pointer">Profile</div>
          </div>
        </header>
        <main className="p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
