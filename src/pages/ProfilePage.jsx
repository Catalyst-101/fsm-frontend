import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Profile picture state
  const [file, setFile] = useState(null);
  const [picMsg, setPicMsg] = useState('');
  const [picErr, setPicErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      await api.patch('/auth/profile', { name });
      setProfileMsg('Profile updated successfully.');
      refreshUser();
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordErr(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleUploadPicture = async (e) => {
    e.preventDefault();
    if (!file) return;
    setPicMsg('');
    setPicErr('');
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      await api.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPicMsg('Profile picture uploaded successfully.');
      refreshUser();
    } catch (err) {
      setPicErr(err.response?.data?.message || 'Failed to upload profile picture.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex items-center gap-6">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-indigo-900 text-indigo-200 border-2 border-indigo-500 flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form 1: Update Profile Name */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-semibold text-white">Update Name</h3>
          {profileMsg && <div className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg">{profileMsg}</div>}
          {profileErr && <div className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-lg">{profileErr}</div>}
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-all cursor-pointer">
              Save Name
            </button>
          </form>
        </div>

        {/* Form 2: Profile Picture Upload */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-semibold text-white">Upload Avatar</h3>
          {picMsg && <div className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg">{picMsg}</div>}
          {picErr && <div className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-lg">{picErr}</div>}
          <form onSubmit={handleUploadPicture} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-all cursor-pointer">
              Upload Image
            </button>
          </form>
        </div>

        {/* Form 3: Change Password */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-semibold text-white">Change Password</h3>
          {passwordMsg && <div className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg">{passwordMsg}</div>}
          {passwordErr && <div className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-lg">{passwordErr}</div>}
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-all cursor-pointer">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
