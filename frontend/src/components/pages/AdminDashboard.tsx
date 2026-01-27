import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Users, ChevronRight, Loader, Building2, AlertCircle } from 'lucide-react';
import { User, Department, Status, CivicIssue } from '../../types';
import { loginAsSuperAdmin, loginAsDepartmentAdmin } from '../../services/authService';
import { getIssues, updateIssueStatus } from '../../services/issueService';
import { DEPARTMENTS, STATUS_CONFIG, DEPARTMENT_CONFIG, STATUSES } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface AdminLoginProps {
  onLogin: (user: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'select' | 'super' | 'department'>('select');
  const [passkey, setPasskey] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = loginAsSuperAdmin(passkey);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid passkey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const user = loginAsDepartmentAdmin(selectedDepartment, passkey);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid passkey');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card>
          <CardContent className="p-8">
            {mode === 'select' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                    Admin Portal
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Select your access level
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setMode('super')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800 dark:text-white">Super Admin</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full system access</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setMode('department')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800 dark:text-white">Department Admin</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Department-specific access</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </button>
                </div>
              </>
            )}

            {mode === 'super' && (
              <>
                <button
                  onClick={() => { setMode('select'); setError(null); setPasskey(''); }}
                  className="mb-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  ← Back
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Key className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                    Super Admin Login
                  </h1>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSuperAdminLogin} className="space-y-6">
                  <Input
                    label="Super Admin Passkey"
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter passkey"
                    leftIcon={<Key className="w-5 h-5" />}
                    required
                  />
                  <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
                    Access Dashboard
                  </Button>
                </form>
              </>
            )}

            {mode === 'department' && (
              <>
                <button
                  onClick={() => { 
                    if (selectedDepartment) {
                      setSelectedDepartment(null);
                    } else {
                      setMode('select');
                    }
                    setError(null); 
                    setPasskey(''); 
                  }}
                  className="mb-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  ← Back
                </button>

                {!selectedDepartment ? (
                  <>
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                        Select Department
                      </h1>
                    </div>

                    <div className="grid gap-3">
                      {DEPARTMENTS.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => setSelectedDepartment(dept)}
                          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                        >
                          <div className={`w-10 h-10 rounded-lg ${DEPARTMENT_CONFIG[dept]?.bgColor} flex items-center justify-center`}>
                            <Building2 className={`w-5 h-5 ${DEPARTMENT_CONFIG[dept]?.color}`} />
                          </div>
                          <span className="font-medium text-slate-800 dark:text-white">{dept}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${DEPARTMENT_CONFIG[selectedDepartment]?.bgColor} flex items-center justify-center`}>
                        <Building2 className={`w-8 h-8 ${DEPARTMENT_CONFIG[selectedDepartment]?.color}`} />
                      </div>
                      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                        {selectedDepartment} Admin
                      </h1>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleDepartmentLogin} className="space-y-6">
                      <Input
                        label="Department Passkey"
                        type="password"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        placeholder="Enter department passkey"
                        leftIcon={<Key className="w-5 h-5" />}
                        required
                      />
                      <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
                        Access Dashboard
                      </Button>
                    </form>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

interface AdminDashboardProps {
  currentUser: User;
  selectedDepartment: Department | null;
  onDepartmentSelect: (department: Department | null) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, selectedDepartment, onDepartmentSelect }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'all'>('all');

  useEffect(() => {
    const loadIssues = () => {
      const allIssues = getIssues();
      const filteredByDept = selectedDepartment
        ? allIssues.filter(i => i.department === selectedDepartment)
        : allIssues;
      setIssues(filteredByDept.sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    };
    loadIssues();
  }, [selectedDepartment]);

  const handleStatusChange = (issueId: string, newStatus: Status) => {
    const updated = updateIssueStatus(issueId, newStatus, currentUser);
    if (updated) {
      setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
    }
  };

  const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === Status.Pending).length,
    inProgress: issues.filter(i => i.status === Status.InProgress).length,
    resolved: issues.filter(i => i.status === Status.Resolved).length,
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
            Admin Dashboard
            {selectedDepartment && (
              <span className="text-primary-500"> - {selectedDepartment}</span>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage and resolve civic issues
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'primary' },
            { label: 'Pending', value: stats.pending, color: 'amber' },
            { label: 'In Progress', value: stats.inProgress, color: 'blue' },
            { label: 'Resolved', value: stats.resolved, color: 'green' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 text-center">
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {(['all', ...STATUSES] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Issues' : status}
            </button>
          ))}
        </motion.div>

        {/* Issues Table */}
        <Card>
          <CardContent className="p-0">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 dark:text-slate-400">No issues found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Issue</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Department</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{issue.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">#{issue.id.slice(-6)}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-sm ${DEPARTMENT_CONFIG[issue.department]?.bgColor} ${DEPARTMENT_CONFIG[issue.department]?.color}`}>
                            {issue.department}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[issue.status]?.bgColor} ${STATUS_CONFIG[issue.status]?.color}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value as Status)}
                            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { AdminLogin, AdminDashboard };
export default AdminDashboard;
