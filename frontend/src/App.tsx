import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { User, Department, NotificationMessage, View } from './types';
import { getCurrentUser, logout } from './services/authService';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import Dashboard from './components/pages/Dashboard';
import ReportIssue from './components/pages/ReportIssue';
import MyReports from './components/pages/MyReports';
import TrackIssue from './components/pages/TrackIssue';
import { AdminDashboard, AdminLogin } from './components/pages/AdminDashboard';
import Notifications from './components/pages/Notifications';
import Leaderboard from './components/pages/Leaderboard';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';

// UI components
import Toast from './components/ui/Toast';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDepartment, setSessionDepartment] = useState<Department | null>(null);
  const [toast, setToast] = useState<NotificationMessage | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize user session
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);

    // Initialize dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'civic-session') {
        const user = getCurrentUser();
        setCurrentUser(user);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setSessionDepartment(null);
    navigate('/');
  };

  const handleDepartmentSelect = (department: Department | null) => {
    setSessionDepartment(department);
    navigate('/admin');
  };

  const showToast = (notification: NotificationMessage) => {
    setToast(notification);
    setTimeout(() => setToast(null), 5000);
  };

  const unreadNotifications = currentUser?.notifications?.filter(n => !n.isRead).length ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-500"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-primary-500 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type === 'Email' ? 'info' : 'success'}
          onClose={() => setToast(null)}
        />
      )}

      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadNotifications={unreadNotifications}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        selectedDepartment={sessionDepartment}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home currentUser={currentUser} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onSignUp={handleLogin} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/report"
            element={
              currentUser ? (
                <ReportIssue currentUser={currentUser} onSuccess={() => navigate('/my-reports')} />
              ) : (
                <Login onLogin={handleLogin} redirectMessage="Please login to report an issue" />
              )
            }
          />
          <Route
            path="/my-reports"
            element={
              currentUser ? (
                <MyReports currentUser={currentUser} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route path="/track" element={<TrackIssue />} />
          <Route path="/track/:issueId" element={<TrackIssue />} />
          <Route
            path="/admin"
            element={
              currentUser?.isAdmin ? (
                <AdminDashboard
                  currentUser={currentUser}
                  selectedDepartment={sessionDepartment}
                  onDepartmentSelect={handleDepartmentSelect}
                />
              ) : (
                <AdminLogin onLogin={handleLogin} />
              )
            }
          />
          <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
          <Route
            path="/notifications"
            element={
              currentUser ? (
                <Notifications currentUser={currentUser} onUserUpdate={setCurrentUser} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
