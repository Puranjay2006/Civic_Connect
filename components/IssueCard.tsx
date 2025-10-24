
import React, { useState } from 'react';
import { CivicIssue, Status, Category } from '../types';

interface IssueCardProps {
  issue: CivicIssue;
  isAdmin: boolean;
  onStatusChange?: (id: string, status: Status) => void;
}

const statusStyles: { [key in Status]: { bg: string; text: string; icon: string } } = {
  [Status.Pending]: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', icon: 'fa-hourglass-start' },
  [Status.InProgress]: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300', icon: 'fa-person-digging' },
  [Status.Resolved]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', icon: 'fa-check-circle' },
};

const categoryIcons: { [key in Category]: string } = {
    [Category.Pothole]: 'fa-road-barrier',
    [Category.Garbage]: 'fa-trash-can',
    [Category.Streetlight]: 'fa-lightbulb',
    [Category.Other]: 'fa-question-circle'
};

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

const IssueCard: React.FC<IssueCardProps> = ({ issue, isAdmin, onStatusChange }) => {
  const currentStatusStyle = statusStyles[issue.status];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(issue.id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group">
      <div className="overflow-hidden">
        <img src={issue.photo} alt={issue.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusStyle.bg} ${currentStatusStyle.text}`}>
            <i className={`fa-solid ${currentStatusStyle.icon}`}></i>
            {issue.status}
          </span>
          <div className={`text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2`}>
             <i className={`fa-solid ${categoryIcons[issue.category]}`}></i>
             <span>{issue.category}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight">{issue.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-grow">{issue.description}</p>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-id-badge w-4 text-center"></i>
                    <span className="font-mono" title={issue.id}>{issue.id.substring(0, 15)}...</span>
                    <button onClick={handleCopy} title="Copy ID" className="text-slate-400 hover:text-blue-500">
                      <i className={`fa-solid transition-all ${copied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                    </button>
                </div>
                <p className="text-right">{timeSince(issue.createdAt)}</p>
            </div>
            <p><i className="fa-solid fa-user w-4 text-center"></i> Reported by: {issue.username ? `${issue.username} (${issue.userEmail})` : issue.userEmail}</p>
        </div>

        {isAdmin && onStatusChange && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <label htmlFor={`status-${issue.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Update Status</label>
            <select
              id={`status-${issue.id}`}
              value={issue.status}
              onChange={(e) => onStatusChange(issue.id, e.target.value as Status)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {Object.values(Status).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;