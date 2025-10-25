import React from 'react';
import { Department } from '../types';
import { DEPARTMENTS } from '../constants';

interface DepartmentSelectProps {
  onDepartmentSelect: (department: Department) => void;
}

const departmentIcons: { [key in Department]: string } = {
    [Department.Electrical]: 'fa-bolt',
    [Department.Water]: 'fa-droplet',
    [Department.Medical]: 'fa-briefcase-medical',
    [Department.Sanitation]: 'fa-trash-alt',
    [Department.Roads]: 'fa-road',
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ onDepartmentSelect }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Select Department</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Choose a department to view and manage its reported issues.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => onDepartmentSelect(dept)}
            className="group text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transform hover:-translate-y-2 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors duration-300 mb-5 shadow-md">
              <i className={`fa-solid ${departmentIcons[dept]} text-4xl text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors duration-300`}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{dept}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DepartmentSelect;