
import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status } from '../types';
import { getIssues } from '../services/issueService';
import IssueCard from './IssueCard';
import MapVisualization from './MapVisualization';

const PublicDashboard: React.FC = () => {
  const [resolvedIssues, setResolvedIssues] = useState<CivicIssue[]>([]);

  useEffect(() => {
    const allIssues = getIssues();
    const resolved = allIssues
      .filter(issue => issue.status === Status.Resolved)
      .sort((a, b) => b.createdAt - a.createdAt);
    setResolvedIssues(resolved);
  }, []);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Resolved Issues Showcase</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">A public record of all successfully resolved civic issues for community transparency.</p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Map of Resolved Issues</h3>
        <MapVisualization issues={resolvedIssues} />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recently Resolved ({resolvedIssues.length})</h3>
        {resolvedIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} isAdmin={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
               <i className="fa-solid fa-check-double text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">All Clear!</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">No issues have been marked as resolved yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDashboard;