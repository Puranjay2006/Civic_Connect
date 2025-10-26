import React, { useState } from 'react';
import { User, Department } from '../types';
import { loginAsDepartmentAdmin } from '../services/authService';
import { DEPARTMENTS } from '../constants';
import Modal from './Modal'; // Import the Modal component

const departmentInfo: { [key in Department]: { icon: string; gradient: string } } = {
    [Department.Electrical]: { icon: 'fa-bolt', gradient: 'from-yellow-400 to-orange-500' },
    [Department.Water]: { icon: 'fa-droplet', gradient: 'from-blue-400 to-cyan-500' },
    [Department.Medical]: { icon: 'fa-briefcase-medical', gradient: 'from-red-400 to-pink-500' },
    [Department.Sanitation]: { icon: 'fa-trash-alt', gradient: 'from-green-400 to-emerald-500' },
    [Department.Roads]: { icon: 'fa-road', gradient: 'from-slate-500 to-slate-600' },
}

interface DepartmentLoginProps {
  onLogin: (user: User) => void;
}

const DepartmentLogin: React.FC<DepartmentLoginProps> = ({ onLogin }) => {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) {
        setError("An unexpected error occurred. Please close and try again.");
        return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const deptAdmin = await loginAsDepartmentAdmin(selectedDepartment, passkey);
      onLogin(deptAdmin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedDepartment(null);
    setPasskey('');
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Department Admin Login</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">First, select your department to proceed.</p>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {DEPARTMENTS.map((dept, index) => (
            <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className="group animate-pop-in float-animation text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 transform hover:animate-none hover:-translate-y-4 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-400/30 hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-blue-500/0 focus:ring-blue-500/50"
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${departmentInfo[dept].gradient} group-hover:rotate-12 transition-transform duration-300 mb-5 shadow-lg`}>
                <i className={`fa-solid ${departmentInfo[dept].icon} text-4xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{dept}</h3>
            </button>
            ))}
        </div>

        {selectedDepartment && (
            <Modal title={`Enter Passkey for ${selectedDepartment}`} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div>
                    <label htmlFor="passkey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {selectedDepartment} Passkey
                    </label>
                    <input
                        id="passkey"
                        name="passkey"
                        type="password"
                        required
                        autoFocus
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
            </Modal>
        )}
    </div>
  );
};

export default DepartmentLogin;