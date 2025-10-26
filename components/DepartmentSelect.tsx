
import React from 'react';
import { Department } from '../types';
import { DEPARTMENTS } from '../constants';

interface DepartmentSelectProps {
  onDepartmentSelect: (department: Department | null) => void;
}

const departmentInfo: { [key in Department]: { icon: string; gradient: string } } = {
    [Department.Electrical]: { icon: 'fa-bolt', gradient: 'from-yellow-400 to-orange-500' },
    [Department.Water]: { icon: 'fa-droplet', gradient: 'from-blue-400 to-cyan-500' },
    [Department.Medical]: { icon: 'fa-briefcase-medical', gradient: 'from-red-400 to-pink-500' },
    [Department.Sanitation]: { icon: 'fa-trash-alt', gradient: 'from-green-400 to-emerald-500' },
    [Department.Roads]: { icon: 'fa-road', gradient: 'from-slate-500 to-slate-600' },
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ onDepartmentSelect }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Select Department</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Choose a department to view and manage its reported issues, or manage all departments.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept, index) => (
          <button
            key={dept}
            onClick={() => onDepartmentSelect(dept)}
            className="group animate-pop-in float-animation text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 transform hover:animate-none hover:-translate-y-4 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-400/30 hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-blue-500/0 focus:ring-blue-500/50"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${departmentInfo[dept].gradient} group-hover:rotate-12 transition-transform duration-300 mb-5 shadow-lg`}>
              <i className={`fa-solid ${departmentInfo[dept].icon} text-4xl text-white`}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{dept}</h3>
          </button>
        ))}
         <div className="md:col-span-2 lg:col-span-3">
             <button
                onClick={() => onDepartmentSelect(null)}
                className="group animate-pop-in float-animation w-full text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 transform hover:animate-none hover:-translate-y-4 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-400/30 hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-blue-500/0 focus:ring-blue-500/50 flex flex-col sm:flex-row items-center justify-center gap-6"
                style={{ animationDelay: `${DEPARTMENTS.length * 100}ms` }}
             >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                  <i className={`fa-solid fa-layer-group text-4xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Manage All Departments</h3>
             </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelect;
