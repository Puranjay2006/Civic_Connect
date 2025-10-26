import React, { useState, useEffect, useRef } from 'react';
import { User, View, Department } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  navigateTo: (view: View) => void;
  unreadNotifications: number;
  currentView: View;
  selectedDepartment: Department | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, navigateTo, unreadNotifications, currentView, selectedDepartment }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIssuesMenuOpen, setIsIssuesMenuOpen] = useState(false);
  const [isMobileIssuesOpen, setIsMobileIssuesOpen] = useState(false);
  const issuesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (issuesMenuRef.current && !issuesMenuRef.current.contains(event.target as Node)) {
        setIsIssuesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavLink: React.FC<{ view: View; children: React.ReactNode }> = ({ view, children }) => (
    <button
      onClick={() => {
        navigateTo(view);
        setIsMenuOpen(false);
      }}
      className={`px-5 py-2 rounded-full text-base font-medium transition-colors duration-300 ${
        currentView === view
          ? 'bg-white text-blue-600 shadow'
          : 'text-white hover:bg-white/25'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
              <i className="fa-solid fa-city text-blue-500"></i>
              <span>Civic Connect</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-700 p-1 rounded-full shadow-lg">
            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                   <>
                    <NavLink view="home">Home</NavLink>
                    <NavLink view="admin">Admin Dashboard</NavLink>
                    <NavLink view="reports">Reports</NavLink>
                    {/* Primary Department button for all admins */}
                    {currentUser.isAdmin && !currentUser.department && (
                      <button
                          onClick={() => navigateTo('admin-department-select')}
                          className="px-5 py-2 rounded-full text-base font-medium transition-colors duration-300 text-white hover:bg-white/25 flex items-center gap-2"
                      >
                          {selectedDepartment ? (
                            <>
                              <i className="fa-solid fa-right-left"></i>
                              <span>Change Dept</span>
                            </>
                          ) : (
                             <>
                              <i className="fa-solid fa-building-user"></i>
                              <span>Choose Dept</span>
                            </>
                          )}
                      </button>
                    )}
                     {currentUser.isAdmin && currentUser.department && (
                      <button
                          onClick={() => {
                            onLogout();
                            navigateTo('department-login');
                          }}
                          className="group px-5 py-2 rounded-full text-base font-medium transition-colors duration-300 text-white hover:bg-white/25 flex items-center justify-center gap-2"
                      >
                          <i className="fa-solid fa-right-left transition-transform"></i>
                          <span>Change Dept</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink view="home">Home</NavLink>
                     {/* Issues Dropdown */}
                    <div className="relative" ref={issuesMenuRef}>
                        <button
                            onClick={() => setIsIssuesMenuOpen(!isIssuesMenuOpen)}
                            className={`px-5 py-2 rounded-full text-base font-medium transition-colors duration-300 flex items-center gap-2 ${
                                ['report', 'my-reports', 'track'].includes(currentView)
                                ? 'bg-white text-blue-600 shadow'
                                : 'text-white hover:bg-white/25'
                            }`}
                        >
                            Issues and Reports
                            <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isIssuesMenuOpen ? 'transform rotate-180' : ''}`}></i>
                        </button>
                        {isIssuesMenuOpen && (
                            <div className="absolute top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden dropdown-fade-in">
                                <button onClick={() => { navigateTo('my-reports'); setIsIssuesMenuOpen(false); }} className="group w-full text-left flex items-center gap-3 px-5 py-4 text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white dark:hover:text-white transition-all duration-200 cursor-pointer">
                                    <span className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
                                        <i className="fa-solid fa-file-lines w-5 text-center"></i>
                                        <span>My Reports</span>
                                    </span>
                                </button>
                                <button onClick={() => { navigateTo('report'); setIsIssuesMenuOpen(false); }} className="group w-full text-left flex items-center gap-3 px-5 py-4 text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white dark:hover:text-white transition-all duration-200 cursor-pointer">
                                    <span className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
                                        <i className="fa-solid fa-bullhorn w-5 text-center"></i>
                                        <span>Report Issue</span>
                                    </span>
                                </button>
                                <button onClick={() => { navigateTo('track'); setIsIssuesMenuOpen(false); }} className="group w-full text-left flex items-center gap-3 px-5 py-4 text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white dark:hover:text-white transition-all duration-200 cursor-pointer">
                                    <span className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
                                        <i className="fa-solid fa-magnifying-glass-chart w-5 text-center"></i>
                                        <span>Track Issue</span>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                  </>
                )}
              </>
            ) : (
                <>
                    <NavLink view="home">Home</NavLink>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                </>
            )}
          </div>
          <div className="flex items-center gap-4">
             {currentUser ? (
              <>
                <button 
                    onClick={() => navigateTo('notifications')} 
                    className="relative text-slate-600 dark:text-slate-300 p-2 rounded-full transition-all duration-300 transform border-2 border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    aria-label="Notifications"
                >
                  <i className="fa-solid fa-bell text-xl"></i>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <div className="hidden md:block">
                  <button onClick={onLogout} className="px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-all duration-300 transform border-2 border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:border-red-400 dark:hover:border-red-500">
                    Logout
                  </button>
                </div>
              </>
            ) : null}

            <div className="md:hidden">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="z-50 p-2 rounded-full transition-all duration-300 transform border-2 border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    aria-label="Open menu"
                >
                    <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                        <span className="hamburger-top"></span>
                        <span className="hamburger-middle"></span>
                        <span className="hamburger-bottom"></span>
                    </div>
                </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mobile-menu-animate">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-stretch">
            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                  <>
                    <NavLink view="home">Home</NavLink>
                    <NavLink view="admin">Admin Dashboard</NavLink>
                    <NavLink view="reports">Reports</NavLink>
                    {currentUser.isAdmin && !currentUser.department && (
                        <button onClick={() => { navigateTo('admin-department-select'); setIsMenuOpen(false); }} className="w-full text-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 transform border-2 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600">
                           {selectedDepartment ? 'Change Department' : 'Choose Department'}
                        </button>
                    )}
                     {currentUser.isAdmin && currentUser.department && (
                      <button
                          onClick={() => {
                            onLogout();
                            navigateTo('department-login');
                            setIsMenuOpen(false);
                          }}
                           className="group w-full text-center px-4 py-2 rounded-lg text-base font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                      >
                          <i className="fa-solid fa-right-left"></i>
                          <span>Change Department</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink view="home">Home</NavLink>
                    {/* Issues Collapsible Section */}
                    <div>
                        <button 
                          onClick={() => setIsMobileIssuesOpen(!isMobileIssuesOpen)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-base font-medium transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            <span>Issues and Reports</span>
                            <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isMobileIssuesOpen ? 'transform rotate-180' : ''}`}></i>
                        </button>
                        {isMobileIssuesOpen && (
                            <div className="mt-1 pl-4 ml-4 border-l-2 border-slate-200 dark:border-slate-700 flex flex-col items-stretch space-y-1">
                                <NavLink view="my-reports">My Reports</NavLink>
                                <NavLink view="report">Report Issue</NavLink>
                                <NavLink view="track">Track Issue</NavLink>
                            </div>
                        )}
                    </div>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                  </>
                )}
                <button
                    onClick={() => {
                        navigateTo('notifications');
                        setIsMenuOpen(false);
                    }}
                    className="relative w-full text-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 transform border-2 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
                >
                    Notifications
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1/2 -translate-y-1/2 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadNotifications}
                        </span>
                    )}
                </button>
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full mt-2 text-center px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 transform border-2 border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:border-red-400 dark:hover:border-red-500">
                  Logout
                </button>
              </>
            ) : (
                <>
                    <NavLink view="home">Home</NavLink>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;