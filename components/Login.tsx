import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { User, View } from '../types';
import AuthLayout from './AuthLayout';
import Notification from './Notification';

interface LoginProps {
  onLogin: (user: User) => void;
  navigateTo: (view: View, options?: { message?: string }) => void;
  message?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, navigateTo, message }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | undefined>();

  useEffect(() => {
    // Use an effect to set the notification message. This allows us to clear it
    // internally without affecting the parent's navigation state.
    setNotificationMessage(message);
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = login(identifier, password);
      if (user) {
        onLogin(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to your account">
      {notificationMessage && <Notification message={notificationMessage} onClose={() => setNotificationMessage(undefined)} type="success" />}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email or Username
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <button type="button" onClick={() => navigateTo('forgot-password')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Forgot your password?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:opacity-70 disabled:scale-100 disabled:shadow-none transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Sign in'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Not a member?{' '}
        <button onClick={() => navigateTo('signup')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Sign up now
        </button>
      </p>
    </AuthLayout>
  );
};

export default Login;