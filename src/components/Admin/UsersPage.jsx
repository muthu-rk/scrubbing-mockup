import React from 'react'
import { dummyUsers } from '../../data/dummyUsers'

export default function UsersPage() {
  return (
    <div className="bg-white p-4 rounded shadow overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl">Users</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Invite User
        </button>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dummyUsers.map((u, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2">{u.name}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">
                <select defaultValue={u.role} className="border rounded px-2 py-1">
                  {['Annotator', 'Admin', 'Reviewer', 'Viewer'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">{u.status}</td>
              <td className="px-3 py-2">
                <button className="px-2 py-1 bg-red-500 text-white rounded">
                  {u.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
