import React, { useState } from 'react'
import { dummyMatches } from '../../data/dummyMatches'

export default function MatchesPage() {
  const [filter, setFilter] = useState('All')
  const matches = dummyMatches.filter(m =>
    filter === 'All' ? true : m.status === filter
  )

  return (
    <div className="flex space-x-6">
      <aside className="w-1/4 bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Status</h4>
        {['All', 'Pending', 'In-Progress', 'Submitted', 'Validated'].map(s => (
          <div key={s} className="mb-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value={s}
                checked={filter === s}
                onChange={() => setFilter(s)}
                className="mr-2"
              />
              {s}
            </label>
          </div>
        ))}
      </aside>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl">Matches</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            New Match
          </button>
        </div>
        {matches.map(m => (
          <div
            key={m.id}
            className="flex justify-between items-center bg-white p-4 rounded shadow"
          >
            <div>
              #{m.id} – {m.title}
            </div>
            <button className="px-3 py-1 bg-green-600 text-white rounded">
              Assign
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
