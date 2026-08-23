import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-8">
        
        {/* Logo or Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-50 text-[var(--color-secondary)] rounded-full flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-3xl">vpn_key</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Reset Password</h2>
          <p className="text-sm font-medium text-gray-500">Enter your email and we'll send you a link to get back into your account.</p>
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
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@school.edu"
            required
            icon="mail"
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-4 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {submitting ? 'Sending Request...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
