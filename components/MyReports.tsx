import React, { useState, useEffect } from 'react';
import { CivicIssue, User } from '../types';
import { getIssues } from '../services/issueService';
import IssueCard from './IssueCard';

interface MyReportsProps {
  currentUser: User;
}

const MyReports: React.FC<MyReportsProps> = ({ currentUser }) => {
  const [myIssues, setMyIssues] = useState<CivicIssue[]>([]);

  useEffect(() => {
    const allIssues = getIssues();
    const userIssues = allIssues
      .filter(issue => issue.userId === currentUser.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    setMyIssues(userIssues);
  }, [currentUser.id]);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">My Reported Issues</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Here's a list of all the civic issues you've submitted.</p>
      </div>

      <div>
        {myIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} isAdmin={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50">
               <i className="fa-solid fa-file-circle-question text-2xl text-slate-500 dark:text-slate-400"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">No Reports Yet</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">You haven't reported any issues. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;