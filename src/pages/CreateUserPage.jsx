import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Wizard Step: 1 = Initiate, 2 = Verify OTP, 3 = Complete
  const [step, setStep] = useState(1);

  // Step 1 Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Admin can ONLY create ACCOUNTANT
  const [role, setRole] = useState(currentUser?.role === 'ADMIN' ? 'ACCOUNTANT' : 'ADMIN');

  // Step 2 Form fields
  const [otp, setOtp] = useState('');

  // Result messages
  const [infoMsg, setInfoMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);

  // Step 1: Initiate User Creation
  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setSubmitting(true);
    try {
      const res = await api.post('/users/create', { name, email, role });
      setInfoMsg(res.data.message || 'OTP sent to email. Please verify OTP.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate user creation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setSubmitting(true);
    try {
      const res = await api.post('/users/verify-otp', { email, otp });
      setCreatedUserData(res.data.data);
      setInfoMsg('User verified and created successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 Action: Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setInfoMsg('');
    try {
      const res = await api.post('/users/resend-otp', { email });
      setInfoMsg(res.data.message || 'A new OTP has been sent to email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  // Step 1 or 2 Action: Cancel Pending User
  const handleCancelPending = async () => {
    if (!email) {
      setStep(1);
      return;
    }
    setError('');
    setInfoMsg('');
    try {
      await api.post('/users/cancel-pending', { email });
      setInfoMsg('Pending registration cancelled.');
      setStep(1);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel pending registration.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create User Wizard</h2>
          <p className="text-sm text-slate-400">3-Step Pending OTP User Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            1. Details
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            2. OTP Verify
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            3. Complete
          </span>
        </div>

        {infoMsg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg">{infoMsg}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

        {/* STEP 1: Details */}
        {step === 1 && (
          <form onSubmit={handleInitiate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">ADMIN</option>}
                <option value="ACCOUNTANT">ACCOUNTANT</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Initiating & Sending OTP...' : 'Send OTP to User'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300">
              OTP sent to: <span className="font-semibold text-white">{email}</span>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono text-lg tracking-widest text-center focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Verifying OTP...' : 'Verify OTP & Create Account'}
              </button>
            </form>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResendOTP}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={handleCancelPending}
                className="flex-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer"
              >
                Cancel Process
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">Account Created!</h3>
            <p className="text-xs text-slate-400">User account has been saved in the database.</p>
            {createdUserData?.tempPassword && (
              <div className="p-3 bg-slate-900 border border-indigo-500/40 rounded-lg text-xs">
                <span className="text-slate-400 block mb-1">Temporary Password (dev simulation):</span>
                <code className="text-indigo-400 font-mono font-bold text-sm select-all">{createdUserData.tempPassword}</code>
              </div>
            )}
            <button
              onClick={() => navigate('/users')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
            >
              Return to Users List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUserPage;
