
import React from 'react';
import { Category } from '../types';

interface PieChartProps {
  data: { label: string; value: number }[];
  title: string;
}

const CATEGORY_COLORS: { [key in Category | string]: string } = {
  [Category.Pothole]: '#f59e0b', // amber-500
  [Category.Garbage]: '#10b981', // emerald-500
  [Category.Streetlight]: '#facc15', // yellow-400
  [Category.Other]: '#64748b', // slate-500
};
const FALLBACK_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'];

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-bold text-slate-700 dark:text-slate-200">{title}</h4>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No data available.</p>
      </div>
    );
  }

  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercentage = 0;

  const gradientParts = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const color = CATEGORY_COLORS[item.label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    const start = cumulativePercentage;
    const end = cumulativePercentage + percentage;
    cumulativePercentage = end;
    return `${color} ${start}% ${end}%`;
  });
  
  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4">{title}</h4>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div 
          className="w-32 h-32 rounded-full flex-shrink-0"
          style={{ background: conicGradient }}
          role="img"
          aria-label={`Pie chart for ${title}`}
        ></div>
        <div className="w-full space-y-2">
            {data.map((item, index) => {
                const color = CATEGORY_COLORS[item.label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                            <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {((item.value / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
