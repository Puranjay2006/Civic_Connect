import React, { useState, useEffect } from 'react';
import { User, View } from '../types';
import { login } from '../services/authService';
import Notification from './Notification';

interface LoginProps {
  onLogin: (user: User) => void;
  navigateTo: (view: View) => void;
  message?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, navigateTo, message }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setNotification(message);
    }
  }, [message]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
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
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
       {notification && <Notification message={notification} onClose={() => setNotification(null)} type="success" />}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Login to Your Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username or Email</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <button type="button" onClick={() => navigateTo('forgot-password')} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
            </button>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {isLoading ? <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Logging In...</> : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <button onClick={() => navigateTo('signup')} className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;