import React, { useState } from 'react';
import { requestPasswordReset } from '../services/authService';
import { View } from '../types';
import AuthLayout from './AuthLayout';

interface ForgotPasswordProps {
  navigateTo: (view: View) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        await requestPasswordReset(email);
        setIsSubmitted(true);
    } catch (err) {
        // Firebase might throw errors (e.g., invalid email), but we can choose to
        // show a generic success message to prevent user enumeration attacks.
        // For better UX in this app, we can show a simple error.
        setError("Failed to send reset email. Please check the address and try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password">
        {isSubmitted ? (
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                    <i className="fa-solid fa-check-circle text-2xl text-green-600 dark:text-green-400"></i>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Instructions Sent</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    If an account with that email exists, you will receive an email with password reset instructions shortly.
                </p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
                />
                </div>
                <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                >
                    {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Send reset instructions'}
                </button>
                </div>
            </form>
        )}
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Remember your password?{' '}
        <button onClick={() => navigateTo('login')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;