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
    <header className="glass-card sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('home')} className="group flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <i className="fa-solid fa-city text-white text-lg"></i>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Civic Connect</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 tracking-wider uppercase">Smart City Platform</span>
              </div>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1.5 rounded-2xl shadow-xl shadow-blue-500/25 dark:shadow-blue-500/15 animated-gradient">
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
                    <NavLink view="about">About</NavLink>
                  </>
                )}
              </>
            ) : (
                <>
                    <NavLink view="home">Home</NavLink>
                    <NavLink view="about">About</NavLink>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                </>
            )}
          </div>
          <div className="flex items-center gap-3">
             {currentUser ? (
              <>
                <button 
                    onClick={() => navigateTo('notifications')} 
                    className="relative group text-slate-600 dark:text-slate-300 p-2.5 rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:scale-110"
                    aria-label="Notifications"
                >
                  <i className="fa-solid fa-bell text-xl group-hover:animate-[wiggle_0.5s_ease-in-out]"></i>
                  {unreadNotifications > 0 && (
                    <span className="notification-badge absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-lg shadow-red-500/30">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <div className="hidden md:block">
                  <button onClick={onLogout} className="group px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                    <i className="fa-solid fa-right-from-bracket group-hover:translate-x-0.5 transition-transform"></i>
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 mobile-menu-animate shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col items-stretch">
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
                    <NavLink view="about">About</NavLink>
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
                    <NavLink view="about">About</NavLink>
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