import React, { useState, useEffect } from 'react';
import { DepartmentReport } from '../services/reportService';
import { getReportInsights } from '../services/geminiService';
import StatCard from './StatCard';
import LineChart from './LineChart';
import PieChart from './PieChart';

interface DepartmentReportViewProps {
    report: DepartmentReport;
    departmentName: string;
}

const msToMinutes = (ms: number): number => (ms > 0 ? ms / (1000 * 60) : 0);

const DepartmentReportView: React.FC<DepartmentReportViewProps> = ({ report, departmentName }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
        setIsLoadingInsights(true);
        try {
            const generatedInsights = await getReportInsights(report, departmentName);
            setInsights(generatedInsights);
        } catch (error) {
            console.error("Failed to get insights:", error);
            setInsights("Could not load AI insights at this time.");
        } finally {
            setIsLoadingInsights(false);
        }
    };
    fetchInsights();
  }, [report, departmentName]);

  const pieChartData = Object.entries(report.categoryDistribution).map(([label, value]) => ({ label, value: value as number}));
  
  // Convert weekly trend data from days to minutes for the chart
  const weeklyTrendsInMinutes = report.weeklyTrends.map(trend => ({
    label: trend.period.replace('W', 'Week '),
    value: trend.avgResolutionTimeDays * 24 * 60 // Convert days to minutes
  }));

  // For the "Last Week" trend, we show the last two data points for a simple line
  const recentTrendData = weeklyTrendsInMinutes.slice(-2);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{departmentName} Department</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Performance and Efficiency Report</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Requests" value={report.totalRequests} icon="fa-bullhorn" color="bg-blue-500" />
        <StatCard title="Resolved" value={report.resolvedRequests} icon="fa-check-circle" color="bg-green-500" />
        <StatCard title="Pending / In Progress" value={report.pendingRequests + report.inProgressRequests} icon="fa-hourglass-half" color="bg-yellow-500" />
        <StatCard title="Overdue Cases" value={report.overdueRequests} icon="fa-triangle-exclamation" color="bg-red-500" />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Avg Resolution" 
            value={msToMinutes(report.avgResolutionTimeMs).toFixed(1)} 
            icon="fa-clock" 
            color="bg-orange-500" 
            subtitle="minutes (demo)" 
          />
          <StatCard title="SLA Compliance" value={`${report.slaComplianceRate.toFixed(1)}%`} icon="fa-award" color="bg-indigo-500" subtitle="Target: <3 days" />
          <StatCard title="Avg Satisfaction" value={`${report.avgSatisfaction.toFixed(2)} / 5`} icon="fa-star" color="bg-teal-500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
             <LineChart 
                title="Avg. Resolution Time Trend (Last Week)"
                subtitle="Note: Time shown in minutes for demo purposes."
                data={recentTrendData}
                unit=" mins"
            />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <PieChart 
                title="Issue Type Distribution"
                data={pieChartData}
            />
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-lightbulb text-yellow-400"></i>
                    AI-Powered Key Insights
                </h4>
                {isLoadingInsights ? (
                     <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                         <i className="fa-solid fa-spinner animate-spin"></i>
                         <span>Generating analysis...</span>
                     </div>
                ) : (
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-inside">
                        {insights?.split('* ').filter(s => s.trim()).map((insight, index) => (
                           <li key={index} className="leading-relaxed">{insight.trim()}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentReportView;