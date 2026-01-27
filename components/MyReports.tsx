import React, { useState, useEffect } from 'react';
import { CivicIssue, User, View } from '../types';
import { getIssues, addRatingToIssue, deleteIssue } from '../services/issueService';
import IssueCard from './IssueCard';
import IssueMap from './IssueMap';

interface MyReportsProps {
  currentUser: User;
  navigateTo: (view: View, options?: { issueId?: string }) => void;
}

const MyReports: React.FC<MyReportsProps> = ({ currentUser, navigateTo }) => {
  const [myIssues, setMyIssues] = useState<CivicIssue[]>([]);
  const [showMap, setShowMap] = useState(false);

  const loadMyIssues = () => {
    const allIssues = getIssues();
    const userIssues = allIssues
      .filter(issue => issue.userId === currentUser.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    setMyIssues(userIssues);
  };

  useEffect(() => {
    loadMyIssues();
  }, [currentUser]);

  const handleRateIssue = (id: string, rating: number) => {
    addRatingToIssue(id, rating);
    // The global toast notification will be shown via the event system.
    // We listen to currentUser changes to refresh the issue list, which will now show the rating.
  };

  const handleProvideFeedback = (issueId: string) => {
    navigateTo('feedback', { issueId });
  };

  const handleDelete = (id: string) => {
    const success = deleteIssue(id, currentUser.id, currentUser.isAdmin);
    if (success) {
      loadMyIssues(); // Refresh the list
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">My Reported Issues</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Here's a list of all the civic issues you've submitted.</p>
      </div>

      {/* Toggle View Buttons */}
      {myIssues.length > 0 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShowMap(false)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
              !showMap
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <i className="fa-solid fa-grid-2"></i>
            Card View
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
              showMap
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <i className="fa-solid fa-map-location-dot"></i>
            Map View
          </button>
        </div>
      )}

      <div>
        {myIssues.length > 0 ? (
          showMap ? (
            <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  <i className="fa-solid fa-map-pin mr-2 text-red-500"></i>
                  Your Reports on Map
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">In Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Resolved</span>
                  </div>
                </div>
              </div>
              <IssueMap issues={myIssues} height="450px" showFilters={true} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myIssues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  isAdmin={false} 
                  isMyReport={true} 
                  onRateIssue={handleRateIssue}
                  onProvideFeedback={handleProvideFeedback}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-5">
               <i className="fa-solid fa-file-circle-plus text-4xl text-blue-500 dark:text-blue-400"></i>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">You haven't reported any issues yet.</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">See a problem in your community? Be the one to get it fixed.</p>
            <button
                onClick={() => navigateTo('report')}
                className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-base flex items-center justify-center gap-3 mx-auto"
              >
                <i className="fa-solid fa-bullhorn"></i>
                Report Your First Issue
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;