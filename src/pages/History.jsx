// src/pages/History.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import history from '../data/dummyHistory.json';

export default function History() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">My History</h1>
        <ul className="space-y-4">
          {history.map((entry) => (
            <li key={entry.matchId} className="p-4 border rounded flex justify-between items-center">
              <div>
                <p><strong>Match #{entry.matchId}</strong> – {entry.date}</p>
                <p className="text-sm text-gray-600">Status: {entry.status}</p>
              </div>
              {entry.status === 'rejected' && (
                <button
                  className="text-red-600 underline"
                  onClick={() => alert(`Reopen match ${entry.matchId}`)}
                >
                  Reopen
                </button>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
