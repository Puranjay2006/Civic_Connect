import React, { useState, useEffect } from 'react';
import { View, CivicIssue } from '../types';
import { getIssueById, addFeedbackToIssue } from '../services/issueService';
import Notification from './Notification';

interface FeedbackPageProps {
  issueId: string;
  navigateTo: (view: View) => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ issueId, navigateTo }) => {
  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const foundIssue = getIssueById(issueId);
    if (foundIssue) {
      setIssue(foundIssue);
      setFeedback(foundIssue.feedback || '');
    } else {
      setError('Could not find the specified issue.');
    }
  }, [issueId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
        setError("Please provide your feedback before submitting.");
        return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
        addFeedbackToIssue(issueId, feedback);
        setNotification("Your feedback has been submitted successfully!");
        setTimeout(() => {
            navigateTo('my-reports');
        }, 2000);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setIsLoading(false);
    }
  };

  if (!issue) {
    return (
      <div className="text-center py-10">
        <i className="fa-solid fa-spinner animate-spin text-4xl text-blue-500"></i>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Provide Detailed Feedback</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Your thoughts on the resolution of "<span className="font-semibold">{issue.title}</span>" are valuable.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Feedback
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              placeholder="How was your experience? What could be improved?"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition"
            />
          </div>
          
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Submitting...</> : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;