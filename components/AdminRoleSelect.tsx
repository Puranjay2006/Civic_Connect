import React from 'react';
import { View } from '../types';

interface AdminRoleSelectProps {
  navigateTo: (view: View) => void;
}

const AdminRoleSelect: React.FC<AdminRoleSelectProps> = ({ navigateTo }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Admin Portal Access
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
            Please select your role to proceed to the designated login portal.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Department Admin Card */}
        <div className="group card-fade-in-up text-left p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-blue-950/80 rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="card-fade-in-up flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 mb-5 shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
                <i className="fa-solid fa-user-gear text-3xl text-white"></i>
            </div>
            <h3 className="card-fade-in-up text-2xl font-bold text-slate-900 dark:text-white mb-3" style={{ animationDelay: '0.3s' }}>Department Admin</h3>
            <p className="card-fade-in-up text-slate-600 dark:text-slate-300 flex-grow mb-6" style={{ animationDelay: '0.4s' }}>Access the dashboard to manage and track user-reported issues within your assigned department. Update statuses, communicate with citizens, and oversee daily operations.</p>
            <button
                onClick={() => navigateTo('department-login')}
                className="card-fade-in-up w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:from-sky-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-base flex items-center justify-center gap-3 mt-auto"
                style={{ animationDelay: '0.5s' }}
            >
                Login as Department Admin
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform duration-200"></i>
            </button>
        </div>

        {/* Super Admin Card */}
        <div className="group card-fade-in-up text-left p-8 bg-gradient-to-br from-slate-50 via-white to-gray-100 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-purple-950/60 rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:scale-105" style={{ animationDelay: '0.2s' }}>
            <div className="card-fade-in-up flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 mb-5 shadow-lg group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '0.4s' }}>
                <i className="fa-solid fa-user-shield text-3xl text-white"></i>
            </div>
            <h3 className="card-fade-in-up text-2xl font-bold text-slate-900 dark:text-white mb-3" style={{ animationDelay: '0.5s' }}>Super Admin</h3>
            <p className="card-fade-in-up text-slate-600 dark:text-slate-300 flex-grow mb-6" style={{ animationDelay: '0.6s' }}>View detailed analytics and comparative reports across all departments. Analyze performance metrics, identify trends, and ensure accountability city-wide.</p>
            <button
                onClick={() => navigateTo('admin-login')}
                className="card-fade-in-up w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 px-8 rounded-full hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-105 shadow-lg text-base flex items-center justify-center gap-3 mt-auto"
                style={{ animationDelay: '0.7s' }}
            >
                Login as Super Admin
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform duration-200"></i>
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdminRoleSelect;