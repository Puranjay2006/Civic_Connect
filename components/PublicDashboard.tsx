import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status, Department, View, LeaderboardUser } from '../types';
import { getIssues } from '../services/issueService';
import { getLeaderboardData } from '../services/reportService';
import IssueMap from './IssueMap';
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
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-4">
          <i className="fa-solid fa-chart-line text-emerald-500"></i>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Live Analytics</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Transparency Dashboard</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Real-time performance metrics and community feedback for full accountability.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          className="group premium-card p-6 rounded-2xl text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
          style={{ animationDelay: '0ms' }}
        >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-calendar-plus text-white text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">This Month</p>
            <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-1">{stats.issuesThisMonth}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">issues logged</p>
        </div>
        <div
          className="group premium-card p-6 rounded-2xl text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
          style={{ animationDelay: '150ms' }}
        >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-hourglass-half text-white text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-4xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-1">{stats.overallPending}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">awaiting review</p>
        </div>
        <div
          className="group premium-card p-6 rounded-2xl text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
          style={{ animationDelay: '300ms' }}
        >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-person-digging text-white text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">In Progress</p>
            <p className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mt-1">{stats.overallInProgress}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">being resolved</p>
        </div>
        <div
          className="group premium-card p-6 rounded-2xl text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
          style={{ animationDelay: '450ms' }}
        >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-check-double text-white text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Resolved</p>
            <p className="text-4xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mt-1">{stats.overallResolved}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">completed</p>
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

      <div className="premium-card rounded-2xl p-4 sm:p-6">
          <Leaderboard topUsers={topUsers} />
      </div>

      {/* Full Width Map Section */}
      <div className="premium-card rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <i className="fa-solid fa-earth-asia text-white"></i>
              </span>
              Live Issues Map
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-13">
              Click on markers to see issue details
            </p>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Resolved</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden">
          <IssueMap issues={issues} height="450px" showFilters={true} />
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;