import React, { useState } from 'react';
import { requestPasswordReset } from '../services/authService';
import { View } from '../types';
import AuthLayout from './AuthLayout';

interface ForgotPasswordProps {
  navigateTo: (view: View) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      requestPasswordReset(email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <AuthLayout title="Reset your password">
      {isSubmitted ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <i className="fa-solid fa-check text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Check your email</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              If an account with that email exists, you will receive a (simulated) email with password reset instructions shortly.
            </p>
          </div>
          <button
            onClick={() => navigateTo('login')}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-envelope text-slate-400"></i>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Send reset instructions'}
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
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
