import React, { useState } from 'react';
import { User, View } from '../types';
import { loginWithPasskey } from '../services/authService';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  navigateTo: (view: View) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = loginWithPasskey(passkey);
      if (user) {
        onLogin(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Admin Access Verification</h2>
      <form onSubmit={handlePasskeySubmit} className="space-y-4">
        <div>
          <label htmlFor="passkey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Passkey</label>
          <input
            type="password"
            id="passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400"
        >
          {isLoading ? <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Verifying...</> : 'Login with Passkey'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        This login is for authorized personnel only.
      </p>
    </div>
  );
};

export default AdminLogin;