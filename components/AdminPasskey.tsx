import React, { useState } from 'react';
import { View } from '../types';
import { verifyMainAdminPasskey } from '../services/authService';
import AuthLayout from './AuthLayout';

interface AdminPasskeyProps {
  navigateTo: (view: View) => void;
}

const AdminPasskey: React.FC<AdminPasskeyProps> = ({ navigateTo }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const isValid = verifyMainAdminPasskey(passkey);
    
    if (isValid) {
      navigateTo('department-login');
    } else {
      setError('Invalid passkey. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Department Admin Access">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Step 1: Enter the general passkey to proceed to department selection.
        </p>
        {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <div>
          <label htmlFor="passkey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Admin Passkey
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:opacity-70 disabled:scale-100 disabled:shadow-none transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Continue'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminPasskey;