import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  tooltipText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, tooltipText }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-5`}>
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <i className={`fa-solid ${icon} text-2xl text-white`}></i>
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider flex items-center gap-2">
        <span>{title}</span>
        {tooltipText && (
          <div className="tooltip">
            <i className="fa-solid fa-info-circle text-slate-400 cursor-help"></i>
            <span className="tooltiptext">{tooltipText}</span>
          </div>
        )}
      </p>
      <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export default StatCard;