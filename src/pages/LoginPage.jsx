import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[var(--color-background)]">
      <main className="w-full max-w-md bg-white rounded-xl shadow-[0_4px_12px_rgba(11,37,69,0.05)] overflow-hidden relative border border-gray-100">
        {/* Decorative Top Accent */}
        <div className="h-2 w-full bg-[var(--color-accent)] absolute top-0 left-0"></div>
        
        <div className="p-8 pt-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary)] rounded-lg mb-4 shadow-sm">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>school</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Pen & Page Academia</h1>
            <p className="text-gray-500 font-medium">Welcome Back</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email Address"
              icon="mail"
              type="email"
              id="email"
              name="email"
              placeholder="admin@penandpage.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <label className="block font-semibold text-xs tracking-wider text-[var(--color-text)] mb-2 uppercase">Password</label>
              <div className="relative rounded-lg border border-gray-300 transition-all focus-within:border-[var(--color-secondary)] focus-within:border-2 bg-white">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400">lock</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="block w-full pl-10 pr-10 py-3 border-none bg-transparent focus:ring-0 text-sm text-[var(--color-text)] rounded-lg placeholder-gray-400 outline-none"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors focus:outline-none flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button type="submit" className="w-full py-3 text-base" disabled={submitting}>
                {submitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Secure Connection Note */}
          <div className="mt-8 text-center flex items-center justify-center text-gray-400 opacity-75">
            <span className="material-symbols-outlined text-[16px] mr-1">shield</span>
            <span className="text-xs font-medium">Secure Administrative Portal</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
