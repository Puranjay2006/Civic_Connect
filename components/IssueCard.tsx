import React, { useState } from 'react';
import { CivicIssue, Status, Category, View } from '../types';
import CustomSelect from './CustomSelect';
import { STATUSES } from '../constants';
import { summarizeIssue } from '../services/geminiService';

// Static map thumbnail using OpenStreetMap
const getStaticMapUrl = (lat: number, lng: number) => {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=300x150&markers=${lat},${lng},red-pushpin`;
};

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
  onDelete?: (id: string) => void;
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

const IssueCard: React.FC<IssueCardProps> = ({ issue, isAdmin, onStatusChange, isMyReport, onRateIssue, onProvideFeedback, onDelete }) => {
  const currentStatusStyle = statusStyles[issue.status];
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(issue.id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const result = await summarizeIssue(issue.description);
      setSummary(result);
    } catch (error) {
      setSummaryError("Failed to get summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="premium-card rounded-2xl transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col group">
      <div className="overflow-hidden relative rounded-t-2xl">
        <img src={issue.photo} alt={issue.title} className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        {/* Status badge on image */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md ${
            issue.status === Status.Pending ? 'bg-yellow-500/90 text-white' : 
            issue.status === Status.InProgress ? 'bg-blue-500/90 text-white' : 
            'bg-green-500/90 text-white'
          } shadow-lg`}>
            <i className={`fa-solid ${currentStatusStyle.icon}`}></i>
            {issue.status}
          </span>
        </div>
        {/* Category badge on image */}
        <div className="absolute bottom-3 left-3">
          <div className={`text-xs font-bold text-white flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-slate-900/60 shadow-lg`}>
             <i className={`fa-solid ${categoryIcons[issue.category]}`}></i>
             <span>{issue.category}</span>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow overflow-visible">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{issue.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow line-clamp-3">{issue.description}</p>
        
        {/* AI Summary Section */}
        {isAdmin && (
          <div className="mb-4">
            {summary || isSummarizing || summaryError ? (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl text-sm border border-blue-100 dark:border-blue-800/50">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-xs"></i>
                  </span>
                  <span>AI Summary</span>
                </p>
                {isSummarizing ? (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    <span>Analyzing...</span>
                  </div>
                ) : summaryError ? (
                  <p className="text-red-500">{summaryError}</p>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{summary}</p>
                )}
              </div>
            ) : (
              <button
                onClick={handleSummarize}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Summarize with AI</span>
              </button>
            )}
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-700/50">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg" title={issue.id}>
                    <i className="fa-solid fa-fingerprint w-4 text-center text-blue-500"></i>
                    <span className="font-mono text-slate-600 dark:text-slate-300">{issue.id.substring(0, 12)}...</span>
                    <button onClick={handleCopy} title="Copy ID" className="text-slate-400 hover:text-blue-500 transition-colors">
                      <i className={`fa-solid transition-all ${copied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                    </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg" title={new Date(issue.createdAt).toLocaleString()}>
                    <i className="fa-solid fa-clock text-orange-500"></i>
                    <span>{timeSince(issue.createdAt)}</span>
                </div>
            </div>
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-700/50 text-sm">
                <div className="flex items-start gap-2.5">
                    <i className="fa-solid fa-building-user text-purple-500 mt-0.5 w-4 text-center flex-shrink-0"></i>
                    <p className="text-slate-600 dark:text-slate-400">Dept: <span className="font-semibold text-slate-700 dark:text-slate-200">{issue.department}</span></p>
                </div>

                {issue.location && issue.location.lat !== 0 && issue.location.lng !== 0 && (
                    <div className="flex items-start gap-2.5">
                        <i className="fa-solid fa-location-dot text-red-500 mt-0.5 w-4 text-center flex-shrink-0"></i>
                        <a 
                            href={`https://www.openstreetmap.org/?mlat=${issue.location.lat}&mlon=${issue.location.lng}#map=16/${issue.location.lat}/${issue.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            View on OpenStreetMap →
                        </a>
                    </div>
                )}

                {issue.manualAddress && (
                    <div className="flex items-start gap-2.5">
                        <i className="fa-solid fa-map-pin text-red-500 mt-0.5 w-4 text-center flex-shrink-0"></i>
                        <p className="text-slate-600 dark:text-slate-400">Address: <span className="font-medium text-slate-700 dark:text-slate-200">{issue.manualAddress}</span></p>
                    </div>
                )}

                {issue.acknowledgedAt && (
                    <div className="flex items-start gap-2.5">
                        <i className="fa-solid fa-circle-check text-blue-500 mt-0.5 w-4 text-center flex-shrink-0" title={new Date(issue.acknowledgedAt).toLocaleString()}></i>
                        <p className="text-slate-600 dark:text-slate-400">Acknowledged: <span className="font-medium">{timeSince(issue.acknowledgedAt)}</span></p>
                    </div>
                )}

                {issue.resolvedAt && (
                    <div className="flex items-start gap-2.5">
                        <i className="fa-solid fa-badge-check text-green-500 mt-0.5 w-4 text-center flex-shrink-0" title={new Date(issue.resolvedAt).toLocaleString()}></i>
                        <p className="text-slate-600 dark:text-slate-400">Resolved: <span className="font-medium text-green-600 dark:text-green-400">{timeSince(issue.resolvedAt)}</span></p>
                    </div>
                )}

                <div className="flex items-start gap-2.5">
                    <i className="fa-solid fa-user-circle text-slate-400 mt-0.5 w-4 text-center flex-shrink-0"></i>
                    <p className="text-slate-600 dark:text-slate-400">By: <span className="font-medium text-slate-700 dark:text-slate-200">{issue.username ? issue.username : issue.userEmail}</span></p>
                </div>

                {/* User Feedback Display */}
                {issue.feedback && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-start gap-2.5">
                            <i className="fa-solid fa-comment-dots text-indigo-500 mt-0.5 w-4 text-center flex-shrink-0"></i>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Feedback:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-200 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800/50 italic">"{issue.feedback}"</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {isAdmin && onStatusChange && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 pb-2 overflow-visible">
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

        {/* Delete Button */}
        {onDelete && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {showDeleteConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  Are you sure you want to delete this issue?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onDelete(issue.id);
                      setShowDeleteConfirm(false);
                    }}
                    className="flex-1 py-2 px-4 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-trash mr-2"></i>
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 px-4 text-sm font-medium text-red-600 dark:text-red-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 border border-red-300 dark:border-red-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-trash-can"></i>
                Delete Issue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;