import React from 'react';
import { LeaderboardUser } from '../types';

interface LeaderboardProps {
  topUsers: LeaderboardUser[];
}

const rankStyles = [
    { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', text: 'text-white', icon: 'fa-crown', shadow: 'shadow-yellow-500/40' }, // 1st
    { bg: 'bg-gradient-to-br from-slate-400 to-slate-500', text: 'text-white', icon: 'fa-medal', shadow: 'shadow-slate-400/40' }, // 2nd
    { bg: 'bg-gradient-to-br from-amber-600 to-orange-600', text: 'text-white', icon: 'fa-medal', shadow: 'shadow-amber-500/40' }, // 3rd
];

const Leaderboard: React.FC<LeaderboardProps> = ({ topUsers }) => {
  return (
    <div className="premium-card p-6 rounded-2xl h-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <i className="fa-solid fa-trophy text-white"></i>
        </span>
        Top Active Citizens
      </h3>
      {topUsers.length > 0 ? (
        <ul className="space-y-3">
          {topUsers.map((user, index) => {
            const rankStyle = rankStyles[index];
            return (
              <li key={user.userId} className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border border-slate-200/50 dark:border-slate-600/30 transition-all duration-300 transform hover:scale-[1.02]">
                <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${rankStyle ? `${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow}` : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {rankStyle ? <i className={`fa-solid ${rankStyle.icon}`}></i> : <span className="text-sm font-black">#{index + 1}</span>}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="inline-flex items-center gap-1"><i className="fa-solid fa-file-lines"></i> {user.reportsSubmitted}</span>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center gap-1"><i className="fa-solid fa-star"></i> {user.ratingsGiven}</span>
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user.score}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">points</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 flex flex-col justify-center items-center h-full">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 mb-4">
            <i className="fa-solid fa-users-slash text-3xl text-slate-400"></i>
          </div>
          <p className="font-bold text-lg text-slate-700 dark:text-slate-200">No Activity Yet</p>
          <p className="text-sm mt-1">Be the first to contribute and appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
