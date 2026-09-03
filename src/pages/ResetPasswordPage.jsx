import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid or missing password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage(res.data.message || 'Password has been reset successfully.');
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'This password reset link is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-8">
        
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Set New Password</h2>
          <p className="text-sm font-medium text-gray-500">Create a new, secure password for your account.</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-xl flex items-start gap-3 shadow-sm font-medium">
            <span className="material-symbols-outlined text-[20px] text-green-500">check_circle</span> 
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-3 shadow-sm font-medium">
            <span className="material-symbols-outlined text-[20px] text-red-500">error</span> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2 text-center">
              Reset Token (Auto-filled)
            </label>
            <input
              type="text"
              value={token}
              readOnly
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-400 text-xs font-mono select-all cursor-not-allowed text-center outline-none"
            />
          </div>

          <InputField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            icon="key"
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            required
            minLength={6}
            icon="key"
          />

          <Button
            type="submit"
            disabled={submitting || !token}
            className="w-full py-4 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {submitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <Link to="/login" className="inline-flex items-center justify-center gap-1 text-sm font-bold text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
