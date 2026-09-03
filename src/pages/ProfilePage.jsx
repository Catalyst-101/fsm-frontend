import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex items-center gap-6">
        <div className="relative">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL}${user.profilePicture}`}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-primary)] shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--color-secondary)] text-white border-4 border-white shadow-md flex items-center justify-center font-bold text-4xl">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">{user?.name}</h2>
          <p className="text-sm font-medium text-gray-500 mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">mail</span> {user?.email}
          </p>
          <span className="inline-block mt-3 px-3 py-1 text-xs font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form 1: Update Profile Name */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-gray-100 pb-2">Update Name</h3>
          {profileMsg && <div className="text-sm bg-green-50 border-l-4 border-green-500 text-green-700 p-3 flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span> <span>{profileMsg}</span></div>}
          {profileErr && <div className="text-sm bg-red-50 border-l-4 border-red-500 text-red-700 p-3 flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">error</span> <span>{profileErr}</span></div>}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <InputField
              label="Display Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              icon="badge"
            />
            <Button type="submit" variant="primary" className="w-full">
              Save Name
            </Button>
          </form>
        </div>

        {/* Form 2: Profile Picture Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-gray-100 pb-2">Upload Avatar</h3>
          {picMsg && <div className="text-sm bg-green-50 border-l-4 border-green-500 text-green-700 p-3 flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span> <span>{picMsg}</span></div>}
          {picErr && <div className="text-sm bg-red-50 border-l-4 border-red-500 text-red-700 p-3 flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">error</span> <span>{picErr}</span></div>}
          <form onSubmit={handleUploadPicture} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-secondary)] cursor-pointer transition-all"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Upload Image
            </Button>
          </form>
        </div>

        {/* Form 3: Change Password */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-gray-100 pb-2">Change Password</h3>
          {passwordMsg && <div className="text-sm bg-green-50 border-l-4 border-green-500 text-green-700 p-3 flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span> <span>{passwordMsg}</span></div>}
          {passwordErr && <div className="text-sm bg-red-50 border-l-4 border-red-500 text-red-700 p-3 flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">error</span> <span>{passwordErr}</span></div>}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <InputField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              icon="lock"
            />
            <InputField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              icon="key"
            />
            <Button type="submit" variant="primary" className="w-full">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
