import React, { useState } from 'react';
import { resetPassword } from '../services/authService';
import { View } from '../types';
import AuthLayout from './AuthLayout';

interface ResetPasswordProps {
  token: string;
  navigateTo: (view: View, options?: { message?: string }) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, navigateTo }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /\d/.test(password), text: 'One number' },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      resetPassword(token, password);
      navigateTo('login', { message: 'Your password has been successfully reset. Please sign in.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create new password">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-lock text-slate-400"></i>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          {/* Password requirements */}
          <div className="mt-3 space-y-2">
            {passwordRequirements.map((req, index) => (
              <div key={index} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                <i className={`fa-solid ${req.met ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                {req.text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-lock text-slate-400"></i>
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700/50 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-green-500 dark:border-green-500'
                    : 'border-red-500 dark:border-red-500'
                  : 'border-slate-200 dark:border-slate-600'
              }`}
              placeholder="Confirm new password"
            />
            {confirmPassword.length > 0 && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <i className={`fa-solid ${passwordsMatch ? 'fa-check text-green-500' : 'fa-times text-red-500'}`}></i>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !allRequirementsMet || !passwordsMatch}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
        >
          {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Reset Password'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
