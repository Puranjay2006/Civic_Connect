import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status, Department } from '../types';
import { getIssues } from '../services/issueService';
import MapVisualization from './MapVisualization';
import { DEPARTMENTS } from '../constants';

const PublicDashboard: React.FC = () => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);

  useEffect(() => {
    const allIssues = getIssues();
    setIssues(allIssues);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const issuesThisMonth = issues.filter(i => i.createdAt >= firstDayOfMonth);

    const departmentStats: { [key in Department]: { total: number; resolved: number; totalTime: number; totalRatings: number; ratingSum: number } } = 
      DEPARTMENTS.reduce((acc, dept) => {
        acc[dept] = { total: 0, resolved: 0, totalTime: 0, totalRatings: 0, ratingSum: 0 };
        return acc;
      }, {} as any);
      
    issues.forEach(issue => {
        if(issue.department && departmentStats[issue.department]) {
            departmentStats[issue.department].total++;
            if (issue.resolvedAt && issue.status === Status.Resolved) {
                departmentStats[issue.department].resolved++;
                departmentStats[issue.department].totalTime += (issue.resolvedAt - issue.createdAt);
            }
            if(issue.rating) {
                departmentStats[issue.department].totalRatings++;
                departmentStats[issue.department].ratingSum += issue.rating;
            }
        }
    });

    const overallResolved = issues.filter(i => i.status === Status.Resolved).length;
    const overallPending = issues.filter(i => i.status === Status.Pending).length;
    const overallInProgress = issues.filter(i => i.status === Status.InProgress).length;

    return {
      issuesThisMonth: issuesThisMonth.length,
      overallResolved,
      overallPending,
      overallInProgress,
      departmentStats: Object.entries(departmentStats).map(([dept, data]) => {
          const avgTime = data.resolved > 0 ? (data.totalTime / data.resolved) : 0;
          const avgRating = data.totalRatings > 0 ? (data.ratingSum / data.totalRatings) : 0;
          return {
              department: dept as Department,
              ...data,
              avgResolutionTime: avgTime,
              avgSatisfaction: avgRating
          };
      })
    };
  }, [issues]);

  const BarChart = ({ data, title, subtitle, unit = '' }: { data: { label: string, value: number, color: string }[], title: string, subtitle?: string, unit?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{subtitle}</p>}
            <div className="space-y-4 mt-4">
                {data.map(item => (
                    <div key={item.label} className="grid grid-cols-6 items-center gap-2 text-sm">
                        <div className="col-span-2 sm:col-span-2 text-slate-600 dark:text-slate-400 truncate pr-2">{item.label}</div>
                        <div className="col-span-3 sm:col-span-3 bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                            <div className={`${item.color} h-5 rounded-full transition-all duration-500`} style={{ width: `${(item.value / (unit === '/ 5' ? 5 : maxValue)) * 100}%` }}></div>
                        </div>
                        <div className="col-span-1 text-right font-semibold text-slate-800 dark:text-slate-100">{item.value.toFixed(1)}{unit}</div>
                    </div>
                ))}
            </div>
        </div>
    )
  };

  const msToMinutes = (ms: number) => (ms > 0 ? (ms / (1000 * 60)) : 0);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Public Transparency Dashboard</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Real-time performance metrics and community feedback.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Issues Logged This Month</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.issuesThisMonth}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Issues Pending</p>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.overallPending}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Issues In Progress</p>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.overallInProgress}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Issues Resolved</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.overallResolved}</p>
        </div>
      </div>

      {/* Department Performance */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            title="Average Resolution Time (Minutes)"
            subtitle="(Demo only — real data shown in days)"
            data={stats.departmentStats.map(d => ({ label: d.department, value: msToMinutes(d.avgResolutionTime), color: 'bg-orange-500' }))}
          />
          <BarChart 
            title="Customer Satisfaction"
            unit="/ 5"
            data={stats.departmentStats.map(d => ({ label: d.department, value: d.avgSatisfaction, color: 'bg-teal-500' }))}
          />
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Map of All Resolved Issues</h3>
        <MapVisualization issues={issues.filter(i => i.status === Status.Resolved)} />
      </div>
    </div>
  );
};

export default PublicDashboard;