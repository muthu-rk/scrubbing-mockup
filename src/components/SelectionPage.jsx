import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function SelectionPage() {
  const nav = useNavigate()
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-gray-50">
      <h1 className="text-3xl font-bold">Welcome to Scrubbing</h1>
      <div className="space-x-4">
        <button
          onClick={() => nav('/annotation')}
          className="px-6 py-3 bg-blue-600 text-white rounded shadow"
        >
          Annotation Dashboard
        </button>
        <button
          onClick={() => nav('/admin')}
          className="px-6 py-3 bg-green-600 text-white rounded shadow"
        >
          Admin Dashboard
        </button>
      </div>
    </div>
  )
}
