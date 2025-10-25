import React from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  subtitle?: string;
  unit?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, subtitle, unit = '' }) => {
    if (!data || data.length < 2) {
        return (
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 mb-2">{subtitle}</p>}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">Not enough data to display trend.</p>
          </div>
        );
    }
    
    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    const maxValue = Math.max(...data.map(d => d.value), 1) * 1.1;

    const getX = (index: number) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
    const getY = (value: number) => height - padding.bottom - (value / maxValue) * (height - padding.top - padding.bottom);

    const pathData = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(point.value)}`).join(' ');

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = (maxValue / 4) * i;
        return { value: value.toFixed(1), y: getY(value) };
    });

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h4 className="font-bold text-slate-700 dark:text-slate-200">{title}</h4>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 mb-4">{subtitle}</p>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="title" role="img">
        <title id="title">{title}</title>
        
        {/* Y-axis grid lines and labels */}
        {yAxisLabels.map(label => (
            <g key={label.value} className="text-slate-300 dark:text-slate-600">
                <line x1={padding.left} x2={width - padding.right} y1={label.y} y2={label.y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                <text x={padding.left - 8} y={label.y + 3} textAnchor="end" className="text-xs fill-current text-slate-500 dark:text-slate-400">
                    {label.value}
                </text>
            </g>
        ))}

        {/* X-axis labels */}
        {data.map((point, i) => (
             <text key={i} x={getX(i)} y={height - padding.bottom + 15} textAnchor="middle" className="text-xs fill-current text-slate-500 dark:text-slate-400">
                {point.label}
             </text>
        ))}
        
        {/* Line */}
        <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((point, i) => (
            <g key={i}>
                <circle cx={getX(i)} cy={getY(point.value)} r="3" fill="#3b82f6" />
                <title>{`${point.label}: ${point.value.toFixed(1)}${unit}`}</title>
            </g>
        ))}
      </svg>
    </div>
  );
};

export default LineChart;