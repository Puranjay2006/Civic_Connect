import React, { useState, useEffect } from 'react';
import { User, View, Department, NotificationMessage } from './types';
import { getCurrentUser, logout } from './services/authService';

import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
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
import DepartmentSelect from './components/DepartmentSelect';
import FeedbackPage from './components/FeedbackPage';
import Reports from './components/Reports';
import DepartmentLogin from './components/DepartmentLogin';
import PublicReports from './components/PublicReports';
import AdminRoleSelect from './components/AdminRoleSelect';
import Notification from './components/Notification';
import Modal from './components/Modal';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

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
  const [toast, setToast] = useState<NotificationMessage | null>(null);
  
  const currentNavItem = navigation[navigation.length - 1];
  const currentView = currentNavItem.view;
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
        // App logic will handle navigation based on user state.
    }
    setIsLoading(false);
  }, []);

  // Custom event listener for showing toast notifications
  useEffect(() => {
    const handleShowToast = (event: Event) => {
        const { notification, user } = (event as CustomEvent).detail as { notification: NotificationMessage, user: User };
        setToast(notification);
        setCurrentUser(user);
    };
    window.addEventListener('show-toast', handleShowToast);
    return () => {
        window.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  // Real-time notification listener for cross-tab updates
  useEffect(() => {
    const syncUserState = (event: StorageEvent) => {
        if (event.key === 'civic-users' && event.newValue && currentUser) {
            try {
                const allUsers = JSON.parse(event.newValue) as User[];
                const updatedCurrentUser = allUsers.find(u => u.id === currentUser.id);

                if (updatedCurrentUser && JSON.stringify(updatedCurrentUser) !== JSON.stringify(currentUser)) {
                    // Check for new unread notifications to show a toast
                    if (updatedCurrentUser.notifications.length > currentUser.notifications.length) {
                        const newNotification = updatedCurrentUser.notifications[0]; // The newest is always at the start
                        
                        if (newNotification.read === false) { // only show toast for new, unread notifications
                            setToast(newNotification);
                        }
                    }
                    setCurrentUser(updatedCurrentUser);
                }
            } catch (e) {
                console.error("Error syncing user state across tabs", e);
            }
        }
    };

    window.addEventListener('storage', syncUserState);
    return () => {
        window.removeEventListener('storage', syncUserState);
    };
  }, [currentUser]);

  const navigateTo = (view: View, options?: { token?: string; message?: string, issueId?: string }) => {
    if (view === 'reset-password' && options?.token) {
        window.location.hash = `reset-password/${options.token}`;
    } else if (view !== 'login' && view !== 'signup') {
         window.location.hash = '';
    }

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
    setNavigation([{ view: 'home' }]);
  };

  const handleDepartmentSelect = (department: Department | null) => {
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
    setNavigation([{ view: 'home' }]);
  };
  
  const unreadNotifications = currentUser?.notifications.filter(n => !n.read).length ?? 0;

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
      case 'about':
        return <About navigateTo={navigateTo} />;
      case 'dashboard':
      case 'public-dashboard':
        return <PublicDashboard navigateTo={navigateTo} />;
      case 'report':
        return currentUser ? <IssueForm currentUser={currentUser} onIssueReported={() => setNavigation([{ view: 'my-reports' }])} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminDashboard currentUser={currentUser} selectedDepartment={sessionDepartment} navigateTo={navigateTo} /> : <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
      case 'admin-department-select':
        return currentUser?.isAdmin ? <DepartmentSelect onDepartmentSelect={handleDepartmentSelect} /> : <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
      case 'track':
        return <Tracker currentUser={currentUser} />;
      case 'login':
        return <Login onLogin={handleLogin} navigateTo={navigateTo} message={currentNavItem.message} />;
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} />;
      case 'admin-role-select':
        return <AdminRoleSelect navigateTo={navigateTo} />;
      case 'department-login':
        return <DepartmentLogin onLogin={handleLogin} />;
      case 'signup':
        return <SignUp onSignUp={handleSignUp} navigateTo={navigateTo} />;
      case 'forgot-password':
        return <ForgotPassword navigateTo={navigateTo} />;
      case 'reset-password':
        return currentNavItem.token ? <ResetPassword token={currentNavItem.token} navigateTo={navigateTo} /> : <ForgotPassword navigateTo={navigateTo} />;
      case 'notifications':
        return currentUser ? <NotificationsPage currentUser={currentUser} setCurrentUser={setCurrentUser} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'my-reports':
          return currentUser ? <MyReports currentUser={currentUser} navigateTo={navigateTo} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'feedback':
          return currentNavItem.issueId && currentUser ? <FeedbackPage issueId={currentNavItem.issueId} navigateTo={navigateTo} /> : <MyReports currentUser={currentUser} navigateTo={navigateTo} />;
      case 'reports':
          return currentUser?.isAdmin ? <Reports currentUser={currentUser} selectedDepartment={sessionDepartment} /> : <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
      case 'public-reports':
          return <PublicReports />;
      default:
        return <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
    }
  };
  
  const showBackButton = navigation.length > 1 && currentView !== 'home';

  return (
    <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 animated-gradient min-h-screen text-slate-800 dark:text-slate-200 font-sans flex flex-col">
      {toast && <Notification message={toast.message} onClose={() => setToast(null)} />}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        navigateTo={navigateTo} 
        unreadNotifications={unreadNotifications}
        currentView={currentView}
        selectedDepartment={sessionDepartment}
      />
      <main className={`flex-grow ${currentView === 'home' ? '' : 'container mx-auto p-4 md:p-8'}`}>
        {isLoading ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-spinner animate-spin text-5xl text-blue-500"></i>
          </div>
        ) : (
          <>
            {showBackButton && <BackButton onClick={navigateBack} />}
            <div className="page-fade-in" key={currentView + (currentNavItem.issueId || '')}>
              {renderView()}
            </div>
          </>
        )}
      </main>
      <footer className="relative overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-slate-900 dark:to-slate-950 text-center p-8 text-sm border-t border-slate-200/50 dark:border-slate-800/50">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          {/* Logo and tagline */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <i className="fa-solid fa-city text-white text-sm"></i>
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Civic Connect</span>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 mb-4">Empowering communities through smart civic engagement.</p>
          
          <p className="text-slate-400 dark:text-slate-500">&copy; 2026 Civic Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;