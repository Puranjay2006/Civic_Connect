import React, { useState } from 'react';
import { View } from '../types';
import { requestPasswordReset } from '../services/authService';

interface ForgotPasswordProps {
  navigateTo: (view: View, options?: { token?: string }) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = requestPasswordReset(email);
    setResetToken(token);
    setLinkSent(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Reset Your Password</h2>
      
      {linkSent ? (
          <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                  <i className="fa-solid fa-envelope-circle-check text-2xl text-green-600 dark:text-green-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Request Received</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                  In a real application, an email would be sent to <span className="font-medium text-slate-800 dark:text-slate-200">{email}</span> if it's associated with an account.
              </p>
              {resetToken && (
                <div className="mt-6">
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">For this simulation, you can proceed directly:</p>
                     <button
                        onClick={() => navigateTo('reset-password', { token: resetToken })}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Reset Your Password
                      </button>
                </div>
              )}
          </div>
      ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Enter your email address and we'll simulate sending a password reset link.</p>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Send Reset Link
            </button>
          </form>
      )}
    </div>
  );
};

export default ForgotPassword;
