import React, { useState } from 'react';
import { User, NotificationType, NotificationMessage } from '../types';
import { markNotificationsAsRead, deleteNotification, deleteAllNotifications } from '../services/authService';

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
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

const notificationIcons: { [key in NotificationType]: { icon: string; color: string; } } = {
  [NotificationType.StatusUpdate]: { icon: 'fa-arrows-rotate', color: 'text-blue-500' },
  [NotificationType.RatingReceived]: { icon: 'fa-star', color: 'text-yellow-500' },
  [NotificationType.FeedbackReceived]: { icon: 'fa-comment-dots', color: 'text-purple-500' },
  [NotificationType.PasswordReset]: { icon: 'fa-key', color: 'text-orange-500' },
  [NotificationType.General]: { icon: 'fa-bell', color: 'text-slate-500' },
  [NotificationType.Email]: { icon: 'fa-envelope', color: 'text-indigo-500' },
};

const deliveryIcons: { [key in NotificationMessage['deliveryMethod']]: string } = {
    'in-app': 'fa-mobile-screen-button',
    'email': 'fa-paper-plane'
};

const handleViewEmail = (notif: NotificationMessage) => {
    const event = new CustomEvent('show-email-sim', { 
        detail: {
            ...notif.emailContent,
            recipient: '(from notification history)'
        }
    });
    window.dispatchEvent(event);
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentUser, setCurrentUser }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const handleMarkAllAsRead = () => {
    const updatedUser = markNotificationsAsRead(currentUser.id);
    if (updatedUser) {
      // Create a new user object with all notifications marked as read
      const fullyUpdatedUser = {
        ...updatedUser,
        notifications: updatedUser.notifications.map(n => ({ ...n, read: true }))
      };
      setCurrentUser(fullyUpdatedUser);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    const updatedUser = deleteNotification(currentUser.id, notificationId);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteAllNotifications = () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      const updatedUser = deleteAllNotifications(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
  };

  const unreadCount = currentUser.notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? currentUser.notifications.filter(n => !n.read)
    : currentUser.notifications;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-bell text-3xl text-blue-500"></i>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <i className="fa-solid fa-check-double"></i>
              Mark all read
            </button>
          )}
          {currentUser.notifications.length > 0 && (
            <button 
              onClick={handleDeleteAllNotifications}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <i className="fa-solid fa-trash-can"></i>
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          All ({currentUser.notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredNotifications.map(notif => {
                const iconInfo = notificationIcons[notif.type] || notificationIcons.General;
                return (
                  <li key={notif.id} className={`p-4 sm:p-5 transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${!notif.read ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
                        <i className={`fa-solid ${iconInfo.icon} ${iconInfo.color}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                           <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                               <i className="fa-regular fa-clock"></i> {timeSince(notif.createdAt)}
                           </p>
                        </div>
                         {notif.deliveryMethod === 'email' && (
                            <button onClick={() => handleViewEmail(notif)} className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                <i className="fa-solid fa-envelope-open-text"></i> View Email
                            </button>
                         )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" title="Unread"></div>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete notification"
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                )
            })}
          </ul>
        ) : (
           <div className="text-center py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50">
               <i className="fa-solid fa-bell-slash text-3xl text-slate-400 dark:text-slate-500"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
              {filter === 'unread' ? 'No Unread Notifications' : 'All Caught Up!'}
            </h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {filter === 'unread' ? 'You\'ve read all your notifications.' : 'You have no notifications.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;