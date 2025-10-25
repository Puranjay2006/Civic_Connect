import React, { useState } from 'react';
import { CivicIssue, Status, Category, View } from '../types';
import CustomSelect from './CustomSelect';
// FIX: Import STATUSES constant for strongly-typed select options.
import { STATUSES } from '../constants';

interface RatingProps {
  onRate: (rating: number) => void;
  currentRating: number;
}

const Rating: React.FC<RatingProps> = ({ onRate, currentRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = (rating: number) => {
    onRate(rating);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-3xl transition-all duration-200 transform hover:scale-125 focus:outline-none"
        >
          <i
            className={`fa-solid fa-star ${
              (hoverRating || currentRating) >= star
                ? 'text-yellow-400'
                : 'text-slate-300 dark:text-slate-500'
            }`}
          ></i>
        </button>
      ))}
    </div>
  );
};


interface IssueCardProps {
  issue: CivicIssue;
  isAdmin: boolean;
  onStatusChange?: (id: string, status: Status) => void;
  isMyReport?: boolean;
  onRateIssue?: (id: string, rating: number) => void;
  onProvideFeedback?: (id: string) => void;
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

const IssueCard: React.FC<IssueCardProps> = ({ issue, isAdmin, onStatusChange, isMyReport, onRateIssue, onProvideFeedback }) => {
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group">
      <div className="overflow-hidden rounded-t-xl">
        <img src={issue.photo} alt={issue.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 gap-2">
          <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusStyle.bg} ${currentStatusStyle.text}`}>
            <i className={`fa-solid ${currentStatusStyle.icon}`}></i>
            {issue.status}
          </span>
          <div className={`text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-right`}>
             <i className={`fa-solid ${categoryIcons[issue.category]}`}></i>
             <span className="truncate">{issue.category}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight">{issue.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-grow">{issue.description}</p>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-2">
                <div className="flex items-center gap-2" title={issue.id}>
                    <i className="fa-solid fa-id-badge w-4 text-center"></i>
                    <span className="font-mono">{issue.id.substring(0, 15)}...</span>
                    <button onClick={handleCopy} title="Copy ID" className="text-slate-400 hover:text-blue-500">
                      <i className={`fa-solid transition-all ${copied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                    </button>
                </div>
                <div className="flex items-center gap-2" title={new Date(issue.createdAt).toLocaleString()}>
                    <i className="fa-solid fa-clock"></i>
                    <span>{timeSince(issue.createdAt)}</span>
                </div>
            </div>
            <div className="grid grid-cols-[1rem_1fr] gap-x-2 gap-y-1 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <i className="fa-solid fa-building-user text-center mt-0.5"></i>
                <p className="min-w-0">Dept: <span className="font-medium text-slate-600 dark:text-slate-300">{issue.department}</span></p>

                {issue.acknowledgedAt && (
                    <>
                        <i className="fa-solid fa-check text-center mt-0.5" title={new Date(issue.acknowledgedAt).toLocaleString()}></i>
                        <p>Acknowledged: {timeSince(issue.acknowledgedAt)}</p>
                    </>
                )}

                {issue.resolvedAt && (
                    <>
                        <i className="fa-solid fa-check-double text-center mt-0.5" title={new Date(issue.resolvedAt).toLocaleString()}></i>
                        <p>Resolved: {timeSince(issue.resolvedAt)}</p>
                    </>
                )}

                <i className="fa-solid fa-user text-center mt-0.5"></i>
                <p className="min-w-0 break-words">Reported by: {issue.username ? `${issue.username} (${issue.userEmail})` : issue.userEmail}</p>
            </div>
        </div>

        {isAdmin && onStatusChange && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <label htmlFor={`status-${issue.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Update Status</label>
            <CustomSelect
              id={`status-${issue.id}`}
              value={issue.status}
              onChange={(value) => onStatusChange(issue.id, value as Status)}
              options={STATUSES.map(s => ({ value: s, label: s }))}
            />
          </div>
        )}
        {isMyReport && issue.status === Status.Resolved && onRateIssue && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                {issue.rating ? (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">You rated:</p>
                            <div className="flex justify-center text-yellow-400 text-xl">
                                {[...Array(issue.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                                {[...Array(5 - issue.rating)].map((_, i) => <i key={i} className="fa-regular fa-star text-slate-300 dark:text-slate-600"></i>)}
                            </div>
                        </div>
                        {onProvideFeedback && (
                            <button onClick={() => onProvideFeedback(issue.id)} className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                Provide Detailed Feedback &rarr;
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rate our service</label>
                        <Rating onRate={(rating) => onRateIssue(issue.id, rating)} currentRating={0} />
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;