import React from 'react';

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  subtitle?: string;
  unit?: string;
  maxValueOverride?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, subtitle, unit = '', maxValueOverride }) => {
    const maxValue = maxValueOverride ?? Math.max(...data.map(d => d.value), 1);
    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{subtitle}</p>}
            <div className="space-y-4 mt-4">
                {data.length > 0 ? data.map(item => (
                    <div key={item.label} className="grid grid-cols-6 items-center gap-2 text-sm">
                        <div className="col-span-2 sm:col-span-2 text-slate-600 dark:text-slate-400 truncate pr-2">{item.label}</div>
                        <div className="col-span-3 sm:col-span-3 bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                            <div className={`${item.color} h-5 rounded-full transition-all duration-500`} style={{ width: `${(item.value / maxValue) * 100}%` }}></div>
                        </div>
                        <div className="col-span-1 text-right font-semibold text-slate-800 dark:text-slate-100">{item.value.toFixed(1)}{unit}</div>
                    </div>
                )) : (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No data available for this chart.</p>
                )}
            </div>
        </div>
    )
};

export default BarChart;
