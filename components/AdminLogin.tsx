import React, { useState } from 'react';
import { User } from '../types';
import { loginAsSuperAdmin } from '../services/authService';
import AuthLayout from './AuthLayout';

interface AdminLoginProps {
  onLogin: (user: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const adminUser = await loginAsSuperAdmin(passkey);
      onLogin(adminUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Super Admin Login">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div>
          <label htmlFor="passkey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Super Admin Passkey
          </label>
          <input
            id="passkey"
            name="passkey"
            type="password"
            required
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:from-slate-400 disabled:to-slate-500 disabled:opacity-70 disabled:scale-100 disabled:shadow-none transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Authenticate'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;