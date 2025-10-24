import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status, Category } from '../types';
import { getIssues, updateIssueStatus } from '../services/issueService';
import { ISSUE_CATEGORIES, STATUSES } from '../constants';
import IssueCard from './IssueCard';
import Notification from './Notification';

const AdminDashboard: React.FC = () => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<CivicIssue[]>([]);
  const [filters, setFilters] = useState<{ status: Status | 'all'; category: Category | 'all' }>({
    status: 'all',
    category: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = () => {
    const allIssues = getIssues().sort((a, b) => b.createdAt - a.createdAt);
    setIssues(allIssues);
  };

  useEffect(() => {
    let tempIssues = [...issues];
    
    if (filters.status !== 'all') {
      tempIssues = tempIssues.filter(issue => issue.status === filters.status);
    }
    if (filters.category !== 'all') {
      tempIssues = tempIssues.filter(issue => issue.category === filters.category);
    }
    
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        tempIssues = tempIssues.filter(issue => 
            issue.title.toLowerCase().includes(lowercasedQuery) ||
            issue.description.toLowerCase().includes(lowercasedQuery) ||
            issue.id.toLowerCase().includes(lowercasedQuery)
        );
    }

    setFilteredIssues(tempIssues);
  }, [issues, filters, searchQuery]);

  const handleStatusChange = (id: string, status: Status) => {
    const updatedIssue = updateIssueStatus(id, status);
    if (updatedIssue) {
      loadIssues();
      setNotification(`Status for issue #${id.slice(-6)} updated to ${status}.`);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const stats = useMemo(() => {
    return issues.reduce((acc, issue) => {
      acc.total++;
      if (issue.status === Status.Resolved) acc.resolved++;
      if (issue.status === Status.InProgress) acc.inProgress++;
      if (issue.status === Status.Pending) acc.pending++;
      return acc;
    }, { total: 0, resolved: 0, inProgress: 0, pending: 0 });
  }, [issues]);

  const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-5`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <i className={`fa-solid ${icon} text-2xl text-white`}></i>
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} type="success" />}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Manage and track all reported civic issues.</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.total} icon="fa-bullhorn" color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending} icon="fa-hourglass-start" color="bg-yellow-500" />
        <StatCard title="In Progress" value={stats.inProgress} icon="fa-person-digging" color="bg-orange-500" />
        <StatCard title="Resolved" value={stats.resolved} icon="fa-check-circle" color="bg-green-500" />
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                    id="search-input"
                    type="text"
                    placeholder="Search by ID, title, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-base border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                />
            </div>
            <div className="flex w-full md:w-auto gap-4">
                 <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange} className="w-full md:w-48 pl-3 pr-10 py-2 text-base border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg">
                  <option value="all">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select id="category-filter" name="category" value={filters.category} onChange={handleFilterChange} className="w-full md:w-48 pl-3 pr-10 py-2 text-base border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg">
                  <option value="all">All Categories</option>
                  {ISSUE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All Reports ({filteredIssues.length})</h3>
        {filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} isAdmin={true} onStatusChange={handleStatusChange} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50">
               <i className="fa-solid fa-folder-open text-2xl text-slate-500 dark:text-slate-400"></i>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">No Matching Reports</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">No issues match the current search and filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;