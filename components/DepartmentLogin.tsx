import React, { useState } from 'react';
import { User, Department } from '../types';
import { loginAsDepartmentAdmin } from '../services/authService';
import { DEPARTMENTS } from '../constants';
import CustomSelect from './CustomSelect';
import AuthLayout from './AuthLayout';

interface DepartmentLoginProps {
  onLogin: (user: User) => void;
}

const DepartmentLogin: React.FC<DepartmentLoginProps> = ({ onLogin }) => {
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const deptAdmin = loginAsDepartmentAdmin(department, passkey);
      if (deptAdmin) {
        onLogin(deptAdmin);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Department Admin Login">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 -mt-4">
            Step 2: Select your department and enter its specific passkey.
        </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Select Department
          </label>
          <CustomSelect
            id="department"
            value={department}
            onChange={(value) => setDepartment(value as Department)}
            options={DEPARTMENTS.map(dep => ({ value: dep, label: dep }))}
          />
        </div>
        <div>
          <label htmlFor="passkey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Department Passkey
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Login'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default DepartmentLogin;
