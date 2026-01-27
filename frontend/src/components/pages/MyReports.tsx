import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, Star, MessageSquare, Loader } from 'lucide-react';
import { User, CivicIssue, Status } from '../../types';
import { getIssuesByUser, addRatingToIssue, addFeedbackToIssue } from '../../services/issueService';
import { Card, CardContent } from '../ui/Card';
import { STATUS_CONFIG, DEPARTMENT_CONFIG } from '../../constants';
import Button from '../ui/Button';

interface MyReportsProps {
  currentUser: User;
}

const MyReports: React.FC<MyReportsProps> = ({ currentUser }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'all'>('all');

  useEffect(() => {
    const loadIssues = () => {
      const userIssues = getIssuesByUser(currentUser.id);
      setIssues(userIssues.sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    };
    loadIssues();
  }, [currentUser.id]);

  const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  const handleRating = (issue: CivicIssue, stars: number) => {
    const updated = addRatingToIssue(issue.id, stars);
    if (updated) {
      setIssues(prev => prev.map(i => i.id === issue.id ? updated : i));
      setSelectedIssue(null);
    }
  };

  const handleFeedback = (issue: CivicIssue) => {
    if (!feedback.trim()) return;
    const updated = addFeedbackToIssue(issue.id, feedback);
    if (updated) {
      setIssues(prev => prev.map(i => i.id === issue.id ? updated : i));
      setFeedback('');
      setSelectedIssue(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white mb-2">
            My Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Track and manage your reported issues
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {(['all', Status.Pending, Status.InProgress, Status.Resolved] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Reports' : status}
            </button>
          ))}
        </motion.div>

        {/* Reports List */}
        {filteredIssues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              No reports found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {filter === 'all' ? "You haven't submitted any reports yet" : `No ${filter} reports`}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="overflow-visible">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Photo */}
                      {issue.photo && (
                        <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={issue.photo} alt={issue.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {issue.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[issue.status]?.bgColor} ${STATUS_CONFIG[issue.status]?.color}`}>
                            {issue.status}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                          {issue.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className={`px-2 py-1 rounded-lg ${DEPARTMENT_CONFIG[issue.department]?.bgColor}`}>
                            {issue.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            #{issue.id.slice(-6)}
                          </span>
                        </div>

                        {/* Rating section for resolved issues */}
                        {issue.status === Status.Resolved && !issue.rating && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Rate this resolution:
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRating(issue, star)}
                                  className="p-1 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= rating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                    onMouseEnter={() => setRating(star)}
                                    onMouseLeave={() => setRating(0)}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show rating if already rated */}
                        {issue.rating && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Your rating:</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= issue.rating!
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
