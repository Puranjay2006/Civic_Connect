import React from 'react';
import { LeaderboardUser } from '../types';

interface LeaderboardProps {
  topUsers: LeaderboardUser[];
}

const rankStyles = [
    { bg: 'bg-yellow-400', text: 'text-yellow-800', icon: 'fa-trophy' }, // 1st
    { bg: 'bg-slate-300', text: 'text-slate-700', icon: 'fa-medal' }, // 2nd
    { bg: 'bg-amber-500', text: 'text-amber-800', icon: 'fa-medal' }, // 3rd
];

const Leaderboard: React.FC<LeaderboardProps> = ({ topUsers }) => {
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
        <i className="fa-solid fa-star text-yellow-400"></i>
        Top Active Citizens
      </h3>
      {topUsers.length > 0 ? (
        <ul className="space-y-3">
          {topUsers.map((user, index) => {
            const rankStyle = rankStyles[index];
            return (
              <li key={user.userId} className="flex items-center gap-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors">
                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${rankStyle ? `${rankStyle.bg} ${rankStyle.text}` : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {rankStyle ? <i className={`fa-solid ${rankStyle.icon}`}></i> : `#${index + 1}`}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.reportsSubmitted} Reports • {user.ratingsGiven} Ratings
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{user.score}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Points</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 flex flex-col justify-center items-center h-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50 mb-4">
            <i className="fa-solid fa-users-slash text-2xl"></i>
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">No Activity Yet</p>
          <p className="text-sm">Be the first to contribute and appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
