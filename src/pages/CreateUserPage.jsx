import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

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
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Create User Wizard</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">3-Step Pending OTP User Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider justify-center">
          <span className={`px-4 py-1.5 rounded-full border transition-all ${step === 1 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            1. Details
          </span>
          <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
          <span className={`px-4 py-1.5 rounded-full border transition-all ${step === 2 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            2. OTP Verify
          </span>
          <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
          <span className={`px-4 py-1.5 rounded-full border transition-all ${step === 3 ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            3. Complete
          </span>
        </div>

        {infoMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg text-sm flex items-start gap-2 font-medium">
            <span className="material-symbols-outlined text-[20px] text-green-500">info</span>
            <span>{infoMsg}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm flex items-start gap-2 font-medium">
            <span className="material-symbols-outlined text-[20px] text-red-500">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <form onSubmit={handleInitiate} className="space-y-5">
            <InputField
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              icon="person"
            />
            
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              icon="mail"
            />
            
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium"
              >
                {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">ADMIN</option>}
                <option value="ACCOUNTANT">ACCOUNTANT</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-base shadow-md"
              >
                {submitting ? 'Initiating & Sending OTP...' : 'Send OTP to User'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 text-center font-medium">
              We have sent a verification code to:<br/>
              <span className="font-bold text-[var(--color-primary)] text-lg mt-1 block">{email}</span>
            </div>
            
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2 text-center">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-4 text-[var(--color-primary)] font-mono text-2xl font-bold tracking-[1em] text-center focus:outline-none focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)] transition-all shadow-inner"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-base shadow-md"
              >
                {submitting ? 'Verifying OTP...' : 'Verify OTP & Create Account'}
              </Button>
            </form>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={handleResendOTP}
                className="flex-1"
              >
                Resend OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPending}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                Cancel Process
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete */}
        {step === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
               <span className="material-symbols-outlined text-4xl">check</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Account Created!</h3>
              <p className="text-sm font-medium text-gray-500 mt-2">The user account has been successfully saved in the database.</p>
            </div>
            
            {createdUserData?.tempPassword && (
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl mt-6">
                <span className="text-blue-600 font-bold uppercase tracking-wider text-xs block mb-3 flex items-center justify-center gap-1">
                   <span className="material-symbols-outlined text-[16px]">visibility</span> Temporary Password
                </span>
                <code className="bg-white border border-blue-200 px-6 py-3 rounded-lg text-blue-800 font-mono font-bold text-xl select-all shadow-inner block">
                  {createdUserData.tempPassword}
                </code>
                <p className="text-xs text-blue-500 font-medium mt-3">Please provide this password to the user. They will be required to change it upon first login.</p>
              </div>
            )}
            
            <div className="pt-6">
              <Button
                onClick={() => navigate('/users')}
                className="w-full py-4 shadow-md"
              >
                Return to Users List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUserPage;
