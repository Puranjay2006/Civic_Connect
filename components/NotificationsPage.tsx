import React from 'react';
import { User } from '../types';
import { markNotificationsAsRead } from '../services/authService';

interface NotificationsPageProps {
  currentUser: User;
  setCurrentUser: (user: User | null) => void;
}

const timeSince = (date: number): string => {
  const seconds = Math.floor((new Date().getTime() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentUser, setCurrentUser }) => {
  const handleMarkAsRead = () => {
    const updatedUser = markNotificationsAsRead(currentUser.id);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const unreadCount = currentUser.notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">A record of all updates to your reports.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAsRead}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        {currentUser.notifications.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {currentUser.notifications.map(notif => (
              <li key={notif.id} className={`p-4 sm:p-6 transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500 animate-pulse' : 'bg-transparent'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{notif.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{timeSince(notif.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
           <div className="text-center py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50">
               <i className="fa-solid fa-bell-slash text-2xl text-slate-500 dark:text-slate-400"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">All Caught Up!</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">You have no notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;