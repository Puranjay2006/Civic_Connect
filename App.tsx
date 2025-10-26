import React, { useState, useEffect } from 'react';
import { User, View, Department, NotificationMessage } from './types';
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
import Reports from './components/Reports';
import DepartmentLogin from './components/DepartmentLogin';
import PublicReports from './components/PublicReports';
import AdminRoleSelect from './components/AdminRoleSelect';
import Notification from './components/Notification';
import Modal from './components/Modal';
import SimulatedEmail from './components/SimulatedEmail';

interface NavState {
  view: View;
  token?: string;
  message?: string;
  issueId?: string;
}

interface SimulatedEmailState {
    recipient: string;
    subject: string;
    body: string;
    cta?: { text: string, link: string };
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigation, setNavigation] = useState<NavState[]>([{ view: 'home' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDepartment, setSessionDepartment] = useState<Department | null>(null);
  const [toast, setToast] = useState<NotificationMessage | null>(null);
  const [simulatedEmail, setSimulatedEmail] = useState<SimulatedEmailState | null>(null);
  
  const currentNavItem = navigation[navigation.length - 1];
  const currentView = currentNavItem.view;
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
        // App logic will handle navigation based on user state.
    }
    setIsLoading(false);

    const hash = window.location.hash.slice(1);
    if (hash.startsWith('reset-password/')) {
        const token = hash.split('/')[1];
        if (token) {
            setNavigation([{ view: 'reset-password', token }]);
        }
    }

  }, []);
  
  // Custom event listener for showing simulated emails
  useEffect(() => {
    const handleShowEmail = (event: Event) => {
        const { user, ...emailDetails } = (event as CustomEvent).detail;
        setSimulatedEmail(emailDetails);
        if (user) { // A new notification will have a user object to update state
            setCurrentUser(user as User);
        }
    };
    window.addEventListener('show-email-sim', handleShowEmail);
    return () => {
        window.removeEventListener('show-email-sim', handleShowEmail);
    };
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
                            if (newNotification.deliveryMethod === 'email') {
                                const emailEvent = new CustomEvent('show-email-sim', { 
                                    detail: {
                                        ...newNotification.emailContent,
                                        recipient: updatedCurrentUser.email
                                        // No user object here, as we will set it below
                                    }
                                });
                                window.dispatchEvent(emailEvent);
                            } else {
                                setToast(newNotification);
                            }
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
      case 'dashboard':
        return <PublicDashboard navigateTo={navigateTo} />;
      case 'report':
        return currentUser ? <IssueForm currentUser={currentUser} onIssueReported={() => setNavigation([{ view: 'my-reports' }])} setCurrentUser={setCurrentUser} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminDashboard currentUser={currentUser} selectedDepartment={sessionDepartment} navigateTo={navigateTo} /> : <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
      case 'admin-department-select':
        return currentUser?.isAdmin ? <DepartmentSelect onDepartmentSelect={handleDepartmentSelect} /> : <Home navigateTo={navigateTo} currentUser={currentUser} onLogout={handleLogout} />;
      case 'track':
        return <Tracker />;
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
      case 'notifications':
        return currentUser ? <NotificationsPage currentUser={currentUser} setCurrentUser={setCurrentUser} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'my-reports':
          return currentUser ? <MyReports currentUser={currentUser} navigateTo={navigateTo} setCurrentUser={setCurrentUser} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'forgot-password':
          return <ForgotPassword navigateTo={navigateTo} />;
      case 'reset-password':
          return currentNavItem.token ? <ResetPassword token={currentNavItem.token} navigateTo={navigateTo} /> : <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'feedback':
          return currentNavItem.issueId && currentUser ? <FeedbackPage issueId={currentNavItem.issueId} navigateTo={navigateTo} setCurrentUser={setCurrentUser} /> : <MyReports currentUser={currentUser} navigateTo={navigateTo} setCurrentUser={setCurrentUser} />;
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
      {simulatedEmail && (
          <Modal title="Simulated Email" onClose={() => setSimulatedEmail(null)}>
              <SimulatedEmail 
                {...simulatedEmail} 
                onCtaClick={(link) => {
                    if (link.startsWith('#')) {
                        const view = link.substring(1) as View;
                        if(view === 'reset-password') {
                            // special handling for reset password link with token
                             const token = simulatedEmail.cta?.link.split('/')[1];
                             navigateTo(view, { token });
                        } else {
                            navigateTo(view);
                        }
                    }
                    setSimulatedEmail(null);
                }}
              />
          </Modal>
      )}
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
      <footer className="bg-slate-100 dark:bg-slate-900 text-center p-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p className="mb-4">&copy; 2025 Civic Connect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;