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
        <div className="premium-card p-6 rounded-2xl h-full">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
            <div className="space-y-4 mt-6">
                {data.length > 0 ? data.map((item, index) => (
                    <div key={item.label} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{item.label}</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{item.value.toFixed(1)}{unit}</span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                                    index % 3 === 0 ? 'from-blue-500 to-indigo-600' :
                                    index % 3 === 1 ? 'from-emerald-500 to-teal-600' :
                                    'from-orange-500 to-red-500'
                                }`}
                                style={{ 
                                    width: `${(item.value / maxValue) * 100}%`,
                                    boxShadow: `0 0 10px ${index % 3 === 0 ? 'rgba(59, 130, 246, 0.4)' : index % 3 === 1 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(249, 115, 22, 0.4)'}`
                                }}
                            ></div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <i className="fa-solid fa-chart-simple text-slate-400 text-xl"></i>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No data available</p>
                    </div>
                )}
            </div>
        </div>
    )
};

export default BarChart;
