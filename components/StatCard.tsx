import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  tooltipText?: string;
}

const colorGradients: { [key: string]: { gradient: string; shadow: string } } = {
  'bg-blue-500': { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
  'bg-green-500': { gradient: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/30' },
  'bg-yellow-500': { gradient: 'from-yellow-400 to-orange-500', shadow: 'shadow-yellow-500/30' },
  'bg-red-500': { gradient: 'from-red-500 to-pink-600', shadow: 'shadow-red-500/30' },
  'bg-purple-500': { gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/30' },
  'bg-orange-500': { gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/30' },
  'bg-teal-500': { gradient: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/30' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, tooltipText }) => {
  const gradientStyle = colorGradients[color] || { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' };
  
  return (
    <div className="group premium-card p-6 rounded-2xl flex items-center gap-5 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradientStyle.gradient} shadow-lg ${gradientStyle.shadow} group-hover:scale-110 transition-transform duration-300`}>
          <i className={`fa-solid ${icon} text-2xl text-white`}></i>
      </div>
      <div className="flex-grow">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
          <span>{title}</span>
          {tooltipText && (
            <div className="tooltip">
              <i className="fa-solid fa-circle-info text-slate-400 cursor-help text-xs"></i>
              <span className="tooltiptext">{tooltipText}</span>
            </div>
          )}
        </p>
        <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;