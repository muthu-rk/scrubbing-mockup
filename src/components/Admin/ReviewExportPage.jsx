import React, { useState } from 'react'
import { dummyMatches } from '../../data/dummyMatches'

export default function ReviewExportPage() {
  const [items, setItems] = useState(
    dummyMatches.filter(m => m.status !== 'Pending' && m.status !== 'Validated')
  )

  const validate = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, status: 'Validated' } : i))
  }
  const reject = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, status: 'Pending' } : i))
  }

  return (
    <div className="space-y-4">
      {items.map(m => (
        <div
          key={m.id}
          className="flex justify-between items-center bg-white p-4 rounded shadow"
        >
          <div>
            #{m.id} – Submitted by Annotator – <span className="font-medium">{m.status}</span>
          </div>
          <div className="space-x-2">
            {m.status !== 'Validated' && (
              <>
                <button
                  onClick={() => validate(m.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Validate
                </button>
                <button
                  onClick={() => reject(m.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </>
            )}
            <button className="px-3 py-1 bg-blue-600 text-white rounded">
              Export
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
