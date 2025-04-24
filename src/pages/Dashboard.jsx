// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import matches from '../data/dummyMatches.json';

export default function Dashboard() {
  const nav = useNavigate();
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Annotator Dashboard</h1>
          <button className="relative">
            🔔<span className="absolute -top-1 -right-1 text-xs bg-red-500 rounded-full px-1 text-white">3</span>
          </button>
        </header>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search matches…"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => nav(`/annotation/${m.id}`)}
            >
              <span>Match #{m.id} – {m.title}</span>
              <button className="text-blue-600 underline">Open</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
