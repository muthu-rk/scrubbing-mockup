import React from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyMatches } from '../../data/dummyMatches'
import { dummyActivities as activities } from '../../data/dummyActivities'

export default function DashboardPage() {
  const nav = useNavigate()
  // derive stats
  const stats = {
    Pending: dummyMatches.filter(m => m.status === 'Pending').length,
    'In-Progress': dummyMatches.filter(m => m.status === 'In-Progress').length,
    Submitted: dummyMatches.filter(m => m.status === 'Submitted').length,
    Validated: dummyMatches.filter(m => m.status === 'Validated').length,
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stats).map(([label, count]) => (
          <div
            key={label}
            onClick={() => nav('/admin/matches')}
            className="p-4 bg-white rounded shadow cursor-pointer hover:shadow-md"
          >
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold">{count}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <ul className="bg-white rounded shadow divide-y">
          {activities.map((msg, i) => (
            <li key={i} className="p-3 hover:bg-gray-100">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
