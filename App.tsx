
import React, { useState, useEffect } from 'react';
import { User, View, Department } from './types';
import { getCurrentUser, logout } from './services/authService';

import Header from './components/Header';
import Home from './components/Home';
import PublicDashboard from './components/PublicDashboard';
import IssueForm from './components/IssueForm';
import AdminDashboard from './components/AdminDashboard';
import Tracker from './components/Tracker';
import Login from './components/Login';
import SignUp from './components/SignUp';
import NotificationsPage from './components/NotificationsPage';
import BackButton from './components/BackButton';
import MyReports from './components/MyReports';
import AdminLogin from './components/AdminLogin';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DepartmentSelect from './components/DepartmentSelect';
import FeedbackPage from './components/FeedbackPage';

interface NavState {
  view: View;
  token?: string;
  message?: string;
  issueId?: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigation, setNavigation] = useState<NavState[]>([{ view: 'home' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDepartment, setSessionDepartment] = useState<Department | null>(null);

  const currentNavItem = navigation[navigation.length - 1];
  const currentView = currentNavItem.view;
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
        if (user.isAdmin && !user.department) {
            setNavigation([{ view: 'admin-department-select' }]);
        } else {
            setNavigation([{ view: user.isAdmin ? 'admin' : 'dashboard' }]);
        }
    }
    setIsLoading(false);
  }, []);

  const navigateTo = (view: View, options?: { token?: string; message?: string, issueId?: string }) => {
    // Prevent pushing the same view consecutively
    if (currentView === view && !options?.issueId) return;
    setNavigation(prev => [...prev, { view, ...options }]);
  };

  const navigateBack = () => {
    if (navigation.length > 1) {
      setNavigation(prev => prev.slice(0, -1));
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.isAdmin && !user.department) { // Super Admin
        setNavigation([{ view: 'admin-department-select' }]);
    } else { // Department Admin or regular user
        setNavigation([{ view: user.isAdmin ? 'admin' : 'dashboard' }]);
    }
  };

  const handleDepartmentSelect = (department: Department) => {
    setSessionDepartment(department);
    setNavigation([{ view: 'admin' }]);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setSessionDepartment(null);
    setNavigation([{ view: 'home' }]);
  };

  const handleSignUp = (user: User) => {
    setCurrentUser(user);
    setNavigation([{ view: 'dashboard' }]);
  };
  
  const unreadNotifications = currentUser?.notifications.filter(n => !n.read).length ?? 0;

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home navigateTo={navigateTo} currentUser={currentUser} />;
      case 'dashboard':
        return <PublicDashboard />;
      case 'report':
        return currentUser ? <IssueForm currentUser={currentUser} onIssueReported={() => setNavigation([{ view: 'my-reports' }])} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminDashboard currentUser={currentUser} selectedDepartment={sessionDepartment} /> : <Home navigateTo={navigateTo} currentUser={currentUser} />;
      case 'admin-department-select':
        return currentUser?.isAdmin ? <DepartmentSelect onDepartmentSelect={handleDepartmentSelect} /> : <Home navigateTo={navigateTo} currentUser={currentUser} />;
      case 'track':
        return <Tracker />;
      case 'login':
        return <Login onLogin={handleLogin} navigateTo={navigateTo} message={currentNavItem.message} />;
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'signup':
        return <SignUp onSignUp={handleSignUp} navigateTo={navigateTo} />;
      case 'notifications':
        return currentUser ? <NotificationsPage currentUser={currentUser} setCurrentUser={setCurrentUser} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'my-reports':
          return currentUser ? <MyReports currentUser={currentUser} navigateTo={navigateTo} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'forgot-password':
          return <ForgotPassword navigateTo={navigateTo} />;
      case 'reset-password':
          return currentNavItem.token ? <ResetPassword token={currentNavItem.token} navigateTo={navigateTo} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'feedback':
          return currentNavItem.issueId ? <FeedbackPage issueId={currentNavItem.issueId} navigateTo={navigateTo} /> : <MyReports currentUser={currentUser} navigateTo={navigateTo} />;
      default:
        return <Home navigateTo={navigateTo} currentUser={currentUser} />;
    }
  };
  
  const showBackButton = navigation.length > 1 && currentView !== 'home' && currentView !== 'dashboard' && currentView !== 'admin' && currentView !== 'admin-department-select';

  return (
    <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 animated-gradient min-h-screen text-slate-800 dark:text-slate-200 font-sans flex flex-col">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        navigateTo={navigateTo} 
        unreadNotifications={unreadNotifications}
        currentView={currentView}
      />
      <main className={`flex-grow ${currentView === 'home' ? '' : 'container mx-auto p-4 md:p-8'}`}>
        {isLoading ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-spinner animate-spin text-5xl text-blue-500"></i>
          </div>
        ) : (
          <>
            {showBackButton && <BackButton onClick={navigateBack} />}
            <div className="page-fade-in" key={currentView}>
              {renderView()}
            </div>
          </>
        )}
      </main>
      <footer className="bg-slate-100 dark:bg-slate-900 text-center p-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p className="mb-4">&copy; 2025 Civic Connect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;