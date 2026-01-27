import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, CheckCircle, AlertCircle, Loader, Bot } from 'lucide-react';
import { CivicIssue } from '../../types';
import { getIssueById } from '../../services/issueService';
import { Card, CardContent } from '../ui/Card';
import { STATUS_CONFIG, DEPARTMENT_CONFIG } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TrackIssue: React.FC = () => {
  const { issueId: urlIssueId } = useParams();
  const [issueId, setIssueId] = useState(urlIssueId || '');
  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueId.trim()) return;

    setIsLoading(true);
    setNotFound(false);
    setIssue(null);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundIssue = getIssueById(issueId.trim());
    
    if (foundIssue) {
      setIssue(foundIssue);
      // Generate chat message
      if (foundIssue.status === 'Pending') {
        setChatMessage(`Hi! I found your report "${foundIssue.title}". It's currently pending review and is in our queue. Our team will acknowledge it soon!`);
      } else if (foundIssue.status === 'In Progress') {
        setChatMessage(`Great news! Your report "${foundIssue.title}" is being actively worked on by our ${foundIssue.department} department. We'll notify you once it's resolved.`);
      } else {
        setChatMessage(`Wonderful! Your report "${foundIssue.title}" has been resolved by our ${foundIssue.department} department. Thank you for helping improve our community!`);
      }
    } else {
      setNotFound(true);
      setChatMessage("I couldn't find a report with that ID. Please double-check and try again, or submit a new report if needed.");
    }

    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <AlertCircle className="w-6 h-6" />;
      case 'In Progress':
        return <Loader className="w-6 h-6 animate-spin" />;
      case 'Resolved':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white mb-2">
              Track Your Issue
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Enter your issue ID to check the current status
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  placeholder="Enter Issue ID (e.g., issue-1234567-abc12)"
                  leftIcon={<Search className="w-5 h-5" />}
                />
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Assistant Response */}
          {chatMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white mb-1">Casey - AI Assistant</p>
                      <p className="text-slate-600 dark:text-slate-300">{chatMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Issue Details */}
          {issue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                      #{issue.id}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_CONFIG[issue.status]?.bgColor} ${STATUS_CONFIG[issue.status]?.color}`}>
                      {getStatusIcon(issue.status)}
                      {issue.status}
                    </span>
                  </div>

                  {/* Issue Info */}
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                    {issue.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {issue.description}
                  </p>

                  {/* Photo */}
                  {issue.photo && (
                    <div className="mb-6 rounded-xl overflow-hidden">
                      <img src={issue.photo} alt={issue.title} className="w-full h-64 object-cover" />
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className={`w-10 h-10 rounded-lg ${DEPARTMENT_CONFIG[issue.department]?.bgColor} flex items-center justify-center`}>
                        <MapPin className={`w-5 h-5 ${DEPARTMENT_CONFIG[issue.department]?.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Department</p>
                        <p className="font-semibold text-slate-800 dark:text-white">{issue.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Reported On</p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Timeline</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Reported on {new Date(issue.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {issue.acknowledgedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            Acknowledged on {new Date(issue.acknowledgedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {issue.resolvedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            Resolved on {new Date(issue.resolvedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Not Found */}
          {notFound && !issue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Issue Not Found
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  We couldn't find an issue with that ID. Please check and try again.
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackIssue;
