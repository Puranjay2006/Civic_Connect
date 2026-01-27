

import React, { useState, useEffect, useMemo } from 'react';
import { CivicIssue, Status, Category, User, Department, View } from '../types';
import { getIssues, updateIssueStatus, deleteIssue } from '../services/issueService';
import { ISSUE_CATEGORIES, STATUSES } from '../constants';
import IssueCard from './IssueCard';
import Notification from './Notification';
import CustomSelect from './CustomSelect';
import StatCard from './StatCard';
import IssueMap from './IssueMap';

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

  const handleDelete = (issueId: string) => {
    const success = deleteIssue(issueId, currentUser.id, true);
    if (success) {
      loadIssues();
      setNotification(`Issue #${issueId.slice(-6)} has been deleted.`);
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
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
          <i className="fa-solid fa-shield-halved text-purple-500"></i>
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Admin Dashboard</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          {dashboardTitle}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.total} icon="fa-bullhorn" color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending} icon="fa-hourglass-start" color="bg-yellow-500" />
        <StatCard title="In Progress" value={stats.inProgress} icon="fa-person-digging" color="bg-orange-500" />
        <StatCard title="Resolved" value={stats.resolved} icon="fa-check-circle" color="bg-green-500" />
      </div>

      {/* Issues Map for Admin */}
      <div className="premium-card p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                <i className="fa-solid fa-map-location-dot text-white"></i>
              </span>
              {departmentForView ? `${departmentForView} Issues Map` : 'All Issues Map'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-13">
              Click markers to view issue details
            </p>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Resolved</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden">
          <IssueMap issues={departmentIssues} height="350px" showFilters={true} />
        </div>
      </div>

      {departmentForView && (
          <div className="premium-card p-8 rounded-2xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <i className="fa-solid fa-chart-pie text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Deep Dive Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">Access detailed analytics, performance trends, and AI-powered insights for the {departmentForView} department.</p>
              <button
                onClick={() => navigateTo('reports')}
                className="group bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-3.5 px-8 rounded-xl hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 text-base flex items-center justify-center gap-3 mx-auto"
              >
                <i className="fa-solid fa-chart-pie"></i>
                View Performance Analytics
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
          </div>
      )}

      <div className="premium-card p-5 rounded-2xl space-y-4 overflow-visible" style={{ minHeight: '180px' }}>
        <div className="flex flex-col md:flex-row items-center gap-4 overflow-visible relative z-50">
            <div className="relative flex-grow w-full">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                    id="search-input"
                    type="text"
                    placeholder="Search by ID, title, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-base border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200"
                />
            </div>
            <div className="flex w-full md:w-auto gap-4 overflow-visible relative z-50">
                 <div className="w-full md:w-48 relative z-50">
                    <CustomSelect
                      id="status-filter"
                      value={filters.status}
                      onChange={(value) => setFilters(prev => ({...prev, status: value as Status | 'all'}))}
                      options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
                    />
                 </div>
                 <div className="w-full md:w-48 relative z-50">
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
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <i className="fa-solid fa-list text-white text-sm"></i>
          </span>
          Reports <span className="text-lg font-normal text-slate-500">({filteredIssues.length})</span>
        </h3>
        {filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} isAdmin={true} onStatusChange={handleStatusChange} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 premium-card rounded-2xl">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 mb-4">
               <i className="fa-solid fa-inbox text-3xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Matching Reports</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;