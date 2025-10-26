import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status, Department, View, LeaderboardUser } from '../types';
import { getIssues } from '../services/issueService';
import { getLeaderboardData } from '../services/reportService';
import MapVisualization from './MapVisualization';
import { DEPARTMENTS } from '../constants';
import BarChart from './BarChart';
import Leaderboard from './Leaderboard';

interface PublicDashboardProps {
  navigateTo: (view: View) => void;
}

const PublicDashboard: React.FC<PublicDashboardProps> = ({ navigateTo }) => {
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

  const topUsers = useMemo((): LeaderboardUser[] => {
    return getLeaderboardData().slice(0, 5);
  }, [issues]);


  const msToMinutes = (ms: number) => (ms > 0 ? (ms / (1000 * 60)) : 0);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Public Transparency Dashboard</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Real-time performance metrics and community feedback.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center float-animation transform hover:-translate-y-2 transition-all duration-300"
          style={{ animationDelay: '0ms' }}
        >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Issues Logged This Month</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.issuesThisMonth}</p>
        </div>
        <div
          className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center float-animation transform hover:-translate-y-2 transition-all duration-300"
          style={{ animationDelay: '150ms' }}
        >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Issues Pending</p>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.overallPending}</p>
        </div>
        <div
          className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center float-animation transform hover:-translate-y-2 transition-all duration-300"
          style={{ animationDelay: '300ms' }}
        >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Issues In Progress</p>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.overallInProgress}</p>
        </div>
        <div
          className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center float-animation transform hover:-translate-y-2 transition-all duration-300"
          style={{ animationDelay: '450ms' }}
        >
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
            maxValueOverride={5}
            data={stats.departmentStats.map(d => ({ label: d.department, value: d.avgSatisfaction, color: 'bg-teal-500' }))}
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
              <Leaderboard topUsers={topUsers} />
          </div>
          <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Locations of Resolved Issues</h3>
                  <div className="flex-grow">
                      <MapVisualization issues={issues.filter(i => i.status === Status.Resolved)} />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PublicDashboard;