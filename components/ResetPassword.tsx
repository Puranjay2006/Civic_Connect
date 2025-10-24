import React, { useState } from 'react';
import { View } from '../types';
import { resetPassword } from '../services/authService';

interface ResetPasswordProps {
  token: string;
  navigateTo: (view: View, options?: { message?: string }) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, navigateTo }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      resetPassword(token, password);
      navigateTo('login', { message: 'Password reset successfully. Please log in.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Set Your New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>
        <div>
          <label htmlFor="confirm-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Resetting Password...</> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
