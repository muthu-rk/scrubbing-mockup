// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-200 ${
      isActive ? 'bg-gray-300 font-semibold' : ''
    }`;

  return (
    <aside className="w-64 bg-gray-100 h-screen p-6 flex flex-col">
      <div className="mb-6 text-2xl font-bold text-center">Logo</div>
      <nav className="flex-1 space-y-2">
        <NavLink to="/annotation" end className={linkClasses}>
          Dashboard
        </NavLink>
        <NavLink to="/annotation/history" className={linkClasses}>
          History
        </NavLink>
        <NavLink to="/annotation/profile" className={linkClasses}>
          Profile
        </NavLink>
        <button
          onClick={() => alert('Logging out…')}
          className="w-full text-left px-4 py-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
