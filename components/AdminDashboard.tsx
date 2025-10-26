

import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status, Category, User, Department, View } from '../types';
import { getIssues, updateIssueStatus } from '../services/issueService';
import { ISSUE_CATEGORIES, STATUSES } from '../constants';
import IssueCard from './IssueCard';
import Notification from './Notification';
import CustomSelect from './CustomSelect';
import StatCard from './StatCard';

interface AdminDashboardProps {
  currentUser: User;
  selectedDepartment: Department | null;
  navigateTo: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, selectedDepartment, navigateTo }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<CivicIssue[]>([]);
  const [filters, setFilters] = useState<{ status: Status | 'all'; category: Category | 'all' }>({
    status: 'all',
    category: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadIssues = () => {
    const allIssues = getIssues().sort((a, b) => b.createdAt - a.createdAt);
    setIssues(allIssues);
  };
  
  useEffect(() => {
    loadIssues();
  }, []);

  const departmentForView = currentUser.department || selectedDepartment;

  const departmentIssues = useMemo(() => {
    // Super admin uses session department, dept admin uses their own assigned dept
    if (departmentForView) {
        return issues.filter(issue => issue.department === departmentForView);
    }
    // Super admin before selecting a department (shows all)
    return issues;
  }, [issues, departmentForView]);


  useEffect(() => {
    let tempIssues = [...departmentIssues];
    
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
  }, [departmentIssues, filters, searchQuery]);

  const handleStatusChange = (id: string, status: Status) => {
    const { updatedIssue } = updateIssueStatus(id, status, currentUser);
    if (updatedIssue) {
      loadIssues();
      // The notification is now handled by the authService and App.tsx toast listener.
      // setNotification(`Status for issue #${id.slice(-6)} updated to ${status}.`);
    }
  };
  
  const stats = useMemo(() => {
    return departmentIssues.reduce((acc, issue) => {
      acc.total++;
      if (issue.status === Status.Resolved) acc.resolved++;
      if (issue.status === Status.InProgress) acc.inProgress++;
      if (issue.status === Status.Pending) acc.pending++;
      return acc;
    }, { total: 0, resolved: 0, inProgress: 0, pending: 0 });
  }, [departmentIssues]);

  const dashboardTitle = departmentForView
    ? `${departmentForView} Department ${currentUser.department ? '' : '(Admin View)'}`.trim()
    : 'Manage All Reported Issues';

  return (
    <div className="space-y-10">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} type="success" />}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {dashboardTitle}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.total} icon="fa-bullhorn" color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending} icon="fa-hourglass-start" color="bg-yellow-500" />
        <StatCard title="In Progress" value={stats.inProgress} icon="fa-person-digging" color="bg-orange-500" />
        <StatCard title="Resolved" value={stats.resolved} icon="fa-check-circle" color="bg-green-500" />
      </div>

      {departmentForView && (
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Deep Dive into Your Data</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-lg mx-auto">Access detailed analytics, performance trends, and AI-powered insights for the {departmentForView} department.</p>
              <button
                onClick={() => navigateTo('reports')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-base flex items-center justify-center gap-3 mx-auto"
              >
                <i className="fa-solid fa-chart-pie"></i>
                View Performance Analytics
              </button>
          </div>
      )}

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
                 <div className="w-full md:w-48">
                    <CustomSelect
                      id="status-filter"
                      value={filters.status}
                      onChange={(value) => setFilters(prev => ({...prev, status: value as Status | 'all'}))}
                      options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
                    />
                 </div>
                 <div className="w-full md:w-48">
                    <CustomSelect
                      id="category-filter"
                      value={filters.category}
                      onChange={(value) => setFilters(prev => ({...prev, category: value as Category | 'all'}))}
                      options={[{ value: 'all', label: 'All Categories' }, ...ISSUE_CATEGORIES.map(c => ({ value: c, label: c }))]}
                    />
                 </div>
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Reports ({filteredIssues.length})</h3>
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