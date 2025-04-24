// src/pages/Profile.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import profile from '../data/dummyProfile.json';

export default function Profile() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={profile.avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <p className="text-xl">{profile.name}</p>
            <p className="text-gray-600">{profile.email}</p>
            <p>Role: {profile.role}</p>
            <p>Joined: {new Date(profile.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Preferences</h2>
          <p>Notifications: {profile.preferences.notifications ? 'On' : 'Off'}</p>
          <p>Items per page: {profile.preferences.itemsPerPage}</p>
        </div>
      </main>
    </div>
  );
}
