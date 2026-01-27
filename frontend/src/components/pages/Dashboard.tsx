import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  MapPin,
  Filter,
} from 'lucide-react';
import { CivicIssue, Status, Department } from '../../types';
import { getIssues } from '../../services/issueService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DEPARTMENT_CONFIG, STATUS_CONFIG, DEPARTMENTS } from '../../constants';

const Dashboard: React.FC = () => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIssues = () => {
      const allIssues = getIssues();
      setIssues(allIssues);
      setIsLoading(false);
    };
    loadIssues();
  }, []);

  const filteredIssues = selectedDepartment === 'all'
    ? issues
    : issues.filter(i => i.department === selectedDepartment);

  const stats = {
    total: filteredIssues.length,
    pending: filteredIssues.filter(i => i.status === Status.Pending).length,
    inProgress: filteredIssues.filter(i => i.status === Status.InProgress).length,
    resolved: filteredIssues.filter(i => i.status === Status.Resolved).length,
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const departmentStats = DEPARTMENTS.map(dept => ({
    department: dept,
    total: issues.filter(i => i.department === dept).length,
    resolved: issues.filter(i => i.department === dept && i.status === Status.Resolved).length,
    pending: issues.filter(i => i.department === dept && i.status === Status.Pending).length,
  }));

  const recentIssues = [...filteredIssues]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

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
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white mb-2">
            Public Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Real-time overview of civic issues and resolution progress
          </p>
        </motion.div>

        {/* Department Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-slate-500 hidden sm:block" />
            <button
              onClick={() => setSelectedDepartment('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedDepartment === 'all'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  selectedDepartment === dept
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Issues', value: stats.total, icon: BarChart3, color: 'primary' },
            { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'amber' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'blue' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'green' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/40 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-500`} />
                  </div>
                  {stat.label === 'Resolved' && stats.total > 0 && (
                    <span className="text-xs sm:text-sm font-semibold text-green-500">{resolutionRate}%</span>
                  )}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No issues reported yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Be the first to report an issue!</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {departmentStats.map((dept) => {
                      const percentage = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                      return (
                        <div key={dept.department} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
                              {dept.department}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                              {dept.resolved}/{dept.total} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  Recent Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentIssues.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No issues reported yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg ${DEPARTMENT_CONFIG[issue.department]?.bgColor || 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}>
                          <MapPin className={`w-5 h-5 ${DEPARTMENT_CONFIG[issue.department]?.color || 'text-slate-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 dark:text-white truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[issue.status]?.bgColor} ${STATUS_CONFIG[issue.status]?.color}`}>
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
